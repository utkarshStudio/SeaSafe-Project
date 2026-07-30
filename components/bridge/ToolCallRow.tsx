"use client";

import { useEffect, useState } from "react";
import type { PortCongestionResult, ToolCall } from "@/lib/types";
import { fmtNum, fmtSigned, fmtUsd, fmtUsdSigned } from "@/lib/utils";
import { Anchor, BarChart3, CheckCircle2, CloudLightning, ShieldAlert, Sparkles } from "lucide-react";

function formatToolSummary(tc: ToolCall): { title: string; subtitle: string; icon: React.ReactNode } {
  const r = tc.result as Record<string, unknown>;
  const args = tc.args as Record<string, string>;

  if (tc.name === "check_chokepoint_status") {
    const sev = (r?.severity as number) ?? 1;
    const summary = (r?.summary as string) ?? "Monitoring maritime corridor";
    return {
      title: "Security Threat Assessment",
      subtitle: `Severity ${sev}/5 · ${summary}`,
      icon: <ShieldAlert className="size-4 text-rose-400" />,
    };
  }

  if (tc.name === "check_weather_hazards") {
    const hazardous = Boolean(r?.hazardous);
    const hazards = Array.isArray(r?.hazards) ? r.hazards : [];
    const maxSeverity = (r?.maxSeverity as number) ?? 0;
    const recommendation = (r?.recommendation as string) ?? "";
    return {
      title: "Weather & Swell Radar Scan",
      subtitle: hazardous
        ? `Severity ${maxSeverity}/5 · ${hazards.length} hazard zone(s) detected`
        : `Weather clear along planned corridor`,
      icon: <CloudLightning className="size-4 text-cyan-400" />,
    };
  }

  if (tc.name === "calculate_route_metrics") {
    const distance = (r?.distance_nm as number) ?? 0;
    const eta = (r?.eta_hours as number) ?? 0;
    const fuelUsd = (r?.fuel_cost_usd as number) ?? 0;
    const co2 = (r?.co2_tons as number) ?? 0;
    return {
      title: "Route Telemetry & Voyage Economics",
      subtitle: `${fmtNum(distance)} nm · ${fmtNum(eta)} hrs · ${fmtUsd(fuelUsd)} · ${fmtNum(co2)}t CO₂`,
      icon: <BarChart3 className="size-4 text-teal-400" />,
    };
  }

  if (tc.name === "compare_routes") {
    const eta = (r?.eta_delta_hours as number) ?? 0;
    const fuelUsd = (r?.fuel_delta_usd as number) ?? 0;
    const co2 = (r?.co2_delta_tons as number) ?? 0;
    return {
      title: "Alternative Route Trade-off Analysis",
      subtitle: `Delta: ${fmtSigned(eta, "h")} · ${fmtUsdSigned(fuelUsd)} · ${fmtSigned(co2, "t CO₂")}`,
      icon: <Sparkles className="size-4 text-amber-400" />,
    };
  }

  if (tc.name === "check_port_congestion") {
    const portRes = r as unknown as PortCongestionResult;
    const portName = portRes?.portName ?? args?.port_id ?? "Destination Port";
    const status = portRes?.status ?? "clear";
    const wait = portRes?.estimatedWaitHours ?? 0;
    return {
      title: `Port Congestion Check — ${portName}`,
      subtitle: `Status: ${status.toUpperCase()} · ~${wait}h estimated wait`,
      icon: <Anchor className="size-4 text-cyan-400" />,
    };
  }

  return {
    title: tc.name,
    subtitle: "Completed successfully",
    icon: <CheckCircle2 className="size-4 text-emerald-400" />,
  };
}

export function ToolCallRow({ tc, index = 0 }: { tc: ToolCall; index?: number }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), Math.min(index, 6) * 120);
    return () => clearTimeout(t);
  }, [index]);

  const { title, subtitle, icon } = formatToolSummary(tc);

  return (
    <div
      className={`px-4 py-3 border-b border-slate-800/60 hover:bg-slate-900/40 transition-all duration-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center size-7 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            {icon}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate">{title}</span>
            <span className="text-[11px] text-slate-400 truncate mt-0.5">{subtitle}</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-slate-500 tabular-nums shrink-0">
          {tc.durationMs}ms
        </span>
      </div>
    </div>
  );
}
