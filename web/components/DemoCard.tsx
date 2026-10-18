import type { Demo } from "@/data/demos";
import { Arrow, Check } from "./icons";

const diffColor: Record<Demo["difficulty"], string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

export function DemoCard({ demo }: { demo: Demo }) {
  return (
    <a
      href={demo.github}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-docker-blue/40 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          {demo.category}
        </span>
        {demo.status === "verified" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <Check width={12} height={12} /> Verified
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            Scripted
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-docker-blue">
        {demo.name}
      </h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{demo.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {demo.tech.slice(0, 4).map((t) => (
          <span key={t} className="rounded-md border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 font-medium ${diffColor[demo.difficulty]}`}>
            {demo.difficulty}
          </span>
          <span>~{demo.minutes} min</span>
        </div>
        <span className="inline-flex items-center gap-1 font-medium text-docker-blue opacity-0 transition group-hover:opacity-100">
          Open <Arrow width={14} height={14} />
        </span>
      </div>
    </a>
  );
}
