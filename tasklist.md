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

- [ ] **1.1** Scaffold a React 18 + Vite + TypeScript project named `bootpulse` in the repo root.
  - Verification Gate (BUILD + DEV): default page renders.
- [ ] **1.2** Install and configure Tailwind CSS; define the colour tokens (neutral greys, deep-teal accent) in `tailwind.config.ts`.
  - Verification Gate (DEV): a test element uses the accent colour.
- [ ] **1.3** Install React Router, Zustand, Recharts and Vitest; add `test` script to `package.json`.
  - Verification Gate (BUILD + TEST): an empty sample test passes.
- [ ] **1.4** Create `.gitignore` including `node_modules`, `dist` and `.env*`.
  - Verification Gate: `git status` does not list `node_modules` or `dist`.
- [ ] **1.5** Add `vercel.json` with a rewrite of all routes to `/index.html` (SPA deep links).
  - Verification Gate: file exists and is valid JSON.
- [ ] **1.6** Create `README.md` with project description, `npm install`, `npm run dev`, `npm run build`, `npm run test`.
  - Verification Gate: README renders correctly on GitHub.

## Module 2: Data Model, Finance Logic & Persistence
*Replaces the database module for Phase 1 (PRD 5.1–5.5).*

- [ ] **2.1** Create `src/types.ts` with all entities from PRD 5.1 (Profile, Business, RevenueItem, ExpenseItem, Scenario, Adjustment, Milestone, Decision).
  - Verification Gate (BUILD).
- [ ] **2.2** Create `src/lib/money.ts`: convert between cents and display values; format with currency and thousand separators.
  - Verification Gate (TEST): 3 tests, e.g. `formatMoney(4800000, "USD") === "$48,000"`.
- [ ] **2.3** Create `src/lib/months.ts`: generate a list of `YYYY-MM` months from a start month; check whether an item is active in a month.
  - Verification Gate (TEST): tests include a year change (Dec → Jan).
- [ ] **2.4** In `src/lib/finance.ts`, implement `monthlyRevenue` and `monthlyCosts` (recurring + one-off rules, PRD 5.2).
  - Verification Gate (TEST): recurring item counted every active month; one-off item counted only in its month.
- [ ] **2.5** In `finance.ts`, implement `cashFlowTable` (opening cash, revenue, costs, net, closing cash per month).
  - Verification Gate (TEST): closing cash of month *m* equals opening cash of month *m+1*.
- [ ] **2.6** In `finance.ts`, implement `netBurn`, `simpleRunway` and `forecastRunway`, including the "cash-flow positive within forecast" case.
  - Verification Gate (TEST): tests for zero burn, positive cash flow and runway below 3 months.
- [ ] **2.7** In `finance.ts`, implement `applyScenario` for the four adjustment types (PRD 5.2) and the three preset scenarios.
  - Verification Gate (TEST): Cautious preset reduces revenue by 20% and increases costs by 10%.
- [ ] **2.8** In `finance.ts`, implement `getAlerts` with the four rules from PRD 5.3.
  - Verification Gate (TEST): one test per alert rule.
- [ ] **2.9** Create `src/data/seed.ts` with the fictional "Lumen Notes Ltd" demo data (PRD 5.5).
  - Verification Gate (TEST): seeded runway equals the manually calculated value (documented in the test).
- [ ] **2.10** Create the Zustand store `src/store/useStore.ts` with CRUD actions for all entities and localStorage persistence (wrapped in try/catch).
  - Verification Gate (DATA): add an item, refresh the browser, item is still there.

## Module 3: Local Profiles & Protected Routes
*Real authentication is Phase 2 (PRD 2.3).*

- [ ] **3.1** Create the route structure for all routes in PRD 3.1 with placeholder pages and a shared sidebar layout for logged-in pages.
  - Verification Gate (DEV): every route opens; deep link `/dashboard` works after refresh.
- [ ] **3.2** Build `/signup`: name, business name, currency, opening cash, plus the PICS privacy notice and a required consent checkbox (stores `privacyConsentAt`).
  - Verification Gate (DATA): profile and business created and persisted; form cannot be submitted without consent.
- [ ] **3.3** Build `/login`: choose an existing local profile or "Open demo business" (loads seed data).
  - Verification Gate (DEV): both options lead to `/dashboard` with the correct data.
- [ ] **3.4** Add a route guard: logged-in pages redirect to `/login` when no active profile exists; add "Log out".
  - Verification Gate (DEV): opening `/dashboard` while logged out redirects to `/login`.

## Module 4: Integrations (Charts & Export)
*No third-party APIs in Phase 1 (PRD 6.1).*

