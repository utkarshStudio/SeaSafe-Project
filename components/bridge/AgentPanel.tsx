"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  MessageSquareText,
  RotateCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBridgeStore } from "@/lib/store";
import { useOrchestratorStream } from "@/lib/hooks/useOrchestratorStream";
import { ToolCallRow } from "./ToolCallRow";

export function AgentPanel() {
  const phase = useBridgeStore((s) => s.phase);
  const agent = useBridgeStore((s) => s.agent);
  const scenarioId = useBridgeStore((s) => s.scenarioId);
  const startStream = useOrchestratorStream();

  const visible =
    phase === "assessing" ||
    phase === "decision" ||
    phase === "accepted" ||
    phase === "dismissed" ||
    agent.status === "error";

  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(visible));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [agent.toolCalls.length, agent.rationaleDraft, agent.status]);

  if (!visible) return null;

  const status = agent.status;
  const statusPill =
    status === "thinking" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-300">
        <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
        AI Assessing
      </span>
    ) : status === "done" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Complete
      </span>
    ) : status === "writing" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-300">
        <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
        Streaming Rationale
      </span>
    ) : status === "error" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-rose-300">
        <span className="size-1.5 rounded-full bg-rose-400" />
        Error
      </span>
    ) : null;

  const hideOnMobile = phase === "decision";

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 sm:left-auto top-16 sm:top-20 w-full sm:w-[420px] sm:right-6 z-20 transition-all duration-300 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        } ${hideOnMobile ? "hidden sm:block" : ""}`}
    >
      <div className="h-[calc(100vh-6rem)] flex flex-col rounded-t-2xl sm:rounded-2xl glass-panel-strong border border-slate-800 shadow-2xl overflow-hidden">
        {/* Panel Header */}
        <div className="h-14 shrink-0 px-4 flex items-center justify-between hairline-b bg-[#0A1326]/80">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Bot className="size-4 text-cyan-400" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100">AI Voyage Copilot</span>
              <span className="text-[10px] font-mono text-slate-400">Autonomous Reasoning Engine</span>
            </div>
          </div>
          {statusPill}
        </div>

        {/* Phase Status Banners */}
        {phase === "accepted" && (
          <div className="shrink-0 px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4" /> Course accepted &amp; logged to vessel audit
          </div>
        )}
        {phase === "dismissed" && (
          <div className="shrink-0 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs flex items-center gap-2">
            <XCircle className="size-4" /> Advisory dismissed by watch officer
          </div>
        )}

        {/* Error Alert */}
        {agent.error && (
          <div className="shrink-0 mx-4 my-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-rose-300">
                Orchestrator Notice
              </div>
              <div className="mt-1 text-xs text-rose-200/90 leading-snug">
                {agent.error}
              </div>
              <div className="mt-2.5">
                <Button
                  size="sm"
                  onClick={() => startStream(scenarioId)}
                  className="hover-lift h-7 px-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs rounded-lg"
                >
                  <RotateCw className="size-3 mr-1" /> Retry Stream
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tool Call & Rationale Feed */}
        <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {agent.toolCalls.length === 0 && status === "thinking" && (
            <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
              <Sparkles className="size-6 text-cyan-400 animate-spin mb-2" />
              <span className="text-xs text-slate-400 font-medium">Initializing AI risk evaluation...</span>
            </div>
          )}

          {agent.toolCalls.map((tc, i) => (
            <ToolCallRow key={`${tc.name}-${i}`} tc={tc} index={i} />
          ))}

          {(agent.rationaleDraft || agent.status === "writing") && (
            <div className="p-4 bg-slate-900/40">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <MessageSquareText className="size-4 text-cyan-400" />
                  <span>Captain's AI Rationale</span>
                </div>
                {agent.status === "writing" && (
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider animate-pulse">
                    Live Stream
                  </span>
                )}
              </div>

              {agent.rationaleFallbackMessage && (
                <div className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200">
                  {agent.rationaleFallbackMessage}
                </div>
              )}

              <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                {agent.rationaleDraft}
                {agent.status === "writing" && (
                  <span className="ml-1 inline-block size-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </p>
            </div>
          )}

          {status === "thinking" && (
            <div className="p-4 flex items-center justify-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
              <span className="size-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.3s]" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                Processing maritime models
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
