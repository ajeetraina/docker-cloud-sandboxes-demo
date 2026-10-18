"use client";

import { useMemo, useState } from "react";
import { demos as all, categories, type Category, type Difficulty } from "@/data/demos";
import { DemoCard } from "./DemoCard";

const difficulties: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-docker-blue bg-docker-blue text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function DemoCatalog() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [diff, setDiff] = useState<Difficulty | "All">("All");
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((d) => {
      if (cat !== "All" && d.category !== cat) return false;
      if (diff !== "All" && d.difficulty !== diff) return false;
      if (!needle) return true;
      return (
        d.name.toLowerCase().includes(needle) ||
        d.tagline.toLowerCase().includes(needle) ||
        d.tech.some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [cat, diff, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search demos, agents, or tech (e.g. DHI, Go SDK, parallel)"
          aria-label="Search demos"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-docker-blue focus:ring-2 focus:ring-docker-blue/20"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</span>
          <Chip active={cat === "All"} onClick={() => setCat("All")}>All</Chip>
          {categories.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Level</span>
          <Chip active={diff === "All"} onClick={() => setDiff("All")}>All</Chip>
          {difficulties.map((d) => (
            <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>{d}</Chip>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500" aria-live="polite">
        {results.length} demo{results.length === 1 ? "" : "s"}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No demos match those filters. Try clearing the search or picking “All”.
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => (
            <DemoCard key={d.slug} demo={d} />
          ))}
        </div>
      )}
    </div>
  );
}