- [ ] **4.1** Create a reusable `CashChart` component (Recharts line chart, one line per scenario, zero line highlighted) with a "View as table" toggle.
  - Verification Gate (DEV): chart renders seeded data; table toggle shows the same numbers.
- [ ] **4.2** Create `src/lib/export.ts`: CSV export of the cash-flow table and JSON export of all user data.
  - Verification Gate: downloaded CSV opens in Excel/Numbers with correct columns.

## Module 5: Core UI Workspace
- [ ] **5.1** Build `/` landing page: hero headline, sub-headline and "Try the demo" CTA above 667 px, 3 benefits, how-it-works, pricing preview, footer disclaimer.
  - Verification Gate (VISUAL): CTA visible without scrolling at 375 × 667.
- [ ] **5.2** Build `/dashboard` KPI row: Cash, Monthly revenue, Monthly costs, Net burn, Runway.
  - Verification Gate (VISUAL): all 5 cards visible without scrolling at 1440 × 900; values match `finance.ts` tests.
- [ ] **5.3** Add a "How is this calculated?" panel to each KPI showing formula and inputs.
  - Verification Gate (DEV): panel opens with keyboard and mouse, closes with Esc.
- [ ] **5.4** Add the cash chart, alerts list (icon + text) and upcoming milestones to the dashboard.
  - Verification Gate (DEV): seeded data triggers the expected alerts.
- [ ] **5.5** Build `/revenue`: table, add/edit/delete form (recurring or one-off), search and type filter.
  - Verification Gate (DATA): CRUD works and dashboard KPIs update immediately.
- [ ] **5.6** Build `/expenses`: table, add/edit/delete form (category, fixed/variable, recurring/one-off), search and category filter.
  - Verification Gate (DATA): CRUD works and dashboard KPIs update immediately.
- [ ] **5.7** Build `/cash-flow`: 12-month table with CSV export button.
  - Verification Gate (DEV): totals match the dashboard; CSV downloads.
- [ ] **5.8** Build `/scenarios`: scenario list, adjustment editor, presets (base, cautious, growth).
  - Verification Gate (DATA): new adjustment "Hire freelancer USD 3,000/month from month 2" saves and persists.
- [ ] **5.9** Add side-by-side scenario comparison (chart + table of runway, month 12 cash, total burn).
  - Verification Gate (DEV): comparing Base vs Hire scenario shows a shorter runway for Hire.
- [ ] **5.10** Build `/milestones`: list with title, target month, status; add/edit/delete.
  - Verification Gate (DATA).
- [ ] **5.11** Build `/decisions`: decision log with reasoning, expected impact, actual outcome, optional linked scenario; search.
  - Verification Gate (DATA): decision linked to a scenario shows the scenario name.
- [ ] **5.12** Build `/settings`: currency, reset demo data, export all data (JSON), delete all data with confirmation dialog.
  - Verification Gate (DATA): after "Delete all data", localStorage is empty and user returns to `/`.
- [ ] **5.13** Build `/privacy` page with the plain-language privacy statement (PRD 7.2).
  - Verification Gate (DEV).
- [ ] **5.14** Add empty states (no revenue items yet, no scenarios yet) and inline form validation messages.
  - Verification Gate (DEV): delete all revenue items and check the empty state appears.

## Module 6: Simulated Billing, Pre-Launch Audits & Deployment
- [ ] **6.1** Build `/pricing` with the three plans from PRD 1.4.
  - Verification Gate (VISUAL).
- [ ] **6.2** Add the simulated upgrade modal labelled "Test mode – no payment will be taken"; switching plan updates a local plan flag shown in Settings.
  - Verification Gate (DATA): plan change persists after refresh; no card details are requested.
- [ ] **6.3** Accessibility audit: contrast ≥ 4.5:1, visible 2 px focus rings, labels on all inputs, full keyboard navigation (PRD 7.1).
  - Verification Gate: Lighthouse accessibility score ≥ 90 on `/`, `/dashboard` and `/scenarios`.
- [ ] **6.4** Responsive audit at 1440 px and 375 px for all pages.
  - Verification Gate (VISUAL): no layout overflow except intentionally scrollable tables.
- [ ] **6.5** Final quality gate: run build, all tests, and click through the core journey (PRD 3.2) end to end.
  - Verification Gate (BUILD + TEST + DEV): all pass with zero console errors.
- [ ] **6.6** Push to GitHub `main` and deploy to Vercel (preset auto-detected as Vite, no environment variables).
  - Verification Gate: live `*.vercel.app` URL loads; `/dashboard` deep link works; demo business opens.

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
