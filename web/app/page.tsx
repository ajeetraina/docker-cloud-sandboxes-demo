import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Architecture } from "@/components/Architecture";
import { DemoCard } from "@/components/DemoCard";
import { CopyButton } from "@/components/CopyButton";
import { demos, REPO } from "@/data/demos";
import { Arrow, Bolt, Cpu, Shield } from "@/components/icons";

const pillars = [
  {
    icon: Cpu,
    title: "AI Coding Agents",
    body: "Launch Claude Code, Codex, Gemini CLI, or OpenCode in a sandbox and attach to a live terminal session.",
  },
  {
    icon: Shield,
    title: "Security & Governance",
    body: "Proxy-injected secrets, network egress policies, and Docker Hardened Images - the credential never enters the sandbox.",
  },
  {
    icon: Bolt,
    title: "Programmatic Automation",
    body: "Drive the same sandboxes from the Go SDK: create, run, and fan out across many microVMs in parallel.",
  },
];

const featured = ["codex-dhi", "sdk-parallel", "codex"]
  .map((s) => demos.find((d) => d.slug === s)!)
  .filter(Boolean);

function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-docker-blue">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      {children && <p className="mt-3 text-slate-600">{children}</p>}
    </div>
  );
}

const cliQuickstart = `git clone ${REPO.replace("https://github.com/", "https://github.com/")}.git
cd docker-cloud-sandboxes-demo/agent-cli/codex
./launch.sh            # create a Codex cloud sandbox
sbx --cloud attach codex-demo
./teardown.sh          # delete it when done`;

const sdkQuickstart = `cd sdk/go
export DOCKER_USERNAME=... DOCKER_PAT=...
go run ./parallel      # 5 cloud sandboxes at once`;

export default function Page() {
  return (
    <>
      <Hero />

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead eyebrow="What's inside" title="Three ways to experience cloud sandboxes">
          Every demo is a small, copy-and-run example backed by real scripts and SDK code in the repo.
        </SectionHead>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-docker-sky text-docker-blue">
                <p.icon width={22} height={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="scroll-mt-20 border-y border-slate-200 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead eyebrow="How it works" title="The anatomy of a cloud sandbox">
            From your machine to an isolated microVM running an AI agent. Click any component to learn its role.
          </SectionHead>
          <div className="mt-10">
            <Architecture />
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section id="quickstart" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <SectionHead eyebrow="Quick start" title="Run a meaningful demo in minutes">
          Prerequisite: the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">sbx</code> CLI,
          signed in with <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">sbx login</code>.
        </SectionHead>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {[
            { tag: "CLI", title: "Attach to an agent", code: cliQuickstart },
            { tag: "Go SDK", title: "Fan out in parallel", code: sdkQuickstart },
          ].map((b) => (
            <div key={b.tag} className="overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-soft">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <span className="font-mono text-xs text-slate-400">{b.title}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-docker-blue/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-docker-blue">{b.tag}</span>
                  <CopyButton text={b.code} label="Copy" />
                </div>
              </div>
              <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-200">{b.code}</pre>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Cloud sandboxes bill while running and auto-expire at their TTL. Always tear down when finished.
        </p>
      </section>

      {/* Featured */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-end justify-between">
            <SectionHead eyebrow="Featured" title="Start with a verified demo" />
            <Link href="/demos/" className="hidden shrink-0 items-center gap-1 font-medium text-docker-blue hover:underline sm:inline-flex">
              All demos <Arrow width={16} height={16} />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d) => (
              <DemoCard key={d.slug} demo={d} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/demos/" className="inline-flex items-center gap-1 font-medium text-docker-blue">
              All demos <Arrow width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-docker-blue">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-16 text-center">
          <h2 className="max-w-2xl text-3xl font-bold text-white">
            Give your AI agents their own cloud sandboxes.
          </h2>
          <p className="max-w-xl text-white/80">
            Clone the repo, pick a demo, and launch an isolated environment in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/demos/" className="rounded-xl bg-white px-6 py-3 font-semibold text-docker-blue transition hover:bg-slate-100">
              Explore Demos
            </Link>
            <a href={REPO} target="_blank" rel="noreferrer" className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
