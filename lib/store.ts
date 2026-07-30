import { create } from "zustand";
import type {
  Advisory,
  AgentStatus,
  AuditEntry,
  Decision,
  Scenario,
  ToolCall,
  Vessel,
} from "./types";
import { SCENARIOS_BY_ID, DEFAULT_SCENARIO_ID } from "./scenarios";
import {
  buildWeatherRerouteScenario,
  attachWeatherRuntime,
} from "@/lib/weather/reroute";
import type {
  WeatherFetchResult,
  WeatherHazardZone,
  WeatherRouteAssessment,
  WeatherSourceStatus,
} from "@/lib/weather/types";

export type MapTheme = "ecdis" | "green-blue" | "satellite" | "positron" | "dark" | "fiord" | "liberty" | "bright";

type Phase =
  | "idle"
  | "advisory"
  | "assessing"
  | "decision"
  | "accepted"
  | "dismissed";

interface State {
  scenarioId: string;
  scenario: Scenario;
  phase: Phase;
  activeRouteId: string;
  advisory: Advisory | null;
  weather: {
    status: WeatherSourceStatus;
    hazards: WeatherHazardZone[];
    assessment: WeatherRouteAssessment | null;
    message: string | null;
    lastUpdatedAt: string | null;
    autoRunKey: string | null;
  };
  agent: {
    status: AgentStatus;
    toolCalls: ToolCall[];
    output: Decision | null;
    error: string | null;
    selectedRouteId: string | null;
    rationaleDraft: string;
    rationaleFallbackMessage: string | null;
  };
  audit: AuditEntry[];
  complianceMode: boolean;
  vesselProgress: number;
  activeMaskZoneId: string | null;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  liveShips: Vessel[];
  fetchLiveShips: () => Promise<void>;
  loadScenario: (id: string) => void;
  setComplianceMode: (active: boolean) => void;
  setVesselProgress: (t: number) => void;
  setActiveMaskZone: (zoneId: string | null) => void;
  setWeatherLoading: () => void;
  applyWeatherResult: (result: WeatherFetchResult) => void;
  triggerAdvisory: () => void;
  startAssess: () => void;
  pushToolCall: (t: ToolCall) => void;
  startAgentRationale: () => void;
  appendAgentRationale: (delta: string) => void;
  setAgentRationaleFallback: (rationale: string, message: string) => void;
  setAgentOutput: (o: Decision) => void;
  setAgentError: (e: string) => void;
  selectRoute: (routeId: string) => void;
  accept: () => void;
  dismiss: () => void;
  reset: () => void;
}

const initialAgent = () => ({
  status: "idle" as AgentStatus,
  toolCalls: [] as ToolCall[],
  output: null as Decision | null,
  error: null as string | null,
  selectedRouteId: null as string | null,
  rationaleDraft: "",
  rationaleFallbackMessage: null as string | null,
});

const initialWeather = () => ({
  status: "idle" as WeatherSourceStatus,
  hazards: [] as WeatherHazardZone[],
  assessment: null as WeatherRouteAssessment | null,
  message: null as string | null,
  lastUpdatedAt: null as string | null,
  autoRunKey: null as string | null,
});

const initial = (id: string) => {
  const s = SCENARIOS_BY_ID[id];
  if (!s) throw new Error(`Unknown scenarioId: ${id}`);
  const currentRoute = s.routes.find((r) => r.isCurrent) ?? s.routes[0];
  return {
    scenarioId: id,
    scenario: s,
    activeRouteId: currentRoute.id,
  };
};

