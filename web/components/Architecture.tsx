"use client";

import { useState } from "react";

type Node = {
  id: string;
  label: string;
  sub: string;
  role: string;
};

const flow: Node[] = [
  { id: "dev", label: "Your Machine", sub: "sbx CLI · Go/TS/Python SDK", role: "You run the sbx CLI or an SDK program. Credentials stay here; for automation the SDK exchanges a Docker PAT for a short-lived access token." },
  { id: "plane", label: "Cloud Control Plane", sub: "connect.docker.com", role: "Authenticates the request, schedules the microVM, assigns public URLs for published ports, and manages the sandbox lifecycle." },
  { id: "sandbox", label: "Cloud Sandbox", sub: "isolated microVM", role: "A Linux microVM with its own filesystem and processes, sized by CPU/memory and bounded by a TTL. The unit of isolation." },
  { id: "agent", label: "AI Coding Agent", sub: "Claude · Codex · Gemini · OpenCode", role: "The agent runs inside the sandbox. You attach to its terminal with `sbx --cloud attach`, or drive it programmatically." },
  { id: "repo", label: "Repo / App", sub: "workspace", role: "The workspace the agent reads and builds: a cloned repository, or a new containerized application." },
];

const boundary: Node[] = [
  { id: "isolation", label: "Isolation", sub: "microVM boundary", role: "Each sandbox is a separate microVM. Code running inside cannot touch your host or any other sandbox." },
  { id: "proxy", label: "Credential Proxy", sub: "secrets on the wire", role: "Stored secrets are injected into outbound requests to the matching host by the proxy. The real value never enters the sandbox's filesystem or environment." },
  { id: "netpol", label: "Network Policy", sub: "egress control", role: "Allow-all, balanced, or deny-all presets plus per-sandbox allow/deny rules decide exactly which hosts a sandbox can reach." },
  { id: "ttl", label: "Lifecycle & TTL", sub: "auto-stop", role: "A sandbox auto-stops at its TTL (24h hard cap) and is billed only while running. Tear it down when finished." },
];

const all = [...flow, ...boundary];

export function Architecture() {
  const [selected, setSelected] = useState("sandbox");
  const node = all.find((n) => n.id === selected)!;

  const NodeButton = ({ n, accent }: { n: Node; accent?: boolean }) => {
    const active = selected === n.id;
    return (
      <button
        type="button"
        onClick={() => setSelected(n.id)}
        aria-pressed={active}
        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
          active
            ? "border-docker-blue bg-docker-blue text-white shadow-soft"
            : accent
              ? "border-slate-700 bg-white/[0.04] text-slate-200 hover:border-docker-blue/50"
              : "border-slate-200 bg-white text-slate-800 hover:border-docker-blue/50 hover:shadow-card"
        }`}
      >
        <div className="text-sm font-semibold">{n.label}</div>
        <div className={`font-mono text-[11px] ${active ? "text-white/80" : accent ? "text-slate-400" : "text-slate-500"}`}>
          {n.sub}
        </div>
      </button>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {flow.map((n, i) => (
            <div key={n.id} className="flex flex-1 items-center gap-2">
              <div className="flex-1"><NodeButton n={n} /></div>
              {i < flow.length - 1 && (
                <span className="hidden text-docker-blue sm:inline" aria-hidden>→</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-ink bg-grid-dark p-4">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-slate-400">
            Inside the sandbox boundary
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {boundary.map((n) => (
              <NodeButton key={n.id} n={n} accent />
            ))}
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-docker-blue/20 bg-docker-sky/50 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-docker-blue">Component</div>
        <h3 className="mt-1 text-xl font-bold text-slate-900">{node.label}</h3>
        <p className="mt-3 leading-relaxed text-slate-700">{node.role}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          Verified product behavior
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Click any component in the diagram to learn its role.
        </p>
      </aside>
    </div>
  );
}
