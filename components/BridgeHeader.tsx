"use client";

import { useEffect, useState } from "react";
import { Anchor, ArrowLeft, Navigation, Shield, Ship, Waypoints } from "lucide-react";
import { useBridgeStore } from "@/lib/store";
import { fmtHrs } from "@/lib/utils";
import { ScenarioPicker } from "./ScenarioPicker";
import { MapThemePicker } from "./MapThemePicker";

interface BridgeHeaderProps {
  onBackToLanding?: () => void;
}

export function BridgeHeader({ onBackToLanding }: BridgeHeaderProps) {
  const scenario = useBridgeStore((s) => s.scenario);
  const scenarioId = useBridgeStore((s) => s.scenarioId);
  const activeRouteId = useBridgeStore((s) => s.activeRouteId);
  const activeRoute =
    scenario.routes.find((r) => r.id === activeRouteId) ?? scenario.routes[0];

  const [contentVisible, setContentVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const frame = requestAnimationFrame(() => {
      setContentVisible(false);
      timer = setTimeout(() => setContentVisible(true), 180);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [scenarioId]);

  return (
    <header className="h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between gap-4 hairline-b bg-[#060D1A]/90 backdrop-blur-xl relative z-20">
      {/* Left Brand Mark & Back Button */}
      <div className="flex items-center gap-3 shrink-0">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            aria-label="Back to Landing Page"
            className="hover-lift focus-ring flex items-center justify-center size-9 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="size-4" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Anchor className="size-4.5 text-cyan-400" strokeWidth={2.2} />
          </span>
          <span className="font-heading font-black tracking-[0.2em] text-slate-100 text-sm">
            SEASAFE
          </span>
        </div>
      </div>

      {/* Middle Telemetry Badges */}
      <div
        className={`hidden lg:flex items-center gap-6 text-xs transition-opacity duration-300 ${contentVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Ship className="size-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="eyebrow text-slate-500 text-[9px]">Vessel</span>
            <span className="font-semibold text-slate-200 mt-0.5 inline-flex items-center gap-1.5">
              <span className="relative inline-flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400/80 animate-ping" />
                <span className="relative inline-block size-1.5 rounded-full bg-emerald-400" />
              </span>
              {scenario.vessel.name}
              <span className="text-slate-500 font-mono text-[11px] font-normal">
                IMO {scenario.vessel.imo}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Navigation className="size-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="eyebrow text-slate-500 text-[9px]">Voyage</span>
            <span className="font-semibold text-slate-200 mt-0.5">
              {scenario.voyage.from.name}
              <span className="mx-1 text-cyan-500/70">→</span>
              {scenario.voyage.to.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Waypoints className="size-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="eyebrow text-slate-500 text-[9px]">Course</span>
            <span className="font-semibold text-cyan-300 mt-0.5 uppercase tracking-wide">
              {activeRoute.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <Shield className="size-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="eyebrow text-slate-500 text-[9px]">ETA</span>
            <span className="font-mono font-semibold text-slate-200 mt-0.5">
              {fmtHrs(activeRoute.etaHours)}
            </span>
          </div>
        </div>
      </div>

      {/* Right Scenario Dropdown & Theme Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <MapThemePicker />
        <ScenarioPicker />
      </div>
    </header>
  );
}
