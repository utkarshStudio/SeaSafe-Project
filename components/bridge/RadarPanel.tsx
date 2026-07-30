"use client";

import { useEffect, useMemo, useState } from "react";
import { Radar } from "lucide-react";
import { useBridgeStore } from "@/lib/store";
import { computeRadarScores } from "@/lib/radar/scores";
import { RouteRadarChart } from "./RouteRadarChart";

export function RadarPanel() {
  const phase = useBridgeStore((s) => s.phase);
  const decision = useBridgeStore((s) => s.agent.output);
  const toolCalls = useBridgeStore((s) => s.agent.toolCalls);
  const selectedRouteId = useBridgeStore((s) => s.agent.selectedRouteId);
  const selectRoute = useBridgeStore((s) => s.selectRoute);
  const scenario = useBridgeStore((s) => s.scenario);

  const visible = phase === "decision" && decision != null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(visible));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  const radarScores = useMemo(
    () =>
      scenario && toolCalls.length > 0
        ? computeRadarScores(scenario, toolCalls)
        : [],
    [scenario, toolCalls],
  );

  if (!visible || !decision || radarScores.length !== 3) return null;

  return (
    <div
      className={`hidden lg:block fixed top-20 left-6 z-30 w-[400px] transition-all duration-300 ease-out ${mounted
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
    >
      <div className="rounded-2xl glass-panel-strong border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-[#0A1326]/90 flex items-center gap-2.5">
          <span className="flex items-center justify-center size-7 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Radar className="size-4" />
          </span>
          <span className="eyebrow text-cyan-300 font-bold">
            Multi-Dimensional Route Trade-Off
          </span>
        </div>

        <div className="p-4">
          <RouteRadarChart
            routeScores={radarScores}
            selectedRouteId={selectedRouteId}
            onRouteClick={selectRoute}
            recommendedRouteId={decision.recommendedRouteId}
            alternativeRouteIds={decision.alternativeRouteIds}
          />
        </div>

        <div className="px-4 pb-3 text-[10px] leading-relaxed text-slate-400 border-t border-slate-800/60 pt-3">
          Outer boundary = higher value. Safer, cost-efficient routes minimize{" "}
          <span className="text-slate-200 font-semibold">RISK · COST · CARBON</span>; faster routes maximize{" "}
          <span className="text-cyan-300 font-semibold">SPEED · RELIABILITY</span>.
        </div>
      </div>
    </div>
  );
}
