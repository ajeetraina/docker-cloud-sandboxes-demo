import Link from "next/link";
import { REPO } from "@/data/demos";
import { GitHub } from "./icons";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-semibold text-slate-900">
          <span className="leading-tight">
            Cloud Sandboxes
            <span className="block text-[11px] font-normal text-slate-500">Developer Playground</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/demos/" className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Demos</Link>
          <Link href="/#architecture" className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block">Architecture</Link>
          <Link href="/#quickstart" className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:block">Quick Start</Link>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-800"
          >
            <GitHub width={16} height={16} /> GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
