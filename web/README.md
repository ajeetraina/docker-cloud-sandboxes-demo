# Web Portal

A developer experience for the Docker Cloud Sandboxes demos: a hero, an interactive
demo catalog with filters, and a clickable architecture diagram.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, static-exportable
(deployable to GitHub Pages, Vercel, Netlify, or any static host).

## Run locally

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

## Build (static export)

```bash
npm run build        # outputs a static site to ./out
npx serve out        # preview the production build
```

## Structure

```
web/
  app/                 # routes: / (landing), /demos (catalog)
  components/          # Hero, Terminal, Architecture, DemoCatalog, DemoCard, ...
  data/demos.ts        # single source of truth for every demo (name, status, commands)
```

`data/demos.ts` is the one place demo metadata lives, so the catalog never drifts from the
actual shell/SDK demos. To add a demo to the portal, add an entry there.

## Guardrails

- The terminal walkthroughs are **simulated and read-only** — they type fixed scripts for
  illustration and execute nothing. No cloud resources are created from the browser.
- Animations never imply that a real cloud operation occurred.
- Only demos that were run live end-to-end are marked **verified**.

The portal is optional. All demos run from the CLI or Go SDK without it.
