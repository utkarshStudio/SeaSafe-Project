"use client";

import { useState } from "react";
import {
  History,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { useBridgeStore } from "@/lib/store";
import { SCENARIOS_BY_ID } from "@/lib/scenarios";

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

export function AuditLog() {
  const audit = useBridgeStore((s) => s.audit);
  const phase = useBridgeStore((s) => s.phase);
  const [open, setOpen] = useState(false);

  const count = audit.length;
  const hideOnMobile = phase === "advisory";

  return (
    <div className={`fixed top-[72px] left-2 right-2 sm:top-auto sm:bottom-14 sm:left-6 sm:right-auto z-30 sm:max-w-[360px] ${hideOnMobile ? "hidden sm:block" : ""}`}>
      <div className="rounded-xl glass-panel-strong border border-slate-800 shadow-xl overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="hover-lift focus-ring w-full px-3.5 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 cursor-pointer"
        >
          <History className="size-3.5 text-cyan-400" />
          <span>
            {count} Decision{count === 1 ? "" : "s"} Logged
          </span>
          <span className="ml-auto text-slate-500">
            {open ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </span>
        </button>

        {open && count > 0 && (
          <ul className="max-h-[240px] overflow-y-auto border-t border-slate-800 divide-y divide-slate-800/60">
            {audit.map((e) => {
              const scenarioLabel =
                SCENARIOS_BY_ID[e.scenarioId]?.label ?? e.scenarioId;
              const accepted = e.action === "accept";
              const captainsCall = accepted && e.wasRecommended === false;
              return (
                <li key={e.id} className="p-3 text-xs leading-snug hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-center gap-1.5">
                    {accepted ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="size-3.5 text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`font-mono text-[10px] uppercase font-bold tracking-wider ${accepted ? "text-emerald-300" : "text-slate-400"
                        }`}
                    >
                      {e.action}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-200 font-semibold truncate">{scenarioLabel}</span>
                    {captainsCall && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-px text-[9px] font-mono uppercase tracking-wider text-amber-300 ml-auto shrink-0">
                        <Zap className="size-2.5" /> Override
                      </span>
                    )}
                    <span className="ml-auto text-slate-500 font-mono text-[10px] tabular-nums">
                      {new Date(e.decidedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {accepted && e.acceptedRouteLabel && (
                    <div className="mt-1 text-slate-200 font-medium text-xs">
                      {e.acceptedRouteLabel}
                    </div>
                  )}
                  <div className="mt-1 text-slate-400 font-mono text-[10px]">
                    {e.fromRouteId}
                    <span className="mx-1 text-slate-600">→</span>
                    {e.toRouteId ?? "(no change)"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {open && count === 0 && (
          <div className="border-t border-slate-800 p-3.5 text-xs text-slate-500 italic">
            No decisions logged yet. Assess an advisory to start logging.
          </div>
        )}
      </div>
    </div>
  );
}
