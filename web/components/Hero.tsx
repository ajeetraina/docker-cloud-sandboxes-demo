import Link from "next/link";
import { REPO, stats } from "@/data/demos";
import { Terminal, type Line } from "./Terminal";
import { Arrow, GitHub } from "./icons";

const lifecycle: Line[] = [
  { kind: "muted", text: "# Create, use, and tear down an isolated cloud sandbox" },
  { kind: "cmd", text: "$ sbx --cloud run -d --name codex-demo --cpus 1 --memory 2g codex" },
  { kind: "ok", text: "  ✓ configured 1 kit (6s)" },
  { kind: "muted", text: "  sbx_001m5753hz76ssbzjhvws0mb7d0" },
  { kind: "cmd", text: "$ sbx --cloud attach codex-demo" },
  { kind: "out", text: "  OpenAI Codex  ·  model: gpt-5.6-sol  ·  ~/workspace" },
  { kind: "cmd", text: "$ sbx --cloud ttl codex-demo" },
  { kind: "out", text: "  Expires in 59m (MAX remaining: 23h59m)" },
  { kind: "cmd", text: "$ ./teardown.sh" },
  { kind: "ok", text: "  Removed sandbox codex-demo" },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-docker-blue/40 to-transparent" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-docker-blue/20 bg-docker-sky px-3 py-1 text-xs font-medium text-docker-blue">
            Docker Cloud Sandboxes · Developer Playground
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            Your AI Agents.
            <br />
            <span className="text-docker-blue">Their Own Cloud Sandboxes.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Explore, launch, and orchestrate AI coding agents in isolated Docker Cloud
            Sandboxes through hands-on demos, CLI workflows, and SDK examples.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/demos/"
              className="inline-flex items-center gap-2 rounded-xl bg-docker-blue px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-[#1657d6]"
            >
              Explore Demos <Arrow width={18} height={18} />
            </Link>
            <Link
              href="/#quickstart"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Quick Start
            </Link>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:text-docker-blue"
            >
              <GitHub width={18} height={18} /> View on GitHub
            </a>
          </div>
          <div className="mt-10 flex gap-8 border-t border-slate-200 pt-6">
            <Stat value={`${stats.demos}`} label="Demos" />
            <Stat value={`${stats.agents}`} label="AI agents" />
            <Stat value={`${stats.languages}`} label="Parallel langs" />
            <Stat value={`${stats.verified}`} label="Verified live" />
          </div>
        </div>
        <div className="lg:pl-4">
          <Terminal title="codex-demo · sbx --cloud" lines={lifecycle} />
          <p className="mt-3 text-center text-xs text-slate-500">
            A simulated walkthrough. These exact commands run real sandboxes from the repo.
          </p>
        </div>
      </div>
    </section>
  );
}
