"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBridgeStore } from "@/lib/store";
import { useOrchestratorStream } from "@/lib/hooks/useOrchestratorStream";

export function AdvisoryBanner() {
  const phase = useBridgeStore((s) => s.phase);
  const advisory = useBridgeStore((s) => s.advisory);
  const chokepoint = useBridgeStore((s) => s.scenario.chokepoint);
  const scenarioId = useBridgeStore((s) => s.scenarioId);
  const dismiss = useBridgeStore((s) => s.dismiss);
  const startStream = useOrchestratorStream();

  const visible = phase === "advisory" && advisory != null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(visible));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  if (!visible || !advisory) return null;

  const isWeatherAdvisory = advisory.id.startsWith("weather-");
  const isCritical = advisory.severity >= 4;

  return (
    <div
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 transition-all duration-300 ease-out ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
    >
      <div
        className={`rounded-2xl backdrop-blur-2xl p-4 shadow-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isWeatherAdvisory
            ? "bg-[#0A1326]/90 border-cyan-500/30 shadow-cyan-950/30"
            : isCritical
              ? "bg-[#160B0E]/90 border-rose-500/40 shadow-rose-950/40"
              : "bg-[#181206]/90 border-amber-500/40 shadow-amber-950/40"
          }`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative shrink-0 mt-0.5 sm:mt-0">
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isWeatherAdvisory
                  ? "bg-cyan-400"
                  : isCritical
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
            />
            <div
              className={`relative flex items-center justify-center size-9 rounded-xl ${isWeatherAdvisory
                  ? "bg-cyan-500/20 text-cyan-300"
                  : isCritical
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
            >
              {isCritical ? (
                <ShieldAlert className="size-5" />
              ) : (
                <AlertTriangle className="size-5" />
              )}
            </div>
          </div>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`eyebrow text-[10px] ${isWeatherAdvisory
                    ? "text-cyan-400"
                    : isCritical
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
              >
                {isWeatherAdvisory ? "WEATHER ADVISORY" : "MARITIME RISK ADVISORY"}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-semibold text-slate-300">
                Severity {advisory.severity}/5
              </span>
            </div>

            <div className="text-xs text-slate-200 mt-0.5 font-medium leading-snug line-clamp-2">
              <span className="text-white font-semibold">{chokepoint.name}</span> — {advisory.summary}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => startStream(scenarioId)}
            className="hover-lift h-8.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Assess Risk <ArrowRight className="size-3.5 ml-1" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={dismiss}
            className="hover-lift h-8.5 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
