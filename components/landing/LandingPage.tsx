"use client";

import { ArrowRight } from "lucide-react";
import { LandingBackground } from "./LandingBackground";

interface LandingPageProps {
  onOpenConsole: () => void;
}

export function LandingPage({ onOpenConsole }: LandingPageProps) {
  return (
    <>
      <style>{`
        @keyframes ss-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ss-shimmer {
          0%   { background-position: -250% center; }
          100% { background-position:  250% center; }
        }
        @keyframes ss-pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes ss-glow-btn {
          0%, 100% { box-shadow: 0 0 38px rgba(6,182,212,0.45), 0 0 0 1px rgba(34,211,238,0.35); }
          50%       { box-shadow: 0 0 62px rgba(6,182,212,0.65), 0 0 0 1px rgba(34,211,238,0.55); }
        }
        .ss-rise-1 { animation: ss-rise 0.85s cubic-bezier(.22,1,.36,1) 0.15s both; }
        .ss-rise-2 { animation: ss-rise 0.85s cubic-bezier(.22,1,.36,1) 0.35s both; }
        .ss-rise-3 { animation: ss-rise 0.85s cubic-bezier(.22,1,.36,1) 0.55s both; }
        .ss-rise-4 { animation: ss-rise 0.85s cubic-bezier(.22,1,.36,1) 0.75s both; }
        .ss-rise-5 { animation: ss-rise 0.85s cubic-bezier(.22,1,.36,1) 0.95s both; }
      `}</style>

      <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-[#010b16] text-white selection:bg-cyan-500/30 selection:text-cyan-100">

        {/* ── Canvas background ─────────────────────────────── */}
        <LandingBackground />

        {/* ── Vignette overlays ─────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#010b16]/90 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#010810]/95 to-transparent" />
        </div>

        {/* ── Header ────────────────────────────────────────── */}
        <header className="ss-rise-1 relative z-10 flex items-center justify-between px-8 pt-6 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(34,211,238,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="19" />
              <path d="M8 11H4a8 8 0 0 0 16 0h-4" />
            </svg>
            <span className="text-[12px] font-mono font-bold tracking-[0.3em] text-slate-300 uppercase">
              SeaSafe
            </span>
          </div>

          {/* Live status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/[0.06] backdrop-blur-sm">
            <span
              className="size-1.5 rounded-full bg-emerald-400"
              style={{ animation: "ss-pulse-dot 2.5s ease-in-out infinite" }}
            />
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
              All Systems Nominal
            </span>
          </div>
        </header>

        {/* ── Hero ──────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center">

          {/* Eyebrow badge */}
          <div className="ss-rise-2 inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-sm">
            <span
              className="size-1.5 rounded-full bg-cyan-400"
              style={{ animation: "ss-pulse-dot 2s ease-in-out infinite" }}
            />
            <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-cyan-400/80">
              Autonomous Maritime Intelligence
            </span>
          </div>

          {/* Main title */}
          <h1 className="ss-rise-3 text-[clamp(3.5rem,11vw,8rem)] font-black tracking-tight leading-none mb-6 select-none">
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(130deg, #ffffff 0%, #cffafe 30%, #67e8f9 55%, #a5f3fc 80%, #f0fdf4 100%)",
                backgroundSize: "300% auto",
                WebkitBackgroundClip: "text",
                animation: "ss-shimmer 5s linear 1s infinite",
              }}
            >
              SEASAFE
            </span>
          </h1>

          {/* Tagline */}
          <p className="ss-rise-4 max-w-md text-[15px] text-slate-400 leading-relaxed mb-10">
            Real-time AI routing across contested and dangerous ocean corridors.
          </p>

          {/* Single CTA */}
          <div className="ss-rise-5">
            <button
              id="launch-demo-btn"
              onClick={onOpenConsole}
              aria-label="Open Live Demo"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[13px] tracking-wide text-slate-900 cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #22d3ee 0%, #2dd4bf 60%, #34d399 100%)",
                animation: "ss-glow-btn 3s ease-in-out 1.5s infinite",
              }}
            >
              {/* shimmer sweep */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
              <span className="relative z-10 font-extrabold">Open Live Demo</span>
              <ArrowRight className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </button>
          </div>
        </main>

        {/* ── Footer strip ──────────────────────────────────── */}
        <footer className="relative z-10 pb-7 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 flex-wrap">
            {[
              { dot: "bg-cyan-400",    label: "IMO Route Compliance" },
              { dot: "bg-teal-400",    label: "Weather & Hazard Avoidance" },
              { dot: "bg-emerald-400", label: "AI Decision Support" },
            ].map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-2 opacity-0"
                style={{ animation: `ss-rise 0.7s ease-out ${1.1 + i * 0.1}s forwards` }}
              >
                <span className={`size-1.5 rounded-full ${f.dot}`} />
                <span className="text-[11px] font-mono text-slate-500 tracking-wide">{f.label}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
