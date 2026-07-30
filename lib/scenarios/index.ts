import redSea from "./red-sea.json";
import hormuz from "./hormuz.json";
import malacca from "./malacca.json";
import extremeWeather from "./extreme-weather.json";
import type { Scenario } from "@/lib/types";

// Each route's `waypoints` here already follows real maritime shipping
// lanes and has been cross-validated against real coastline polygon data
// — see scripts/generate-sea-routes.ts. That validation runs offline via
// `npm run routes:generate`, not at app startup or render time, so this
// module stays a plain, zero-cost static import: no routing computation
// happens here, and searoute-js is never pulled into this code path.
export const SCENARIOS: Scenario[] = [
  redSea,
  hormuz,
  malacca,
  extremeWeather,
] as unknown as Scenario[];

export const SCENARIOS_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export const DEFAULT_SCENARIO_ID = "red-sea";

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS_BY_ID[id];
}
