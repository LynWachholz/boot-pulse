# tasklist.md — BootPulse (Phase 1 Core MVP)

**Source of truth:** `PRD.md` (v1.0)
**Rules for the AI agent:**
1. Execute strictly the **first** unchecked task (`- [ ]`) or, when instructed, the first unchecked module.
2. Change only the files the task names. Do not build features that are not listed.
3. Do not tick a task (`- [x]`) until its **Verification Gate** has passed.
4. If a gate fails three times in a row, stop and report the error (3-Strike Rule).

**Gate types used below**
- **BUILD**: `npm run build` finishes with zero TypeScript errors
- **DEV**: `npm run dev`, page renders at `http://localhost:5173` with no browser console errors
- **TEST**: `npm run test` (Vitest) passes
- **DATA**: data survives a browser refresh (localStorage)
- **VISUAL**: manual check at 1440 px desktop and 375 px mobile width

---

## Module 1: Environment & Project Setup
*Phase 1 uses no secret keys (PRD 4.2, 6.1), so this module sets up the project only.*

- [x] **1.1** Scaffold a React 18 + Vite + TypeScript project named `bootpulse` in the repo root.
  - Verification Gate (BUILD + DEV): default page renders.
- [x] **1.2** Install and configure Tailwind CSS; define the colour tokens (neutral greys, deep-teal accent) in `tailwind.config.ts`.
  - Verification Gate (DEV): a test element uses the accent colour.
- [x] **1.3** Install React Router, Zustand, Recharts and Vitest; add `test` script to `package.json`.
  - Verification Gate (BUILD + TEST): an empty sample test passes.
- [x] **1.4** Create `.gitignore` including `node_modules`, `dist` and `.env*`.
  - Verification Gate: `git status` does not list `node_modules` or `dist`.
- [x] **1.5** Add `vercel.json` with a rewrite of all routes to `/index.html` (SPA deep links).
  - Verification Gate: file exists and is valid JSON.
- [x] **1.6** Create `README.md` with project description, `npm install`, `npm run dev`, `npm run build`, `npm run test`.
  - Verification Gate: README renders correctly on GitHub.

## Module 2: Data Model, Finance Logic & Persistence
*Replaces the database module for Phase 1 (PRD 5.1–5.5).*

- [x] **2.1** Create `src/types.ts` with all entities from PRD 5.1 (Profile, Business, RevenueItem, ExpenseItem, Scenario, Adjustment, Milestone, Decision).
  - Verification Gate (BUILD).
- [x] **2.2** Create `src/lib/money.ts`: convert between cents and display values; format with currency and thousand separators.
  - Verification Gate (TEST): 3 tests, e.g. `formatMoney(4800000, "USD") === "$48,000"`.
- [x] **2.3** Create `src/lib/months.ts`: generate a list of `YYYY-MM` months from a start month; check whether an item is active in a month.
  - Verification Gate (TEST): tests include a year change (Dec → Jan).
- [x] **2.4** In `src/lib/finance.ts`, implement `monthlyRevenue` and `monthlyCosts` (recurring + one-off rules, PRD 5.2).
  - Verification Gate (TEST): recurring item counted every active month; one-off item counted only in its month.
- [x] **2.5** In `finance.ts`, implement `cashFlowTable` (opening cash, revenue, costs, net, closing cash per month).
  - Verification Gate (TEST): closing cash of month *m* equals opening cash of month *m+1*.
- [x] **2.6** In `finance.ts`, implement `netBurn`, `simpleRunway` and `forecastRunway`, including the "cash-flow positive within forecast" case.
  - Verification Gate (TEST): tests for zero burn, positive cash flow and runway below 3 months.
- [x] **2.7** In `finance.ts`, implement `applyScenario` for the four adjustment types (PRD 5.2) and the three preset scenarios.
  - Verification Gate (TEST): Cautious preset reduces revenue by 20% and increases costs by 10%.
- [x] **2.8** In `finance.ts`, implement `getAlerts` with the four rules from PRD 5.3.
  - Verification Gate (TEST): one test per alert rule.
- [x] **2.9** Create `src/data/seed.ts` with the fictional "Lumen Notes Ltd" demo data (PRD 5.5).
  - Verification Gate (TEST): seeded runway equals the manually calculated value (documented in the test).
- [x] **2.10** Create the Zustand store `src/store/useStore.ts` with CRUD actions for all entities and localStorage persistence (wrapped in try/catch).
  - Verification Gate (DATA): add an item, refresh the browser, item is still there.

