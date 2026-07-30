"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { BridgeHeader } from "@/components/BridgeHeader";
import { AdvisoryBanner } from "@/components/bridge/AdvisoryBanner";
import { AgentPanel } from "@/components/bridge/AgentPanel";
import { DecisionCard } from "@/components/bridge/DecisionCard";
import { AuditLog } from "@/components/bridge/AuditLog";
import { KeyboardHints } from "@/components/bridge/KeyboardHints";
import { RadarPanel } from "@/components/bridge/RadarPanel";
import { ComplianceHUD } from "@/components/bridge/ComplianceHUD";
import { LandingPage } from "@/components/landing/LandingPage";
import { useBridgeStore } from "@/lib/store";
import { SCENARIOS } from "@/lib/scenarios";
import { useOrchestratorStream } from "@/lib/hooks/useOrchestratorStream";
import { createVesselClock } from "@/lib/compliance/vesselClock";
import { computeMaskedRoute } from "@/lib/compliance/maskingEngine";
import { getScenarioComplianceProfile } from "@/lib/compliance/scenarioMasks";

const BridgeMap = dynamic(
  () => import("@/components/map/BridgeMap").then((mod) => mod.BridgeMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bridge-backdrop flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-slate-500">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="eyebrow">Charting course</span>
        </div>
      </div>
    ),
  },
);