export const useBridgeStore = create<State>((set, get) => ({
  ...initial(DEFAULT_SCENARIO_ID),
  phase: "idle",
  advisory: null,
  weather: initialWeather(),
  agent: initialAgent(),
  audit: [],
  complianceMode: false,
  vesselProgress: 0,
  activeMaskZoneId: null,
  mapTheme: "ecdis",
  setMapTheme: (mapTheme) => {
    set({ mapTheme });
    if (typeof window !== "undefined") {
      localStorage.setItem("seasafe-map-theme", mapTheme);
    }
  },
  liveShips: [],
  fetchLiveShips: async () => {
    const { scenarioId, activeRouteId } = get();
    try {
      const res = await fetch(`/api/live-ships?scenarioId=${scenarioId}&routeId=${activeRouteId}`);
      if (res.ok) {
        const data = await res.json();
        set({ liveShips: data.ships || [] });
      }
    } catch (e) {
      console.error("Failed to fetch live ships:", e);
    }
  },
  loadScenario: (id) => {
    set({
      ...initial(id),
      phase: "idle",
      advisory: null,
      weather: initialWeather(),
      agent: initialAgent(),
      complianceMode: false,
      vesselProgress: 0,
      activeMaskZoneId: null,
      liveShips: [],
    });
  },
  setComplianceMode: (active) => set({ complianceMode: active }),
  setVesselProgress: (t) =>
    set({ vesselProgress: Math.max(0, Math.min(1, t)) }),
  setActiveMaskZone: (zoneId) => set({ activeMaskZoneId: zoneId }),
  setWeatherLoading: () =>
    set((s) => ({
      weather: { ...s.weather, status: "loading", message: null },
    })),
  applyWeatherResult: (result) =>
    set((s) => {
      const plan = buildWeatherRerouteScenario({
        scenario: s.scenario,
        activeRouteId: s.activeRouteId,
        hazards: result.hazards,
        source: result.status,
      });
      const severeWeather =
        plan.assessment.hazardous && plan.assessment.maxSeverity >= 3;
      const hazardKey = severeWeather
        ? [
            plan.scenario.id,
            plan.assessment.hazardousRouteId,
            plan.assessment.recommendedRouteId,
            plan.assessment.intersectingHazards.map((h) => h.id).join("|"),
          ].join(":")
        : null;
      const shouldRaiseWeatherAdvisory =
        severeWeather &&
        hazardKey !== s.weather.autoRunKey &&
        (s.phase === "idle" || s.phase === "advisory");
      const nextScenario = severeWeather
        ? plan.scenario
        : attachWeatherRuntime(s.scenario, result.hazards, plan.assessment);

      return {
        scenario: nextScenario,
        phase: shouldRaiseWeatherAdvisory ? "advisory" : s.phase,
        advisory: shouldRaiseWeatherAdvisory
          ? nextScenario.advisory
          : s.advisory,
        weather: {
          status: result.status,
          hazards: result.hazards,
          assessment: plan.assessment,
          message: result.message ?? null,
          lastUpdatedAt: result.updatedAt,
          autoRunKey: shouldRaiseWeatherAdvisory
            ? hazardKey
            : s.weather.autoRunKey,
        },
      };
    }),
  triggerAdvisory: () =>
    set((s) => ({ phase: "advisory", advisory: s.scenario.advisory })),
  startAssess: () =>
    set({
      phase: "assessing",
      agent: {
        status: "thinking",
        toolCalls: [],
        output: null,
        error: null,
        selectedRouteId: null,
        rationaleDraft: "",
        rationaleFallbackMessage: null,
      },
    }),
  pushToolCall: (t) =>
    set((s) => ({
      agent: { ...s.agent, toolCalls: [...s.agent.toolCalls, t] },
    })),
  startAgentRationale: () =>
    set((s) => ({
      agent: {
        ...s.agent,
        status: "writing",
        rationaleDraft: "",
        rationaleFallbackMessage: null,
      },
    })),
  appendAgentRationale: (delta) =>
    set((s) => ({
      agent: {
        ...s.agent,
        rationaleDraft: `${s.agent.rationaleDraft}${delta}`,
      },
    })),
  setAgentRationaleFallback: (rationale, message) =>
    set((s) => ({
      agent: {
        ...s.agent,
        status: "writing",
        rationaleDraft: rationale,
        rationaleFallbackMessage: message,
      },
    })),
  setAgentOutput: (output) =>
    set((s) => ({
      phase: "decision",
      agent: {
        ...s.agent,
        status: "done",
        output,
        selectedRouteId: output.recommendedRouteId,
        rationaleDraft: output.rationale,
      },
    })),
  setAgentError: (error) =>
    set((s) => ({ agent: { ...s.agent, status: "error", error } })),
  selectRoute: (routeId) =>
    set((s) => ({ agent: { ...s.agent, selectedRouteId: routeId } })),
  accept: () => {
    const { agent, activeRouteId, scenarioId, scenario } = get();
    if (!agent.output) return;
    const routeToAccept =
      agent.selectedRouteId ?? agent.output.recommendedRouteId;
    const acceptedRoute = scenario.routes.find((r) => r.id === routeToAccept);
    const entry: AuditEntry = {
      id: `audit-${Date.now()}`,
      decidedAt: new Date().toISOString(),
      action: "accept",
      scenarioId,
      vesselId: scenario.vessel.id,
      fromRouteId: activeRouteId,
      toRouteId: routeToAccept,
      acceptedRouteId: routeToAccept,
      acceptedRouteLabel: acceptedRoute?.label ?? routeToAccept,
      wasRecommended: routeToAccept === agent.output.recommendedRouteId,
      rationale: agent.output.rationale,
      toolCallTrace: agent.toolCalls,
      recommendedRouteId: agent.output.recommendedRouteId,
    };
    set((s) => ({
      phase: "accepted",
      activeRouteId: routeToAccept,
      agent: { ...s.agent, selectedRouteId: null },
      audit: [entry, ...s.audit],
      complianceMode: true,
      vesselProgress: 0,
      activeMaskZoneId: null,
    }));
  },
  dismiss: () => {
    const { agent, activeRouteId, scenarioId, scenario } = get();
    const entry: AuditEntry = {
      id: `audit-${Date.now()}`,
      decidedAt: new Date().toISOString(),
      action: "dismiss",
      scenarioId,
      vesselId: scenario.vessel.id,
      fromRouteId: activeRouteId,
      toRouteId: null,
      acceptedRouteId: null,
      acceptedRouteLabel: null,
      wasRecommended: false,
      rationale: agent.output?.rationale ?? "(no assessment)",
      toolCallTrace: agent.toolCalls,
      recommendedRouteId: agent.output?.recommendedRouteId ?? null,
    };
    set((s) => ({
      phase: "dismissed",
      agent: { ...s.agent, selectedRouteId: null },
      audit: [entry, ...s.audit],
    }));
  },
  reset: () => {
    const { scenarioId } = get();
    set({
      ...initial(scenarioId),
      phase: "idle",
      advisory: null,
      weather: initialWeather(),
      agent: initialAgent(),
      complianceMode: false,
      vesselProgress: 0,
      activeMaskZoneId: null,
      liveShips: [],
    });
  },
}));
