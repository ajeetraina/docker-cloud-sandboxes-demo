import { REPO } from "@/data/demos";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-slate-500">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p>
            A community playground for <span className="font-medium text-slate-700">Docker Cloud Sandboxes</span>.
            Not an official Docker product.
          </p>
          <div className="flex gap-4">
            <a className="hover:text-docker-blue" href={REPO} target="_blank" rel="noreferrer">GitHub</a>
            <a className="hover:text-docker-blue" href="https://docs.docker.com/ai/sandboxes/" target="_blank" rel="noreferrer">Docs</a>
            <a className="hover:text-docker-blue" href="https://docs.docker.com/ai/sandboxes-api/" target="_blank" rel="noreferrer">SDK & API</a>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Terminal walkthroughs on this site are simulated and create no cloud resources. Run the real demos from the CLI or Go SDK in the repository.
        </p>
      </div>
    </footer>
  );
}
