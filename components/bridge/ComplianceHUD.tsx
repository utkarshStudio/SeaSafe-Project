"use client";

import { useMemo } from "react";
import { useBridgeStore } from "@/lib/store";
import { computeMaskedRoute } from "@/lib/compliance/maskingEngine";
import { getScenarioComplianceProfile } from "@/lib/compliance/scenarioMasks";
import { INTERNATIONAL_COMPLIANCE_DEFAULT } from "@/lib/compliance/zones";
import { ShieldCheck } from "lucide-react";

export function ComplianceHUD() {
  const scenario = useBridgeStore((s) => s.scenario);
  const activeRouteId = useBridgeStore((s) => s.activeRouteId);
  const complianceMode = useBridgeStore((s) => s.complianceMode);
  const vesselProgress = useBridgeStore((s) => s.vesselProgress);

  const profile = useMemo(
    () => getScenarioComplianceProfile(scenario),
    [scenario],
  );
  const activeRoute =
    scenario.routes.find((route) => route.id === activeRouteId) ??
    scenario.routes[0];
  const masked = useMemo(
    () => computeMaskedRoute(activeRoute?.waypoints ?? [], vesselProgress),
    [activeRoute, vesselProgress],
  );
  const activeZone = masked.activeZone;

  if (!complianceMode || !profile) return null;

  const zoneContext = activeZone ?? {
    label: "International Waters - IMO Default",
    legalBasis: INTERNATIONAL_COMPLIANCE_DEFAULT.legalBasis,
    lookAheadNm: INTERNATIONAL_COMPLIANCE_DEFAULT.lookAheadNm,
    disposalHours: INTERNATIONAL_COMPLIANCE_DEFAULT.disposalHours,
    hudColor: "text-slate-300",
  };

  const progressPct = Math.round(vesselProgress * 100);
  const disposal =
    zoneContext.disposalHours === 0
      ? "Immediate on exit"
      : `${zoneContext.disposalHours}h after transit`;

  return (
    <section className="hidden sm:block fixed bottom-14 left-6 z-30 w-80 rounded-2xl glass-panel-strong border border-slate-800 shadow-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-[#0A1326]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-cyan-400" />
          <h2 className="eyebrow text-slate-100 font-bold">
            Data Compliance Mode
          </h2>
        </div>
        <span className="inline-flex size-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      <div className="p-4 space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-slate-500 text-[9px]">Active Zone</span>
          <span className="font-semibold text-cyan-300 truncate">{zoneContext.label}</span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-slate-500 text-[9px]">Jurisdiction</span>
          <span className="text-slate-300 truncate text-[11px] max-w-[180px]" title={zoneContext.legalBasis}>
            {zoneContext.legalBasis.split(" - ")[0]}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-slate-500 text-[9px]">Look-Ahead</span>
          <span className="font-mono text-slate-200">{zoneContext.lookAheadNm} nm</span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-slate-500 text-[9px]">Disposal</span>
          <span className="text-slate-200">{disposal}</span>
        </div>
      </div>

      <div className="border-t border-slate-800/60 p-4 bg-slate-900/30">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
          <span>Voyage Mask Progress</span>
          <span className="text-cyan-400 font-mono font-bold">{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-300 transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-400 font-mono">
          Masked {masked.maskedSegmentCount} / {activeRoute.waypoints.length} waypoints
        </p>
      </div>
    </section>
  );
}
