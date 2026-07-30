"use client";

import { useBridgeStore } from "@/lib/store";
import { SCENARIOS } from "@/lib/scenarios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers } from "lucide-react";

export function ScenarioPicker() {
  const scenarioId = useBridgeStore((s) => s.scenarioId);
  const loadScenario = useBridgeStore((s) => s.loadScenario);

  const current = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <Select value={scenarioId} onValueChange={(v) => v && loadScenario(v)}>
      <SelectTrigger className="hover-lift focus-ring w-[180px] sm:w-[280px] h-9 rounded-xl bg-slate-900/80 border-slate-800 text-slate-100 hover:border-cyan-500/40 hover:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2 truncate">
          <Layers className="size-3.5 text-cyan-400 shrink-0" />
          <SelectValue>
            <span className="font-semibold text-xs truncate">{current?.label}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#0A1326]/95 border-slate-800 text-slate-100 rounded-xl backdrop-blur-2xl shadow-2xl p-1">
        {SCENARIOS.map((s) => (
          <SelectItem
            key={s.id}
            value={s.id}
            className="py-2.5 px-3 rounded-lg focus:bg-cyan-500/10 focus:text-cyan-200 cursor-pointer my-0.5"
          >
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs text-slate-100">{s.label}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">{s.flavor}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
