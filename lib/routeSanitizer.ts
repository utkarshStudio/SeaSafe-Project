import { seaSegment, type LonLat } from "@/lib/seaRoute";

const LOOP_TOLERANCE_DEG = 0.05;

/**
 * Collapses "there-and-back" artifacts that can appear when two stitched
 * sea-route segments don't quite line up at the shared waypoint (searoute
 * briefly backtracks to a nearby lane before continuing on). If a point
 * nearly matches one already visited, every point in between is dropped —
 * turning a spurious loop into a clean line.
 */
function collapseLoops(points: LonLat[]): LonLat[] {
  const result: LonLat[] = [];
  for (const point of points) {
    let loopStart = -1;
    for (let i = result.length - 1; i >= 0; i -= 1) {
      const candidate = result[i];
      if (
        Math.abs(candidate[0] - point[0]) < LOOP_TOLERANCE_DEG &&
        Math.abs(candidate[1] - point[1]) < LOOP_TOLERANCE_DEG
      ) {
        loopStart = i;
        break;
      }
    }
    if (loopStart >= 0) {
      result.length = loopStart + 1;
    } else {
      result.push(point);
    }
  }
  return result;
}

/**
 * Threads a sparse list of hand-placed anchor points into a dense path
 * that follows real, navigable maritime lanes end-to-end. Each consecutive
 * pair is routed through the searoute-js maritime network (built from
 * actual shipping-lane/coastline data, not straight-line geometry), so the
 * rendered line never cuts across a landmass between two anchors — and any
 * stitching seam artifact between segments is cleaned up afterward.
 *
 * This is the single place route geometry gets validated against water
 * boundaries; both the built-in scenario routes and custom-planner routes
 * go through it before they ever reach the map.
 */
export function sanitizeWaypoints(points: LonLat[]): LonLat[] {
  if (points.length < 2) return points;

  const stitched: LonLat[] = [points[0]];
  for (let i = 0; i < points.length - 1; i += 1) {
    const segment = seaSegment(points[i], points[i + 1]);
    for (const point of segment.slice(1)) {
      stitched.push(point);
    }
  }

  return collapseLoops(stitched);
}
