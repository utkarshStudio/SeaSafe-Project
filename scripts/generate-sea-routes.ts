/**
 * Offline route-geometry generator & coastline validator.
 *
 * Regenerates the `waypoints` array for every route in every built-in
 * scenario JSON file so it:
 *   1. follows real maritime shipping lanes (searoute-js's maritime
 *      network, built from actual sea-lane/coastline data), and
 *   2. is cross-validated against real coastline polygon data (Natural
 *      Earth 1:50m land), with any residual land intersection detected
 *      and automatically repaired by re-routing a local detour through
 *      open water.
 *
 * This is a one-time / as-needed *build* step — run manually with
 * `npm run routes:generate` whenever a scenario's hand-placed anchor
 * points change. It is intentionally NOT wired into `dev`/`build`, and
 * the coastline dataset it uses is never imported by any client-facing
 * module, so it has zero effect on `npm run dev` compile/startup time or
 * client bundle size. At runtime the app only ever reads the static,
 * pre-validated waypoints already baked into these JSON files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import { sanitizeWaypoints } from "../lib/routeSanitizer";
import { seaSegment, type LonLat } from "../lib/seaRoute";
import { createLandMask } from "../lib/landMask";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENARIOS_DIR = path.join(__dirname, "../lib/scenarios");
const LAND_DATA_PATH = path.join(__dirname, "../lib/data/land-50m.geojson");

const SCENARIO_FILES = [
  "red-sea.json",
  "hormuz.json",
  "malacca.json",
];

const land = JSON.parse(
  fs.readFileSync(LAND_DATA_PATH, "utf8"),
) as FeatureCollection<Polygon | MultiPolygon>;
const landMask = createLandMask(land);

function midpoint(a: LonLat, b: LonLat): LonLat {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// Pushes a point out perpendicular to the a→b segment — used to try
// nudging a land-crossing sub-segment's midpoint out over open water
// before re-threading each half through real sea lanes.
function perpendicularOffset(
  a: LonLat,
  b: LonLat,
  distanceDeg: number,
  side: 1 | -1,
): LonLat {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * distanceDeg * side;
  const ny = (dx / len) * distanceDeg * side;
  const mid = midpoint(a, b);
  return [mid[0] + nx, mid[1] + ny];
}

const CORRECTION_OFFSETS_DEG = [0.05, 0.1, 0.2, 0.4, 0.8, 1.5, 3, 6, 10];

const VALIDATION_SAMPLES = 40;

function segmentIsClean(points: LonLat[]): boolean {
  for (let i = 0; i < points.length - 1; i += 1) {
    if (
      landMask.landHitsOnSegment(points[i], points[i + 1], VALIDATION_SAMPLES)
        .length > 0
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Detects and repairs a land-crossing sub-segment [a, b] by trying a
 * series of open-water detour points at increasing distances on either
 * side of the segment, re-threading through real sea lanes on each half.
 * Returns the repaired point list, or null if no candidate cleared the
 * coastline check.
 */
function repairSegment(a: LonLat, b: LonLat): LonLat[] | null {
  for (const distance of CORRECTION_OFFSETS_DEG) {
    for (const side of [1, -1] as const) {
      const detour = perpendicularOffset(a, b, distance, side);
      if (landMask.isOverLand(detour)) continue;
      const candidate = [...seaSegment(a, detour), ...seaSegment(detour, b).slice(1)];
      if (segmentIsClean(candidate)) return candidate;
    }
  }
  return null;
}

function validateAndRepair(points: LonLat[], context: string): LonLat[] {
  const result: LonLat[] = [points[0]];
  let repairs = 0;
  let unresolved = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (landMask.landHitsOnSegment(a, b, VALIDATION_SAMPLES).length === 0) {
      result.push(b);
      continue;
    }

    const repaired = repairSegment(a, b);
    if (repaired) {
      for (const p of repaired.slice(1)) result.push(p);
      repairs += 1;
    } else {
      // No automatic detour cleared the coastline check. Keep the
      // original segment but fail loudly — this needs a manual anchor
      // point added to the scenario JSON rather than silently shipping a
      // line over land.
      console.warn(
        `  \u26a0 COULD NOT AUTO-REPAIR land crossing near [${a}] \u2192 [${b}] (${context}) — add a manual anchor point here`,
      );
      result.push(b);
      unresolved += 1;
    }
  }

  if (repairs > 0) {
    console.log(`  \u21b3 auto-repaired ${repairs} land-crossing segment(s)`);
  }
  if (unresolved > 0) {
    process.exitCode = 1;
  }
  return result;
}

function main() {
  for (const file of SCENARIO_FILES) {
    const filePath = path.join(SCENARIOS_DIR, file);
    const scenario = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`\n${scenario.id ?? file}`);

    for (const route of scenario.routes) {
      const before = (route.waypoints as LonLat[]).length;
      const dense = sanitizeWaypoints(route.waypoints as LonLat[]);
      const validated = validateAndRepair(dense, `${scenario.id}/${route.id}`);
      console.log(`  ${route.id}: ${before} \u2192 ${validated.length} points`);
      route.waypoints = validated;
    }

    fs.writeFileSync(filePath, `${JSON.stringify(scenario, null, 2)}\n`, "utf8");
  }

  if (process.exitCode === 1) {
    console.log(
      "\nFinished with unresolved land crossings — see \u26a0 warnings above.",
    );
  } else {
    console.log(
      "\nDone. All built-in scenario routes follow real sea lanes and passed coastline validation.",
    );
  }
}

main();