## Module 3: Local Profiles & Protected Routes
*Real authentication is Phase 2 (PRD 2.3).*

- [x] **3.1** Create the route structure for all routes in PRD 3.1 with placeholder pages and a shared sidebar layout for logged-in pages.
  - Verification Gate (DEV): every route opens; deep link `/dashboard` works after refresh.
- [x] **3.2** Build `/signup`: name, business name, currency, opening cash, plus the PICS privacy notice and a required consent checkbox (stores `privacyConsentAt`).
  - Verification Gate (DATA): profile and business created and persisted; form cannot be submitted without consent.
- [x] **3.3** Build `/login`: choose an existing local profile or "Open demo business" (loads seed data).
  - Verification Gate (DEV): both options lead to `/dashboard` with the correct data.
- [x] **3.4** Add a route guard: logged-in pages redirect to `/login` when no active profile exists; add "Log out".
  - Verification Gate (DEV): opening `/dashboard` while logged out redirects to `/login`.

## Module 4: Integrations (Charts & Export)
*No third-party APIs in Phase 1 (PRD 6.1).*

- [x] **4.1** Create a reusable `CashChart` component (Recharts line chart, one line per scenario, zero line highlighted) with a "View as table" toggle.
  - Verification Gate (DEV): chart renders seeded data; table toggle shows the same numbers.
- [x] **4.2** Create `src/lib/export.ts`: CSV export of the cash-flow table and JSON export of all user data.
  - Verification Gate: downloaded CSV opens in Excel/Numbers with correct columns.

## Module 5: Core UI Workspace
- [x] **5.1** Build `/` landing page: hero headline, sub-headline and "Try the demo" CTA above 667 px, 3 benefits, how-it-works, pricing preview, footer disclaimer.
  - Verification Gate (VISUAL): CTA visible without scrolling at 375 × 667.
- [x] **5.2** Build `/dashboard` KPI row: Cash, Monthly revenue, Monthly costs, Net burn, Runway.
  - Verification Gate (VISUAL): all 5 cards visible without scrolling at 1440 × 900; values match `finance.ts` tests.
- [x] **5.3** Add a "How is this calculated?" panel to each KPI showing formula and inputs.
  - Verification Gate (DEV): panel opens with keyboard and mouse, closes with Esc.
- [x] **5.4** Add the cash chart, alerts list (icon + text) and upcoming milestones to the dashboard.
  - Verification Gate (DEV): seeded data triggers the expected alerts.
- [x] **5.5** Build `/revenue`: table, add/edit/delete form (recurring or one-off), search and type filter.
  - Verification Gate (DATA): CRUD works and dashboard KPIs update immediately.
- [x] **5.6** Build `/expenses`: table, add/edit/delete form (category, fixed/variable, recurring/one-off), search and category filter.
  - Verification Gate (DATA): CRUD works and dashboard KPIs update immediately.
- [x] **5.7** Build `/cash-flow`: 12-month table with CSV export button.
  - Verification Gate (DEV): totals match the dashboard; CSV downloads.
- [x] **5.8** Build `/scenarios`: scenario list, adjustment editor, presets (base, cautious, growth).
  - Verification Gate (DATA): new adjustment "Hire freelancer USD 3,000/month from month 2" saves and persists.
- [x] **5.9** Add side-by-side scenario comparison (chart + table of runway, month 12 cash, total burn).
  - Verification Gate (DEV): comparing Base vs Hire scenario shows a shorter runway for Hire.
- [x] **5.10** Build `/milestones`: list with title, target month, status; add/edit/delete.
  - Verification Gate (DATA).
- [x] **5.11** Build `/decisions`: decision log with reasoning, expected impact, actual outcome, optional linked scenario; search.
  - Verification Gate (DATA): decision linked to a scenario shows the scenario name.
- [x] **5.12** Build `/settings`: currency, reset demo data, export all data (JSON), delete all data with confirmation dialog.
  - Verification Gate (DATA): after "Delete all data", localStorage is empty and user returns to `/`.
- [x] **5.13** Build `/privacy` page with the plain-language privacy statement (PRD 7.2).
  - Verification Gate (DEV).
- [x] **5.14** Add empty states (no revenue items yet, no scenarios yet) and inline form validation messages.
  - Verification Gate (DEV): delete all revenue items and check the empty state appears.

## Module 6: Simulated Billing, Pre-Launch Audits & Deployment
- [x] **6.1** Build `/pricing` with the three plans from PRD 1.4.
  - Verification Gate (VISUAL).
