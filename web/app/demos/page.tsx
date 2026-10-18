import type { Metadata } from "next";
import { DemoCatalog } from "@/components/DemoCatalog";

export const metadata: Metadata = {
  title: "Demo Catalog — Docker Cloud Sandboxes",
  description: "Browse and filter every Docker Cloud Sandboxes demo by category, level, and technology.",
};

export default function DemosPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-widest text-docker-blue">Demo catalog</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
          Every demo, one place
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Each card links to runnable scripts or SDK code in the repository. Filter by category, level,
          or search for a technology like <span className="font-medium text-slate-800">DHI</span> or{" "}
          <span className="font-medium text-slate-800">parallel</span>.
        </p>
      </div>
      <div className="mt-10">
        <DemoCatalog />
      </div>
    </section>
  );
}
