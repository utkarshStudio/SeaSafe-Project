"use client";

import { useBridgeStore } from "@/lib/store";
import type { MapTheme } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Map } from "lucide-react";

const THEMES: { id: MapTheme; label: string; description: string }[] = [
  { id: "ecdis", label: "ECDIS Chart", description: "Golden land, turquoise sea navigation style" },
  { id: "green-blue", label: "Green & Blue Map", description: "Vibrant green land and clear blue sea" },
  { id: "satellite", label: "Satellite Map", description: "High-resolution satellite imagery" },
  { id: "dark", label: "Sleek Dark", description: "Night mode basemap" },
  { id: "fiord", label: "Marine Blue", description: "Blue water navigation style" },
  { id: "positron", label: "Clean Light", description: "Minimal high-contrast light style" },
  { id: "liberty", label: "Detailed Classic", description: "Full feature vector style" },
  { id: "bright", label: "Vibrant Colored", description: "Vibrant high-contrast colored style" },
];

export function MapThemePicker() {
  const mapTheme = useBridgeStore((s) => s.mapTheme);
  const setMapTheme = useBridgeStore((s) => s.setMapTheme);

  const current = THEMES.find((t) => t.id === mapTheme) ?? THEMES[0];

  return (
    <Select value={mapTheme} onValueChange={(v) => v && setMapTheme(v as MapTheme)}>
      <SelectTrigger className="hover-lift focus-ring w-[150px] sm:w-[190px] h-9 rounded-xl bg-slate-900/80 border-slate-800 text-slate-100 hover:border-cyan-500/40 hover:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2 truncate">
          <Map className="size-3.5 text-cyan-400 shrink-0" />
          <SelectValue>
            <span className="font-semibold text-xs truncate">{current.label}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#0A1326]/95 border-slate-800 text-slate-100 rounded-xl backdrop-blur-2xl shadow-2xl p-1">
        {THEMES.map((t) => (
          <SelectItem
            key={t.id}
            value={t.id}
            className="py-2.5 px-3 rounded-lg focus:bg-cyan-500/10 focus:text-cyan-200 cursor-pointer my-0.5"
          >
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs text-slate-100">{t.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{t.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
