import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from "geojson";
import type { LonLat } from "@/lib/seaRoute";

const KNOWN_NAVIGABLE_CORRIDORS: Array<{
  name: string;
  bbox: [number, number, number, number];
}> = [
  { name: "Suez Canal", bbox: [32.0, 29.8, 32.6, 31.35] },
  { name: "Panama Canal", bbox: [-80.1, 8.85, -79.4, 9.6] },
  { name: "Kiel Canal", bbox: [9.0, 53.85, 10.2, 54.4] },
  { name: "Strait of Gubal", bbox: [32.8, 27.3, 34.6, 28.8] },
  { name: "Lesser Antilles passage", bbox: [-65, 10, -58, 18] },
  { name: "Rotterdam approach", bbox: [3.95, 51.83, 4.25, 52.0] },
  { name: "Strait of Gibraltar", bbox: [-6.2, 35.5, -5.2, 36.1] },
  { name: "Zhoushan Archipelago", bbox: [121.0, 28.0, 122.5, 30.2] },
  { name: "Taiwan Strait (Fujian coast)", bbox: [119.0, 24.8, 120.5, 26.0] },
  { name: "Kyushu / Tanegashima channel", bbox: [128.5, 30.5, 131.5, 31.8] },
];

function inKnownCorridor(lon: number, lat: number): boolean {
  return KNOWN_NAVIGABLE_CORRIDORS.some(
    ({ bbox: [minLon, minLat, maxLon, maxLat] }) =>
      lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat,
  );
}

export type LandMask = {
  isOverLand: (lonLat: LonLat) => boolean;
  /** Samples along a segment and returns every sampled point that lands on land. */
  landHitsOnSegment: (a: LonLat, b: LonLat, samples?: number) => LonLat[];
};

export function createLandMask(
  land: FeatureCollection<Polygon | MultiPolygon>,
): LandMask {
  const features = land.features as Feature<Polygon | MultiPolygon>[];

  function isOverLand([lon, lat]: LonLat): boolean {
    if (inKnownCorridor(lon, lat)) return false;
    const p = point([lon, lat]);
    for (const feature of features) {
      if (booleanPointInPolygon(p, feature)) return true;
    }
    return false;
  }

  function landHitsOnSegment(a: LonLat, b: LonLat, samples = 12): LonLat[] {
    // If the segment appears to span more than 180° of longitude, it's
    // almost certainly a short hop across the antimeridian (180°/-180°)
    // rather than a genuine trip most of the way around the Earth.
    // Interpolating the raw longitudes naively would sweep the *wrong*
    // way around the globe (e.g. through Africa for a Western-Pacific
    // hop) — so we unwrap b's longitude onto a's side of the date line
    // before interpolating, then wrap the sampled points back.
    let bLon = b[0];
    if (bLon - a[0] > 180) bLon -= 360;
    else if (a[0] - bLon > 180) bLon += 360;

    const hits: LonLat[] = [];
    for (let i = 1; i < samples; i += 1) {
      const t = i / samples;
      let lon = a[0] + (bLon - a[0]) * t;
      const lat = a[1] + (b[1] - a[1]) * t;
      if (lon > 180) lon -= 360;
      else if (lon < -180) lon += 360;
      if (isOverLand([lon, lat])) hits.push([lon, lat]);
    }
    return hits;
  }

  return { isOverLand, landHitsOnSegment };
}
