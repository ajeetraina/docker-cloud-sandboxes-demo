"use client";

import { useState } from "react";
import { Copy, Check } from "./icons";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable */
        }
      }}
      aria-label={copied ? "Copied" : label ?? "Copy to clipboard"}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-docker-blue"
    >
      {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}