export default function Home() {
  const [view, setView] = useState<"landing" | "console">("landing");

  const phase = useBridgeStore((s) => s.phase);
  const scenarioId = useBridgeStore((s) => s.scenarioId);
  const scenario = useBridgeStore((s) => s.scenario);
  const activeRouteId = useBridgeStore((s) => s.activeRouteId);
  const decision = useBridgeStore((s) => s.agent.output);
  const complianceMode = useBridgeStore((s) => s.complianceMode);
  const vesselProgress = useBridgeStore((s) => s.vesselProgress);
  const activeMaskZoneId = useBridgeStore((s) => s.activeMaskZoneId);
  const triggerAdvisory = useBridgeStore((s) => s.triggerAdvisory);
  const reset = useBridgeStore((s) => s.reset);
  const accept = useBridgeStore((s) => s.accept);
  const dismiss = useBridgeStore((s) => s.dismiss);
  const loadScenario = useBridgeStore((s) => s.loadScenario);
  const setComplianceMode = useBridgeStore((s) => s.setComplianceMode);
  const setActiveMaskZone = useBridgeStore((s) => s.setActiveMaskZone);
  const weatherAutoRunKey = useBridgeStore((s) => s.weather.autoRunKey);
  const weatherHazardous = useBridgeStore(
    (s) =>
      Boolean(s.weather.assessment?.hazardous) &&
      (s.weather.assessment?.maxSeverity ?? 0) >= 3,
  );
  const fetchLiveShips = useBridgeStore((s) => s.fetchLiveShips);
  const startStream = useOrchestratorStream();

  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const weatherAutoRunRef = useRef<string | null>(null);
  const activeRoute = useMemo(
    () =>
      scenario.routes.find((route) => route.id === activeRouteId) ??
      scenario.routes[0],
    [activeRouteId, scenario],
  );
  const complianceProfile = useMemo(
    () => getScenarioComplianceProfile(scenario),
    [scenario],
  );
  const hasComplianceProfile = complianceProfile !== null;

  useEffect(() => {
    if (view !== "console" || phase !== "idle") return;
    const t = setTimeout(() => {
      useBridgeStore.getState().triggerAdvisory();
    }, 2500);
    return () => clearTimeout(t);
  }, [scenarioId, phase, triggerAdvisory, view]);

  useEffect(() => {
    if (view !== "console") return;
    void fetch("/api/ai/warmup", { method: "POST" }).catch(() => undefined);
  }, [view]);

  useEffect(() => {
    return () => {
      if (replayTimer.current) clearTimeout(replayTimer.current);
    };
  }, []);

  useEffect(() => {
    if (view !== "console") return;
    const clock = createVesselClock(
      {
        wallSecondsPerVoyageHour: 0.1,
        totalVoyageHours: activeRoute?.etaHours ?? 600,
        initialProgress: useBridgeStore.getState().vesselProgress,
      },
      (t) => useBridgeStore.getState().setVesselProgress(t),
    );

    if (complianceMode && hasComplianceProfile) {
      clock.start();
    }

    return () => clock.stop();
  }, [
    activeRoute?.etaHours,
    activeRoute?.id,
    complianceMode,
    hasComplianceProfile,
    scenarioId,
    view,
  ]);

  useEffect(() => {
    if (view !== "console") return;
    if (!complianceMode || !hasComplianceProfile || !activeRoute) {
      if (activeMaskZoneId !== null) setActiveMaskZone(null);
      return;
    }

    const masked = computeMaskedRoute(activeRoute.waypoints, vesselProgress);
    const nextZoneId = masked.activeZone?.id ?? null;
    if (nextZoneId === activeMaskZoneId) return;

    setActiveMaskZone(nextZoneId);

    if (masked.activeZone) {
      const lawLabel = masked.activeZone.legalBasis.split(" - ")[0];
      toast(`🛡 Entering ${masked.activeZone.label}`, {
        description: `Route masking applied (${lawLabel})`,
        duration: 3000,
      });
    } else if (activeMaskZoneId !== null) {
      toast("🌐 Exiting compliance zone", {
        description: "IMO default masking (200 nm look-ahead)",
        duration: 3000,
      });
    }
  }, [
    activeMaskZoneId,
    activeRoute,
    complianceMode,
    hasComplianceProfile,
    setActiveMaskZone,
    vesselProgress,
    view,
  ]);

  useEffect(() => {
    if (
      view !== "console" ||
      phase !== "advisory" ||
      !weatherHazardous ||
      !weatherAutoRunKey ||
      weatherAutoRunRef.current === weatherAutoRunKey
    ) {
      return;
    }

    weatherAutoRunRef.current = weatherAutoRunKey;
    const timer = setTimeout(() => {
      const current = useBridgeStore.getState();
      if (
        current.phase === "advisory" &&
        current.weather.autoRunKey === weatherAutoRunKey
      ) {
        void startStream(current.scenarioId);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [phase, startStream, weatherAutoRunKey, weatherHazardous, view]);

  // Poll for live ship positions on selected route
  useEffect(() => {
    if (view !== "console") return;
    
    // Initial fetch
    void fetchLiveShips();
    
    // Poll every 3 seconds
    const timer = setInterval(() => {
      void fetchLiveShips();
    }, 3000);
    
    return () => clearInterval(timer);
  }, [view, scenarioId, activeRouteId, fetchLiveShips]);

  const replay = useCallback(() => {
    if (replayTimer.current) clearTimeout(replayTimer.current);
    reset();
    replayTimer.current = setTimeout(() => {
      useBridgeStore.getState().triggerAdvisory();
    }, 500);
  }, [reset]);

  const acceptWithToast = useCallback(() => {
    const d = useBridgeStore.getState().agent.output;
    if (!d) return;
    accept();
    toast.success("Course logged", {
      description: `${new Date().toLocaleString()} UTC · ${d.headline}`,
    });
  }, [accept]);

  useEffect(() => {
    if (view !== "console") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key === "r" || key === "R") {
        e.preventDefault();
        replay();
        return;
      }
      if (key === "c" || key === "C") {
        e.preventDefault();
        const current = useBridgeStore.getState();
        const profile = getScenarioComplianceProfile(current.scenario);
        if (!profile) {
          toast.info("No regulated compliance zone on this route", {
            description: "International IMO default masking remains available.",
            duration: 2500,
          });
          return;
        }
        const nextComplianceMode = !current.complianceMode;
        setComplianceMode(nextComplianceMode);
        toast(nextComplianceMode ? "🛡 Compliance mode active" : "Compliance mode paused", {
          description: nextComplianceMode
            ? "Map is now rendering the forward-only legal route window."
            : "Full planning route restored.",
          duration: 2500,
        });
        return;
      }
      if ((key === "a" || key === "A") && phase === "decision" && decision) {
        e.preventDefault();
        acceptWithToast();
        return;
      }
      if (key === "Escape" && phase === "decision") {
        e.preventDefault();
        dismiss();
        return;
      }
      if (key >= "1" && key <= "5") {
        const idx = Number(key) - 1;
        const next = SCENARIOS[idx];
        if (next && next.id !== scenarioId) {
          e.preventDefault();
          loadScenario(next.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    replay,
    acceptWithToast,
    dismiss,
    loadScenario,
    phase,
    scenarioId,
    decision,
    setComplianceMode,
    view,
  ]);

  if (view === "landing") {
    return <LandingPage onOpenConsole={() => setView("console")} />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <BridgeHeader onBackToLanding={() => setView("landing")} />

      <div className="relative flex-1 min-h-0">
        <BridgeMap />
        <AdvisoryBanner />
        <AgentPanel />
        <RadarPanel />
        <DecisionCard onAccept={acceptWithToast} />
        <ComplianceHUD />
        <AuditLog />
        <KeyboardHints />
      </div>

      <footer className="hidden sm:flex h-11 shrink-0 px-6 items-center justify-end gap-4 hairline-t glass-panel-strong text-xs text-slate-400 relative z-20">
        <div className="eyebrow text-slate-500 inline-flex items-center gap-2">
          Phase
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2 py-0.5 normal-case tracking-normal text-[11px] font-medium text-slate-300">
            <span className="size-1.5 rounded-full bg-primary" />
            {phase}
          </span>
        </div>
      </footer>
    </div>
  );
}