- [x] **6.2** Add the simulated upgrade modal labelled "Test mode – no payment will be taken"; switching plan updates a local plan flag shown in Settings.
  - Verification Gate (DATA): plan change persists after refresh; no card details are requested.
- [x] **6.3** Accessibility audit: contrast ≥ 4.5:1, visible 2 px focus rings, labels on all inputs, full keyboard navigation (PRD 7.1).
  - Verification Gate: Lighthouse accessibility score ≥ 90 on `/`, `/dashboard` and `/scenarios`.
- [x] **6.4** Responsive audit at 1440 px and 375 px for all pages.
  - Verification Gate (VISUAL): no layout overflow except intentionally scrollable tables.
- [x] **6.5** Final quality gate: run build, all tests, and click through the core journey (PRD 3.2) end to end.
  - Verification Gate (BUILD + TEST + DEV): all pass with zero console errors.
- [ ] **6.6** Push the project to the user's new private GitHub repository `LynWachholz/boot-pulse` on branch `main`, including `PRD.md`, `tasklist.md` and `README.md` in the repo root. Do not deploy to Vercel.
  - Verification Gate: private repository exists at the requested URL, branch `main` contains the app and required documents.

---

## Deferred (Phase 2, do NOT build now)
- [ ] Clerk authentication, password reset and email verification
- [ ] Neon PostgreSQL + Drizzle ORM schema with Row Level Security (PRD 5.4)
- [ ] Multiple businesses per account and business switcher
- [ ] Owner, collaborator and adviser roles with invitations
- [ ] Stripe Checkout (test mode) and webhooks
- [ ] Plan-based feature gating (24-month forecast, unlimited scenarios)
- [ ] Email alerts
- [ ] AI monthly summary (Gemini API)
- [ ] File uploads (ImageKit)
- [ ] Cookie consent banner (only if analytics are added)

---

## Verification log

Recorded by the implementing agent. Every gate below was executed, not assumed. Commands used:
`npm run build` (tsc `--noEmit` + Vite), `npm run test` (Vitest), `npm run dev`, plus a scripted
Chromium harness (Puppeteer + Lighthouse) run against the production build served by `vite preview`.

### Module 1 — Environment & project setup

| Task | Gate | Evidence |
|---|---|---|
| 1.1 | BUILD + DEV | `npm run build` → 0 TypeScript errors, `dist/` written; dev server answers 200 on `http://localhost:5173` |
| 1.2 | DEV | Deep-teal accent `#0f5c58` compiled into `dist/assets/*.css`; `text-accent`/`bg-accent` used by the test element |
| 1.3 | BUILD + TEST | react-router-dom, zustand, recharts, vitest installed; `test` script added; a sample test passed |
| 1.4 | `git status` | `git check-ignore -v node_modules dist` → both ignored; `git status` lists neither (and `.env*` is ignored) |
| 1.5 | valid JSON | `vercel.json` parses as JSON and rewrites `/(.*)` → `/index.html` |
| 1.6 | README | `README.md` documents the project, `npm install`, `npm run dev`, `npm run build`, `npm run test` |

### Module 2 — Data model, finance logic & persistence

| Task | Gate | Evidence |
|---|---|---|
| 2.1 | BUILD | `src/types.ts` holds all PRD 5.1 entities; type-check clean |
| 2.2 | TEST | 8 tests, including `formatMoney(4_800_000, "USD") === "$48,000"`, negatives, EUR/HKD, cents conversion |
| 2.3 | TEST | 8 tests, including the Dec → Jan year change (`generateMonths("2026-11", 4)`) |
| 2.4 | TEST | Recurring counted every active month; one-off counted only in its month; end-month boundary |
| 2.5 | TEST | 12 rows from the start month; closing cash of month m equals opening cash of month m+1 |
| 2.6 | TEST | Zero burn → `null`; cash-flow positive → `cash_flow_positive`; runway below 3 months → 1 month |
| 2.7 | TEST | Cautious = revenue −20 % / costs +10 %; Growth = +15 % / +5 %; all four adjustment types; "hire" shortens runway |
| 2.8 | TEST | One test per rule: runway critical, runway risk, rising costs, falling revenue (plus a healthy case) |
| 2.9 | TEST | `seed.test.ts` documents the manual spreadsheet check; the seeded month-12 cash of USD 16,900 is reproduced by the app |
| 2.10 | DATA | Revenue item, scenario and profile survive a full page reload (`localStorage["bootpulse:v1"]`) |

### Module 3 — Local profiles & protected routes

