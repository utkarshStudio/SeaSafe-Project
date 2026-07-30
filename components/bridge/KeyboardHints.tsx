"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["R"], label: "Replay scenario" },
  { keys: ["C"], label: "Toggle Compliance mode" },
  { keys: ["A"], label: "Accept recommendation" },
  { keys: ["Esc"], label: "Dismiss recommendation" },
  { keys: ["1", "2", "3"], label: "Switch scenario" },
];

export function KeyboardHints() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="hidden sm:block fixed bottom-14 right-6 z-30"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div className="absolute bottom-11 right-0 w-[240px] rounded-xl glass-panel-strong border border-slate-800 p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="eyebrow text-slate-400 font-bold mb-2.5">
            Keyboard Shortcuts
          </div>
          <ul className="space-y-2">
            {SHORTCUTS.map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between text-xs text-slate-300"
              >
                <span>{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 text-[10px] font-mono rounded-md border border-slate-700 bg-slate-900 text-slate-200 tabular-nums shadow-sm"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Show keyboard shortcuts"
        className="hover-lift focus-ring size-8 rounded-full glass-panel-strong border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white shadow-lg cursor-pointer"
      >
        <HelpCircle className="size-4 text-cyan-400" />
      </button>
    </div>
  );
}
