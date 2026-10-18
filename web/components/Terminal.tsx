"use client";

import { useEffect, useRef, useState } from "react";
import { CopyButton } from "./CopyButton";

export type Line = { kind: "cmd" | "out" | "ok" | "muted"; text: string };

const color: Record<Line["kind"], string> = {
  cmd: "text-slate-100",
  out: "text-slate-300",
  ok: "text-emerald-400",
  muted: "text-slate-500",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * A read-only, animated terminal. It types a fixed script for illustration and
 * executes nothing. Pass `simulated` (default true) to show the badge.
 */
export function Terminal({
  title = "sandbox",
  lines,
  simulated = true,
}: {
  title?: string;
  lines: Line[];
  simulated?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0); // completed lines
  const [typed, setTyped] = useState(0); // chars typed of current cmd line
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (reduced) {
      setShown(lines.length);
      setTyped(0);
      return;
    }
    setShown(0);
    setTyped(0);
    let cancelled = false;

    const run = (idx: number, chars: number) => {
      if (cancelled) return;
      if (idx >= lines.length) {
        timer.current = setTimeout(() => {
          setShown(0);
          setTyped(0);
          run(0, 0);
        }, 4200);
        return;
      }
      const line = lines[idx];
      if (line.kind === "cmd" && chars < line.text.length) {
        setShown(idx);
        setTyped(chars + 1);
        timer.current = setTimeout(() => run(idx, chars + 1), 26);
      } else {
        setShown(idx + 1);
        setTyped(0);
        const pause = line.kind === "cmd" ? 520 : 300;
        timer.current = setTimeout(() => run(idx + 1, 0), pause);
      }
    };
    timer.current = setTimeout(() => run(0, 0), 500);
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lines, reduced]);

  const copyText = lines.filter((l) => l.kind === "cmd").map((l) => l.text.replace(/^\$ /, "")).join("\n");

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-slate-400">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {simulated && (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
              Simulated
            </span>
          )}
          <CopyButton text={copyText} label="Copy commands" />
        </div>
      </div>
      <pre className="min-h-[320px] overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => {
          if (i > shown) return null;
          const typing = i === shown && line.kind === "cmd" && !reduced;
          const text = typing ? line.text.slice(0, typed) : line.text;
          return (
            <div key={i} className={color[line.kind]}>
              {text}
              {typing && <span className="ml-0.5 inline-block w-2 animate-blink bg-slate-200 align-middle">&nbsp;</span>}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
