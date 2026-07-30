import type { Chokepoint, Route } from "@/lib/types";
import type {
  WeatherFetchResult,
  WeatherHazardType,
  WeatherHazardZone,
  WeatherViewportBounds,
} from "@/lib/weather/types";

export const WEATHER_POLL_INTERVAL_MS = 5 * 60 * 1000;

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const MARINE_ENDPOINT = "https://marine-api.open-meteo.com/v1/marine";
const FETCH_TIMEOUT_MS = 5500;

interface WeatherServiceInput {
  scenarioId: string;
  routes: Route[];
  activeRouteId: string;
  chokepoint: Chokepoint;
  viewportBounds?: WeatherViewportBounds;
}

interface WeatherSamplePoint {
  id: string;
  center: [number, number];
  priority: number;
}

interface ForecastPayload {
  hourly?: {
    time?: string[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    precipitation?: number[];
    pressure_msl?: number[];
  };
}

interface MarinePayload {
  hourly?: {
    wave_height?: number[];
    swell_wave_height?: number[];
    wave_direction?: number[];
  };
}

interface SampleWeather {
  sample: WeatherSamplePoint;
  windSpeedKts?: number;
  windDirectionDeg?: number;
  rainfallMm?: number;
  pressureMb?: number;
  waveHeightM?: number;
  waveDirectionDeg?: number;
  updatedAt: string;
}

const weatherCache = new Map<string, { result: WeatherFetchResult; timestamp: number }>();

export async function fetchWeatherHazards(
  input: WeatherServiceInput,
): Promise<WeatherFetchResult> {
  const cacheKey = `${input.scenarioId}`;
  const now = Date.now();
  const cached = weatherCache.get(cacheKey);

  // Return cached weather data if it is less than 10 minutes old
  if (cached && (now - cached.timestamp < 10 * 60 * 1000)) {
    return cached.result;
  }

  const updatedAt = new Date().toISOString();
  const samples = buildWeatherSamplingPoints(input).slice(0, 9);

  if (samples.length === 0) {
    return {
      hazards: fallbackHazards(input, updatedAt),
      status: "fallback",
      message: "No route sampling points available; using deterministic weather model.",
      updatedAt,
    };
  }

  const settled = await Promise.allSettled(
    samples.map((sample) => fetchSampleWeather(sample, updatedAt)),
  );
  const successfulSamples = settled
    .filter((result): result is PromiseFulfilledResult<SampleWeather> => {
      return result.status === "fulfilled";
    })
    .map((result) => result.value);

  if (successfulSamples.length === 0) {
    return {
      hazards: fallbackHazards(input, updatedAt),
      status: "fallback",
      message: "Live weather temporarily unavailable.",
      updatedAt,
    };
  }

  const liveHazards = dedupeHazards(
    successfulSamples.flatMap(convertSampleToHazards),
  );

  const result: WeatherFetchResult = {
    hazards: liveHazards.slice(0, 12),
    status: "live",
    message: undefined,
    updatedAt,
  };

  weatherCache.set(cacheKey, { result, timestamp: now });
  return result;
}

export function buildWeatherSamplingPoints({
  routes,
  activeRouteId,
  chokepoint,
  viewportBounds,
}: WeatherServiceInput): WeatherSamplePoint[] {
  const activeRoute =
    routes.find((route) => route.id === activeRouteId) ??
    routes.find((route) => route.isCurrent) ??
    routes[0];
  const routePoints = sampleRoute(activeRoute?.waypoints ?? []);
  const viewportPoints = viewportBounds ? sampleViewport(viewportBounds) : [];
  const points: WeatherSamplePoint[] = [
    ...routePoints.map((center, index) => ({
      id: `route-${index}`,
      center,
      priority: 1,
    })),
    {
      id: "chokepoint",
      center: chokepoint.position,
      priority: 2,
    },
    ...viewportPoints.map((center, index) => ({
      id: `viewport-${index}`,
      center,
      priority: 3,
    })),
  ];

  return uniquePoints(points)
    .filter((point) => isFinitePoint(point.center))
    .sort((a, b) => a.priority - b.priority);
}

function sampleRoute(waypoints: [number, number][]): [number, number][] {
  if (waypoints.length <= 5) return waypoints;
  const indexes = new Set([
    0,
    Math.floor(waypoints.length * 0.25),
    Math.floor(waypoints.length * 0.5),
    Math.floor(waypoints.length * 0.75),
    waypoints.length - 1,
  ]);
  return Array.from(indexes).map((index) => waypoints[index]);
}

function sampleViewport(bounds: WeatherViewportBounds): [number, number][] {
  const center: [number, number] = [
    (bounds.west + bounds.east) / 2,
    (bounds.south + bounds.north) / 2,
  ];
  const width = Math.abs(bounds.east - bounds.west);
  const height = Math.abs(bounds.north - bounds.south);
  if (width > 90 || height > 70) return [center];
  return [
    center,
    [bounds.west + width * 0.25, bounds.south + height * 0.3],
    [bounds.east - width * 0.25, bounds.north - height * 0.3],
  ];
}

async function fetchSampleWeather(
  sample: WeatherSamplePoint,
  updatedAt: string,
): Promise<SampleWeather> {
  const [lng, lat] = sample.center;
  const [forecast, marine] = await Promise.all([
    fetchJson<ForecastPayload>(
      `${FORECAST_ENDPOINT}?latitude=${lat}&longitude=${lng}&hourly=wind_speed_10m,wind_direction_10m,precipitation,pressure_msl&wind_speed_unit=kn&forecast_days=2&timezone=UTC`,
    ),
    fetchJson<MarinePayload>(
      `${MARINE_ENDPOINT}?latitude=${lat}&longitude=${lng}&hourly=wave_height,swell_wave_height,wave_direction&forecast_days=2&timezone=UTC`,
    ).catch(() => undefined),
  ]);

  const windSpeedKts = maxNumber(forecast.hourly?.wind_speed_10m);
  const windDirectionDeg = dominantNumber(forecast.hourly?.wind_direction_10m);
  const rainfallMm = maxNumber(forecast.hourly?.precipitation);
  const pressureMb = minNumber(forecast.hourly?.pressure_msl);
  const waveHeightM = Math.max(
    maxNumber(marine?.hourly?.wave_height) ?? 0,
    maxNumber(marine?.hourly?.swell_wave_height) ?? 0,
  );
  const waveDirectionDeg = dominantNumber(marine?.hourly?.wave_direction);

  return {
    sample,
    windSpeedKts,
    windDirectionDeg,
    rainfallMm,
    pressureMb,
    waveHeightM: waveHeightM > 0 ? waveHeightM : undefined,
    waveDirectionDeg,
    updatedAt,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`weather ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function convertSampleToHazards(sample: SampleWeather): WeatherHazardZone[] {
  const hazards: WeatherHazardZone[] = [];
  const wind = sample.windSpeedKts ?? 0;
  const pressure = sample.pressureMb ?? 1015;
  const wave = sample.waveHeightM ?? 0;
  const rain = sample.rainfallMm ?? 0;

  // Render actual weather conditions using realistic maritime thresholds:
  // Wind:
  if (wind > 45) {
    hazards.push(hazardFromSample(sample, "storm", 4));
  } else if (wind > 28) {
    hazards.push(hazardFromSample(sample, "wind", 3));
  } else if (wind > 14) {
    hazards.push(hazardFromSample(sample, "wind", 2));
  }

  // Wave / Swell height:
  if (wave > 4.0) {
    hazards.push(hazardFromSample(sample, "swell", 4));
  } else if (wave > 2.0) {
    hazards.push(hazardFromSample(sample, "swell", 3));
  } else if (wave > 1.0) {
    hazards.push(hazardFromSample(sample, "swell", 2));
  }

  // Precipitation/Rain:
  if (rain > 6.0) {
    hazards.push(hazardFromSample(sample, "rain", 4));
  } else if (rain > 1.5) {
    hazards.push(hazardFromSample(sample, "rain", 3));
  } else if (rain > 0.1) {
    hazards.push(hazardFromSample(sample, "rain", 2));
  }

  return hazards;
}

function hazardFromSample(
  sample: SampleWeather,
  type: WeatherHazardType,
  severity: 1 | 2 | 3 | 4 | 5,
): WeatherHazardZone {
  const metadata = {
    windSpeedKts: sample.windSpeedKts,
    waveHeightM: sample.waveHeightM,
    rainfallMm: sample.rainfallMm,
    pressureMb: sample.pressureMb,
  };
  const size = hazardSize(type, severity);
  const rotation = sample.windDirectionDeg ?? sample.waveDirectionDeg ?? 35;
  const center = sample.sample.center;

  return {
    id: `live-${type}-${sample.sample.id}-${Math.round(center[0] * 10)}-${Math.round(center[1] * 10)}`,
    type,
    severity,
    label: hazardLabel(type, severity),
    center,
    polygon: makeEllipse(center, size.lng, size.lat, rotation),
    movement: {
      directionDeg: rotation,
      speedKts: Math.max(8, Math.round((sample.windSpeedKts ?? 25) * 0.18)),
    },
    metadata,
    updatedAt: sample.updatedAt,
  };
}

function fallbackHazards(
  input: WeatherServiceInput,
  updatedAt: string,
): WeatherHazardZone[] {
  return [];
}

function isWeatherScenario(input: WeatherServiceInput) {
  return (
    input.chokepoint.status === "extreme_weather" ||
    /cyclone|storm|weather/i.test(input.chokepoint.name)
  );
}

function dedupeHazards(hazards: WeatherHazardZone[]) {
  const keep: WeatherHazardZone[] = [];
  for (const hazard of hazards) {
    const existing = keep.find(
      (candidate) =>
        candidate.type === hazard.type &&
        distanceDeg(candidate.center, hazard.center) < 2.2,
    );
    if (!existing) {
      keep.push(hazard);
    } else if (hazard.severity > existing.severity) {
      keep.splice(keep.indexOf(existing), 1, hazard);
    }
  }
  return keep.sort((a, b) => b.severity - a.severity);
}

function hazardSize(type: WeatherHazardType, severity: number) {
  const base = {
    cyclone: { lng: 2.0, lat: 2.6 },
    storm: { lng: 1.7, lat: 1.9 },
    rain: { lng: 1.4, lat: 1.6 },
    swell: { lng: 2.2, lat: 1.7 },
    wind: { lng: 1.8, lat: 1.5 },
  }[type];
  const multiplier = 0.72 + severity * 0.14;
  return {
    lng: base.lng * multiplier,
    lat: base.lat * multiplier,
  };
}

function hazardLabel(type: WeatherHazardType, severity: number) {
  const severityLabel = severity >= 5 ? "Extreme" : severity >= 4 ? "Severe" : "Heavy";
  switch (type) {
    case "cyclone":
      return `${severityLabel} Cyclone Signature`;
    case "storm":
      return `${severityLabel} Storm Cell`;
    case "rain":
      return `${severityLabel} Rain Band`;
    case "swell":
      return `${severityLabel} Swell Field`;
    case "wind":
      return `${severityLabel} Wind Corridor`;
  }
}

function makeEllipse(
  center: [number, number],
  radiusLng: number,
  radiusLat: number,
  rotationDeg: number,
  steps = 36,
): [number, number][] {
  const rotation = (rotationDeg * Math.PI) / 180;
  const points: [number, number][] = [];
  for (let i = 0; i < steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const x = Math.cos(theta) * radiusLng;
    const y = Math.sin(theta) * radiusLat;
    const lng = center[0] + x * Math.cos(rotation) - y * Math.sin(rotation);
    const lat = center[1] + x * Math.sin(rotation) + y * Math.cos(rotation);
    points.push([roundCoord(lng), roundCoord(lat)]);
  }
  points.push(points[0]);
  return points;
}

function uniquePoints(points: WeatherSamplePoint[]) {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${Math.round(point.center[0] * 2)}:${Math.round(point.center[1] * 2)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function boundsContainCapeStorm(bounds: WeatherViewportBounds) {
  return (
    bounds.west <= 24 &&
    bounds.east >= 12 &&
    bounds.south <= -32 &&
    bounds.north >= -42
  );
}

function maxNumber(values?: number[]) {
  const numeric = values?.filter((value) => Number.isFinite(value)) ?? [];
  return numeric.length > 0 ? Math.max(...numeric.slice(0, 48)) : undefined;
}

function minNumber(values?: number[]) {
  const numeric = values?.filter((value) => Number.isFinite(value)) ?? [];
  return numeric.length > 0 ? Math.min(...numeric.slice(0, 48)) : undefined;
}

function dominantNumber(values?: number[]) {
  const numeric = values?.filter((value) => Number.isFinite(value)) ?? [];
  if (numeric.length === 0) return undefined;
  return numeric[Math.min(12, numeric.length - 1)];
}

function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000;
}

function distanceDeg(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function isFinitePoint(point: [number, number]) {
  return Number.isFinite(point[0]) && Number.isFinite(point[1]);
}
