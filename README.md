# BootPulse

**BootPulse** is a cash-flow, runway and scenario-planning dashboard for bootstrapped founders.

It answers the one question that matters most — *"How many months can we keep going, and what happens if we make this decision?"* — in under five minutes, with every calculation visible and editable.

> BootPulse is a planning tool and does not provide financial advice.

---

## Phase 1 (this repository)

Phase 1 is a **frontend-only** MVP (see `PRD.md` §2.2):

- No backend, no database, no authentication service, no payment provider, no environment variables.
- All data lives in **your own browser** (`localStorage`), seeded with a fictional demo business ("Lumen Notes Ltd").
- Real billing is **simulated** ("Test mode – no payment will be taken").
- All financial logic lives in one pure TypeScript module, `src/lib/finance.ts`, covered by unit tests.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS |
| State + persistence | Zustand with `localStorage` persistence |
| Charts | Recharts |
| Testing | Vitest |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `http://localhost:5173` |
| `npm run build` | Type-check (`tsc --noEmit`) then build the static bundle into `dist/` |
| `npm run test` | Run the Vitest unit tests once |
| `npm run test:watch` | Run the unit tests in watch mode |
| `npm run preview` | Serve the production build locally |

## Pages

`/` landing · `/signup` · `/login` · `/dashboard` · `/revenue` · `/expenses` · `/cash-flow` · `/scenarios` · `/milestones` · `/decisions` · `/settings` · `/pricing` · `/privacy`

## Deployment

Static output, zero configuration. On Vercel the preset is auto-detected as **Vite**; no environment
variables are required. `vercel.json` rewrites all routes to `/index.html` so deep links such as
`/dashboard` do not 404.

## Documentation

- `PRD.md` — product blueprint (problem, personas, scope, data model, calculation rules, quality standards)
- `tasklist.md` — implementation checklist with verification gates

## Privacy in one line

Everything you type stays in this browser. There are no cookies, no analytics and no tracking in Phase 1.
See `/privacy` inside the app, and use **Settings → Export all data / Delete all data** at any time.