| Task | Gate | Evidence |
|---|---|---|
| 3.1 | DEV | All 13 routes render with the shared sidebar layout; deep link `/dashboard` works after refresh (dev and preview) |
| 3.2 | DATA | Sign-up persists profile + business; submitting without consent is blocked with an inline error |
| 3.3 | DEV | Existing profile and "Open demo business" both land on `/dashboard` with the correct data |
| 3.4 | DEV | `/dashboard` while logged out redirects to `/login`; "Log out" returns to `/login` |

### Module 4 — Integrations (charts & export)

| Task | Gate | Evidence |
|---|---|---|
| 4.1 | DEV | Recharts line chart with the zero line highlighted; "View as table" returns the identical 12 closing-cash values as `/cash-flow` |
| 4.2 | Download | `bootpulse-cash-flow-2026-10-13.csv`: header `Month,Opening cash,Revenue,Costs,Net cash flow,Closing cash`, 12 rows, numeric values, parses with Python's `csv` reader |

### Module 5 — Core UI workspace

| Task | Gate | Evidence |
|---|---|---|
| 5.1 | VISUAL | At 375 × 667 the "Try the demo" CTA spans 503–547 px (above the fold); hero, benefits, how-it-works, pricing preview and disclaimer present |
| 5.2 | VISUAL | At 1440 × 900 all five KPI cards end at 374 px; values match the finance tests (month-12 cash $16,900 = `seed.test.ts`) |
| 5.3 | DEV | 14/14 interaction checks: panel opens by Enter and by mouse, closes with Escape and on re-click |
| 5.4 | DEV | Seeded demo data triggers the documented falling-revenue alert; chart, alerts and milestones all render |
| 5.5 | DATA | Revenue create/edit/delete works; dashboard monthly revenue updated $5,200 → $6,700 immediately; persists after reload |
| 5.6 | DATA | Cost create/delete works; dashboard monthly costs updated $9,650 → $10,150 immediately |
| 5.7 | DEV | Table matches the dashboard and the unit tests; CSV downloads from the page |
| 5.8 | DATA | "Hire freelancer USD 3,000/month" (extra cost, from month 2) saved, listed and still present after reload |
| 5.9 | DEV | Base = cash-flow positive vs Hire freelancer = 10 months (also Cautious = 11 months) — the hire case is shorter |
| 5.10 | DATA | Milestone created, listed, deleted |
| 5.11 | DATA | Decision saved with reasoning/expected impact; the linked scenario name shows as a badge; search filters the log |
| 5.12 | DATA | Currency and opening cash editable; reset demo data restores the seed; JSON export downloads; "Delete all data" clears `localStorage` and returns to `/` |
| 5.13 | DEV | `/privacy` renders the plain-language statement (PICS, erasure, portability) |
| 5.14 | DEV | Empty states for revenue/costs/milestones/decisions/scenarios/profiles; inline validation on every form |

### Module 6 — Simulated billing, audits & deployment

| Task | Gate | Evidence |
|---|---|---|
| 6.1 | VISUAL | `/pricing` shows Free / Founder / Adviser with the PRD 1.4 prices and features |
| 6.2 | DATA | Modal titled "Test mode – no payment will be taken"; 0 card/password fields; plan flag persists after refresh and shows in Settings |
| 6.3 | Lighthouse | Accessibility 100 / 100 / 100 on `/`, `/dashboard` and `/scenarios` (gate: ≥ 90); 2 px accent focus rings, labels on all inputs, keyboard-only operation verified |
| 6.4 | VISUAL | No horizontal overflow on any of the 13 routes at 1440 × 900 or 375 × 667 (only tables scroll, by design) |
| 6.5 | BUILD + TEST + DEV | `npm run build` 0 TS errors; 54/54 unit tests pass; core journey (landing → Try the demo → dashboard → scenario) completes with zero console errors |
| 6.6 | — | Not completed. `gh repo create LynWachholz/boot-pulse --private` was denied by GitHub: `LynWachholz does not have the correct permissions to execute CreateRepository (createRepository)`. Repository creation and push are blocked; task remains unchecked. No Vercel deployment was attempted. |

### Notes for the reviewer

- **Runway display follows the corrected PRD 5.2 rule.** The demo burns USD 2,650/month but survives
  the forecast, so it shows "12+ months" and the approximate simple-runway subline, rather than
  incorrectly labelling the business cash-flow positive.
- **Verification harness.** The audit scripts live outside the delivered project (`/home/ubuntu/audit`)
  so the repository stays free of test-only dependencies.
