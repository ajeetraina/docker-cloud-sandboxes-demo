import Link from "next/link";
import type { Demo } from "@/data/demos";
import { CommandBlock } from "./CommandBlock";
import { Arrow, Check, GitHub } from "./icons";

const diffColor: Record<Demo["difficulty"], string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  Advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

function Section({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-slate-200 py-8 first:border-t-0">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-docker-blue text-sm font-bold text-white">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <div className="mt-3 text-slate-700">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function Tutorial({ demo }: { demo: Demo }) {
  const runSteps = demo.quickstart.filter((s) => !/teardown/.test(s.cmd));
  const sections = [
    { id: "build", title: "What you'll build" },
    { id: "why", title: "Why it matters" },
    { id: "architecture", title: "Understand the architecture" },
    { id: "prereqs", title: "Configure prerequisites" },
    { id: "run", title: "Launch, connect & run" },
    { id: "inspect", title: "Inspect the results" },
    { id: "security", title: "The security boundary" },
    { id: "teardown", title: "Tear down" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* header */}
      <Link href="/demos/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-docker-blue">
        ← All demos
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">{demo.category}</span>
            <span className={`rounded-md border px-2 py-1 font-medium ${diffColor[demo.difficulty]}`}>{demo.difficulty}</span>
            <span className="text-slate-500">~{demo.minutes} min</span>
            {demo.status === "verified" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                <Check width={12} height={12} /> Verified live
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{demo.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-600">{demo.tagline}</p>
        </div>
        <a
          href={demo.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <GitHub width={16} height={16} /> Source
        </a>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_15rem]">
        <div className="order-2 lg:order-1">
          <Section n={1} id="build" title="What you'll build">
            <p>{demo.whatYouBuild}</p>
          </Section>

          <Section n={2} id="why" title="Why it matters">
            <p>{demo.whyItMatters}</p>
          </Section>

          <Section n={3} id="architecture" title="Understand the architecture">
            <p>
              Your machine talks to the Docker cloud control plane, which schedules an isolated
              microVM. The agent runs inside that sandbox, bounded by a network policy and a TTL.
            </p>
            <Link href="/#architecture" className="mt-3 inline-flex items-center gap-1 font-medium text-docker-blue hover:underline">
              Open the interactive diagram <Arrow width={15} height={15} />
            </Link>
          </Section>

          <Section n={4} id="prereqs" title="Configure prerequisites">
            <ul className="space-y-2">
              {demo.prerequisites.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <Check width={18} height={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span dangerouslySetInnerHTML={{ __html: p.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">$1</code>') }} />
                </li>
              ))}
            </ul>
          </Section>

          <Section n={5} id="run" title="Launch, connect & run">
            <p className="mb-3">Run these from the repository root. Reach the result via <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">{demo.reach}</code>.</p>
            <CommandBlock steps={runSteps} expected={demo.expected} />
          </Section>

          <Section n={6} id="inspect" title="Inspect the results">
            <p>
              {demo.expected
                ? "You should see output like the block above. If not, check the Troubleshooting section in the demo's README."
                : "Attach to the session and interact with the agent directly. See the demo's README for what to expect."}
            </p>
          </Section>

          <Section n={7} id="security" title="The security boundary">
            <p>{demo.securityNote}</p>
          </Section>

          <Section n={8} id="teardown" title="Tear down">
            <p className="mb-3">Cloud sandboxes bill while running. Clean up when finished:</p>
            <CommandBlock steps={[{ cmd: demo.cleanup }]} />
          </Section>
        </div>

        {/* step nav */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</div>
              <ol className="space-y-1.5 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex gap-2 rounded-md px-2 py-1 text-slate-600 transition hover:bg-white hover:text-docker-blue">
                      <span className="font-mono text-slate-400">{i + 1}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
