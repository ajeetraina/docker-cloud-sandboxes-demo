import { CopyButton } from "./CopyButton";
import type { Step } from "@/data/demos";

/** A dark, copyable command block with optional per-command explanations. */
export function CommandBlock({ steps, expected }: { steps: Step[]; expected?: string }) {
  const copyText = steps.map((s) => s.cmd.replace(/^\$ /, "")).join("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-ink shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <CopyButton text={copyText} label="Copy" />
      </div>
      <div className="px-5 py-4 font-mono text-[13px] leading-relaxed">
        {steps.map((s, i) => (
          <div key={i} className={i > 0 ? "mt-3" : ""}>
            <div className="text-slate-100">
              <span className="select-none text-docker-blue">$ </span>
              {s.cmd.replace(/^\$ /, "")}
            </div>
            {s.explain && <div className="mt-0.5 text-[12px] text-slate-500"># {s.explain}</div>}
          </div>
        ))}
        {expected && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Expected output</div>
            <pre className="whitespace-pre-wrap text-[12.5px] text-emerald-300/90">{expected}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
