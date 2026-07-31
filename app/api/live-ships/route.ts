import { NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { interpolatePosition } from "@/lib/compliance/maskingEngine";
import type { Vessel } from "@/lib/types";
import fs from "fs";
import path from "path";

const MOCK_SHIP_DATA = [
  { name: "MSC Daniela", type: "Container Ship", imo: "9399002" },
  { name: "Maersk McKinney", type: "Container Ship", imo: "9632064" },
  { name: "CMA CGM Marco Polo", type: "Container Ship", imo: "9524815" },
  { name: "OOCL Hong Kong", type: "Container Ship", imo: "9776107" },
  { name: "TI Oceania", type: "VLCC Tanker", imo: "9246645" },
  { name: "Ever Given", type: "Container Ship", imo: "9811000" },
  { name: "Euronav Oceania", type: "Crude Tanker", imo: "9246657" },
  { name: "CMA CGM Antoine", type: "Container Ship", imo: "9776412" },
  { name: "One Apus", type: "Container Ship", imo: "9827293" },
];

function calculateHeading(p1: [number, number], p2: [number, number]): number {
  const dLng = p2[0] - p1[0];
  const dLat = p2[1] - p1[1];
  let angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenarioId");
  const routeId = searchParams.get("routeId");

  if (!scenarioId || !routeId) {
    return NextResponse.json(
      { error: "Missing scenarioId or routeId parameter" },
      { status: 400 }
    );
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const route = scenario.routes.find((r) => r.id === routeId);
  if (!route) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  const waypoints = route.waypoints;
  if (waypoints.length < 2) {
    return NextResponse.json({ ships: [] });
  }

  // Attempt to read the live AIS collector cache file
  let liveCacheVessels: any[] = [];
  const cachePath = path.join(process.cwd(), "public/data/live-ais-cache.json");
  if (fs.existsSync(cachePath)) {
    try {
      const cacheData = fs.readFileSync(cachePath, "utf-8");
      liveCacheVessels = JSON.parse(cacheData) || [];
    } catch (e) {
      console.error("Failed to parse live AIS cache file:", e);
    }
  }

  // We distribute 12 ships along the route waypoints.
  const timeSec = Date.now() / 1000;
  
  // Distribute 12 ships at regular intervals along the route (from 8% to 94% progress)
  const baseProgresses = [
    0.08, 0.16, 0.24, 0.32, 0.40, 0.48, 
    0.56, 0.64, 0.72, 0.80, 0.88, 0.94
  ];
  
  const ships: Vessel[] = baseProgresses.map((baseProg, idx) => {
    // Alternate speed factors to keep them moving dynamically
    const speed = 0.0003 + ((idx % 4) * 0.0001);
    const progress = (baseProg + timeSec * speed) % 1.0;

    const posCurrent = interpolatePosition(waypoints, progress);
    const posAhead = interpolatePosition(waypoints, Math.min(1.0, progress + 0.002));
    const heading = calculateHeading(posCurrent, posAhead);

    // Pick real vessel details from cache if available, otherwise mock data
    const liveVessel = liveCacheVessels.length > 0 
      ? liveCacheVessels[idx % liveCacheVessels.length] 
      : null;

    if (liveVessel) {
      return {
        id: `live-ship-${routeId}-${idx}-${liveVessel.mmsi}`,
        name: liveVessel.name,
        imo: liveVessel.imo ? String(liveVessel.imo) : `MMSI ${liveVessel.mmsi}`,
        type: liveVessel.type || "Cargo Vessel",
        position: posCurrent, // Distributed along the route waypoints!
        headingDeg: heading,
        cargoManifest: [
          { item: "General Cargo (Live AIS)", tons: 15000 + idx * 2000 }
        ],
      };
    } else {
      const mockShip = MOCK_SHIP_DATA[(idx + route.label.charCodeAt(0)) % MOCK_SHIP_DATA.length];
      return {
        id: `live-ship-${routeId}-${idx}-sim`,
        name: mockShip.name,
        imo: mockShip.imo,
        type: mockShip.type,
        position: posCurrent,
        headingDeg: heading,
        cargoManifest: [
          { item: "General Cargo (Simulated)", tons: 12000 + idx * 3000 }
        ],
      };
    }
  });

  return NextResponse.json({ ships });
}
