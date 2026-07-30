"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBridgeStore } from "@/lib/store";
import { cn, fmtSigned, fmtUsdSigned } from "@/lib/utils";
import type { Route, ToolCall } from "@/lib/types";

interface RouteDeltas {
  etaHours: number;
  fuelTons: number;
  fuelUsd: number;
  co2Tons: number;
}

const ZERO_DELTAS: RouteDeltas = {
  etaHours: 0,
  fuelTons: 0,
  fuelUsd: 0,
  co2Tons: 0,
};

function findCompareDeltas(
  toolCalls: ToolCall[],
  fromId: string,
  toId: string,
): RouteDeltas | null {
  const tc = toolCalls.find(
    (c) =>
      c.name === "compare_routes" &&
      (c.args as Record<string, string>).route_a_id === fromId &&
      (c.args as Record<string, string>).route_b_id === toId,
  );
  if (!tc) return null;
  const r = tc.result as Record<string, number> | null;
  if (!r) return null;
  return {
    etaHours: r.eta_delta_hours ?? 0,
    fuelTons: r.fuel_delta_tons ?? 0,
    fuelUsd: r.fuel_delta_usd ?? 0,
    co2Tons: r.co2_delta_tons ?? 0,
  };
}

export function DecisionCard({ onAccept }: { onAccept: () => void }) {
  const phase = useBridgeStore((s) => s.phase);
  const decision = useBridgeStore((s) => s.agent.output);
  const toolCalls = useBridgeStore((s) => s.agent.toolCalls);
  const selectedRouteId = useBridgeStore((s) => s.agent.selectedRouteId);
  const selectRoute = useBridgeStore((s) => s.selectRoute);
  const activeRouteId = useBridgeStore((s) => s.activeRouteId);
  const scenario = useBridgeStore((s) => s.scenario);
  const dismiss = useBridgeStore((s) => s.dismiss);

  const visible = phase === "decision" && decision != null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(visible));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  if (!visible || !decision) return null;

  const routeMap = new Map<string, Route>(
    scenario.routes.map((r) => [r.id, r]),
  );
  const recommendedRoute = routeMap.get(decision.recommendedRouteId);
  const altARoute = routeMap.get(decision.alternativeRouteIds[0]);
  const altBRoute = routeMap.get(decision.alternativeRouteIds[1]);

  const recommendedDeltas =
    decision.recommendedRouteId === activeRouteId
      ? ZERO_DELTAS
      : (findCompareDeltas(
        toolCalls,
        activeRouteId,
        decision.recommendedRouteId,
      ) ?? {
        etaHours: decision.highlightDeltas.etaHours,
        fuelTons: decision.highlightDeltas.fuelTons,
        fuelUsd: decision.highlightDeltas.fuelUsd,
        co2Tons: decision.highlightDeltas.co2Tons,
      });

  const altADeltas =
    decision.alternativeRouteIds[0] === activeRouteId
      ? ZERO_DELTAS
      : (findCompareDeltas(
        toolCalls,
        activeRouteId,
        decision.alternativeRouteIds[0],
      ) ?? ZERO_DELTAS);

  const altBDeltas =
    decision.alternativeRouteIds[1] === activeRouteId
      ? ZERO_DELTAS
      : (findCompareDeltas(
        toolCalls,
        activeRouteId,
        decision.alternativeRouteIds[1],
      ) ?? ZERO_DELTAS);

  const selectedRoute = selectedRouteId
    ? routeMap.get(selectedRouteId)
    : undefined;

  return (
    <div
      className={`fixed sm:bottom-6 sm:right-6 sm:left-auto bottom-0 left-0 right-0 z-30 sm:w-[480px] transition-all duration-300 ease-out ${mounted
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
        }`}
    >
      <div className="rounded-t-2xl sm:rounded-2xl glass-panel-strong border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-none">
        {/* Header Badge */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0A1326]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-7 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Sparkles className="size-4" />
            </span>
            <span className="eyebrow text-cyan-300 font-bold text-[11px]">
              AI RECOMMENDED VOYAGE PLAN
            </span>
          </div>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Decision Headline */}
          <div>
            <h2 className="text-base font-bold text-white leading-snug">
              {decision.headline}
            </h2>
          </div>

          {/* Route Options List */}
          <div className="space-y-2.5">
            {recommendedRoute && (
              <RouteOptionCard
                route={recommendedRoute}
                deltas={recommendedDeltas}
                showDeltas={decision.recommendedRouteId !== activeRouteId}
                isSelected={selectedRouteId === recommendedRoute.id}
                isAiSuggestion
                isCurrent={recommendedRoute.id === activeRouteId}
                onSelect={() => selectRoute(recommendedRoute.id)}
              />
            )}
            {altARoute && (
              <RouteOptionCard
                route={altARoute}
                deltas={altADeltas}
                showDeltas={decision.alternativeRouteIds[0] !== activeRouteId}
                isSelected={selectedRouteId === altARoute.id}
                isAiSuggestion={false}
                isCurrent={altARoute.id === activeRouteId}
                onSelect={() => selectRoute(altARoute.id)}
              />
            )}
            {altBRoute && (
              <RouteOptionCard
                route={altBRoute}
                deltas={altBDeltas}
                showDeltas={decision.alternativeRouteIds[1] !== activeRouteId}
                isSelected={selectedRouteId === altBRoute.id}
                isAiSuggestion={false}
                isCurrent={altBRoute.id === activeRouteId}
                onSelect={() => selectRoute(altBRoute.id)}
              />
            )}
          </div>

          {/* AI Brief Rationale */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed italic border-l-2 border-l-cyan-400">
            &ldquo;{decision.rationale}&rdquo;
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#060D1A] border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="hover-lift text-slate-400 hover:text-white hover:bg-white/10 text-xs"
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={onAccept}
            disabled={!selectedRouteId}
            className="hover-lift h-9 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 disabled:opacity-40 cursor-pointer"
          >
            Accept &amp; Log Course <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function RouteOptionCard({
  route,
  deltas,
  showDeltas,
  isSelected,
  isAiSuggestion,
  isCurrent,
  onSelect,
}: {
  route: Route;
  deltas: RouteDeltas;
  showDeltas: boolean;
  isSelected: boolean;
  isAiSuggestion: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover-lift focus-ring w-full text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-cyan-400/80 bg-cyan-500/10 ring-1 ring-cyan-400/50 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
          : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-white text-xs font-semibold truncate">
          {route.label}
        </span>
        {isAiSuggestion && (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 px-2 py-0.5 text-[9px] text-cyan-300 font-mono font-bold uppercase tracking-wider shrink-0">
            <Sparkles className="size-2.5" /> AI Choice
          </span>
        )}
        {!isAiSuggestion && isCurrent && (
          <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400 font-mono font-medium uppercase tracking-wider shrink-0">
            Current
          </span>
        )}
      </div>

      {showDeltas && (
        <div className="mt-2 flex items-center gap-3 font-mono text-[11px] tabular-nums">
          <span className={deltas.etaHours > 0 ? "text-amber-300" : "text-emerald-400"}>
            {fmtSigned(deltas.etaHours, "h")}
          </span>
          <span className="text-slate-700">·</span>
          <span className={deltas.fuelUsd > 0 ? "text-amber-300" : "text-emerald-400"}>
            {fmtUsdSigned(deltas.fuelUsd)}
          </span>
          <span className="text-slate-700">·</span>
          <span className={deltas.co2Tons > 0 ? "text-amber-300" : "text-emerald-400"}>
            {fmtSigned(deltas.co2Tons, "t CO₂")}
          </span>
        </div>
      )}
    </button>
  );
}
