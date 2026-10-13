# PRD.md — BootPulse

**Product:** BootPulse, a cash-flow, runway and scenario-planning dashboard for bootstrapped founders
**Author:** Lyn Wachholz
**Course:** MKTG 4150 New Product Management, Assignment 1
**Version:** 1.0 (Phase 1 MVP)

---

## 1. Executive Overview & Personas

### 1.1 Problem
Bootstrapped founders have no finance team. They track money in spreadsheets that break easily, hide assumptions inside formulas and cannot answer the one question that matters most: *"How many months can we keep going, and what happens if we make this decision?"* As a result, founders either make expensive decisions blindly (hiring, new tools, price changes) or avoid good decisions out of fear.

### 1.2 Core value proposition
BootPulse shows a founder their cash position, burn rate and runway in under five minutes, and lets them test a decision as a scenario **before** committing to it, with every calculation visible and editable.

### 1.3 Target personas

| Persona | Profile | Main job to be done | Pain today |
|---|---|---|---|
| **Maya, solo SaaS founder (primary, paying)** | 31, runs a small B2B SaaS tool alone, ~USD 6k monthly revenue, tracks finances in Google Sheets | "Can I afford a freelance developer for 6 months?" | Spreadsheet formulas break; no quick way to compare options |
| **Jonas & Lea, two-person bootstrapped team** | Co-founders of a small design agency turning into a product company; Jonas wants to hire a developer, Lea wants to spend on marketing first | Settle spending debates with numbers instead of gut feeling | Discussions go in circles because neither can quickly show what each option does to runway; past decisions and their reasons are forgotten |
| **Priya, startup adviser (secondary)** | Mentors 5–8 early-stage founders | Review founders' runway quickly before mentoring sessions | Has to decode each founder's own spreadsheet |

**Primary paying customer:** a founder who already tracks finances in a spreadsheet and wants a clearer, structured view (Maya).

### 1.4 Revenue model

| Plan | Price (indicative) | Includes |
|---|---|---|
| Free | USD 0 | 1 business, 12-month forecast, 3 scenarios (base, cautious, growth) |
| Founder | USD 12 / month | 24-month forecast, unlimited custom scenarios, runway alerts, CSV export |
| Adviser / Multi-business | USD 39 / month | Up to 10 businesses, adviser read-only access, longer forecasts |

In Phase 1 the upgrade flow is **simulated** (test mode, no real payment). Real billing is deferred to Phase 2.

### 1.5 MVP success criteria
- A new user reaches a calculated runway figure in **under 5 minutes** from landing.
- Every displayed number can be traced to its formula via a visible "How is this calculated?" panel.
- Runway and cash-flow calculations match a manual spreadsheet check for the seeded demo business.

---

## 2. Phased Scope Isolation

### 2.1 Deliberate deviation from the original brief (critical review)
The original build prompt asks for a full-stack app with database, authentication, roles and test payments in one go. For a 7-day MVP built by a solo founder with an AI agent, this creates three risks:

1. **Deployment fragility:** auth, database and Stripe all need secret keys and environment variables; a single missing key breaks the live deployment.
2. **Scope creep:** roles, multi-business and payments do not help validate the core question ("Is runway + scenario planning valuable?").
3. **Trust risk:** BootPulse handles sensitive financial data. Storing it on a server before privacy and security are properly designed would be irresponsible.

**Decision:** Phase 1 is a **frontend-only app**. All data is stored in the user's own browser (localStorage) and seeded with fictional demo data. This validates the core value loop at near-zero cost and risk. The full-stack architecture from the template is specified as Phase 2.

### 2.2 Phase 1 — Core MVP (build now)
1. Landing page with value proposition, CTA and pricing preview
2. Local sign-up / log-in (creates a local profile; **no passwords stored**, clearly labelled as a demo)
3. Onboarding: business name, currency, opening cash balance
4. Revenue items (recurring or one-off) with create, edit, delete
5. Expense items (fixed or variable, recurring or one-off) with category
6. Dashboard: current cash, monthly revenue, monthly costs, net burn, runway, 12-month cash chart, warnings
7. Monthly cash-flow table (12 months)
8. Scenario planner: base, cautious and growth presets plus editable adjustments, side-by-side comparison
9. Milestones (title, target month, status)
10. Decision log (decision, expected impact, actual outcome, linked scenario)
11. Alerts for runway risk, rising costs and falling revenue
12. Search and filter on revenue, expense and decision lists; CSV export of the cash-flow table
13. "How is this calculated?" explanation panels
14. Pricing page with simulated upgrade flow
15. Settings: currency, reset demo data, export all data (JSON), delete all data
16. Fictional seeded demo business

### 2.3 Phase 2 — Post-Launch Expansion (deferred)
- Real authentication (Clerk), password reset and email verification
- Cloud database (Neon PostgreSQL + Drizzle ORM) with Row Level Security
- Multiple businesses per account; owner/collaborator/adviser roles and invitations
- Stripe Checkout (test mode first) with webhooks
- 24-month+ forecasts and unlimited scenarios gated by plan
- Email alerts
- AI-written monthly summary (Gemini API)
- File uploads (ImageKit) such as invoice attachments

### 2.4 Explicitly out of scope (both phases)
Bank integrations, payroll, tax, invoicing and full accounting. BootPulse is a planning tool, not bookkeeping software.

---

## 3. Interface & UI Layout

### 3.1 Page routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Hero, 3 benefits, how-it-works, pricing preview, CTA "Try the demo" |
| `/signup` | Sign up | Create local profile (name, business name), privacy notice (PICS) |
| `/login` | Log in | Select existing local profile or open demo business |
| `/dashboard` | Dashboard | KPI cards, cash projection chart, alerts, upcoming milestones |
| `/revenue` | Revenue | Table + form for revenue items, search, filter by type |
| `/expenses` | Expenses | Table + form for expense items, search, filter by category |
| `/cash-flow` | Cash flow | 12-month table: opening cash, revenue, costs, net, closing cash; CSV export |
| `/scenarios` | Scenario planner | Scenario list, adjustment editor, side-by-side comparison chart and table |
| `/milestones` | Milestones | Milestone list with target month and status |
| `/decisions` | Decision log | Decisions with expected vs actual impact |
| `/settings` | Settings | Currency, reset demo, export JSON, delete all data |
| `/pricing` | Pricing | Plan comparison, simulated upgrade modal |
| `/privacy` | Privacy | Plain-language privacy statement |

### 3.2 User journey (core value loop)
1. Visitor lands on `/` and clicks **Try the demo** (or **Start free**)
2. Sign-up asks for name and business name, then opening cash
3. User adds 2–3 revenue items and 3–5 expense items (or explores the seeded demo)
4. Dashboard shows runway instantly
5. User opens Scenario planner, adds "Hire freelancer USD 3,000/month from month 2" and compares it with base case
6. User records the decision in the Decision log

### 3.3 Layout and key components
- **Desktop-first:** fixed left sidebar navigation; main content area optimised for 1280–1440 px width.
- **Dashboard KPI row:** five cards (Cash, Monthly revenue, Monthly costs, Net burn, Runway). Each has an info icon opening the calculation panel.
- **Charts:** line chart of projected closing cash per month (one line per scenario on the scenario page) with a zero line highlighted.
- **Tables:** right-aligned numbers, tabular figures, thousand separators, negative values shown with a minus sign **and** colour.
- **Above the fold:** on the landing page, the headline, sub-headline and primary CTA must render within the first 667 px of height. On the dashboard, all five KPI cards must be visible without scrolling at 1440 × 900.
- **Mobile:** responsive and readable at 375 px (KPI cards stack, tables scroll horizontally) but not optimised for detailed planning.
- **Visual style:** calm, trustworthy finance look; white/neutral grey background, one accent colour (deep teal), no animations beyond subtle transitions.

---

## 4. Technical Stack & Architectural Constraints

### 4.1 Phase 1 stack (mandatory)
| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Fast build, static output, deploys to Vercel with zero configuration |
| Routing | React Router | Client-side routes listed in 3.1 |
| Styling | Tailwind CSS | Consistent design tokens, fast iteration |
| State + persistence | Zustand with localStorage persistence | Simple, no backend needed |
| Charts | Recharts | Lightweight, accessible-enough line/bar charts |
| Testing | Vitest | Unit tests for every financial formula |
| Hosting | Vercel (static) | Free tier, auto-deploy from GitHub `main` |

### 4.2 Constraints
- No backend, no database, no environment variables in Phase 1.
- No native-binary dependencies (e.g. no Prisma).
- All financial logic lives in **one pure TypeScript module** (`src/lib/finance.ts`) with unit tests, so calculations can be verified independently of the UI.
- Amounts stored as integers in minor units (cents) to avoid floating-point errors.
- Months are represented as `YYYY-MM` strings.
- Vercel SPA routing: include a `vercel.json` rewrite so deep links (e.g. `/dashboard`) do not return 404.

### 4.3 Phase 2 stack (from course template)
Next.js App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, Clerk Auth, Stripe Checkout, ImageKit, Gemini API. The Phase 1 finance module is reused unchanged.

---

## 5. Database Schema & Entity Design

### 5.1 Phase 1 entities (TypeScript, stored in localStorage)

```ts
type UUID = string;           // crypto.randomUUID()
type Month = string;          // "YYYY-MM"
type Cents = number;          // integer minor units

interface Profile   { id: UUID; name: string; createdAt: string; privacyConsentAt: string; }
interface Business  { id: UUID; profileId: UUID; name: string; currency: "USD" | "EUR" | "HKD";
                      openingCash: Cents; startMonth: Month; }
interface RevenueItem { id: UUID; businessId: UUID; name: string; amount: Cents;
                      type: "recurring" | "one_off"; startMonth: Month; endMonth?: Month; notes?: string; }
interface ExpenseItem { id: UUID; businessId: UUID; name: string; amount: Cents;
                      category: "people" | "software" | "marketing" | "office" | "other";
                      behaviour: "fixed" | "variable"; type: "recurring" | "one_off";
                      startMonth: Month; endMonth?: Month; notes?: string; }
interface Scenario  { id: UUID; businessId: UUID; name: string;
                      kind: "base" | "cautious" | "growth" | "custom"; adjustments: Adjustment[]; }
interface Adjustment { id: UUID; label: string;
                      type: "revenue_pct" | "cost_pct" | "add_revenue" | "add_cost";
                      value: number;            // % for *_pct, Cents for add_*
                      recurring: boolean; startMonth: Month; endMonth?: Month; }
interface Milestone { id: UUID; businessId: UUID; title: string; targetMonth: Month;
                      status: "planned" | "in_progress" | "done" | "missed"; }
interface Decision  { id: UUID; businessId: UUID; date: string; title: string; reasoning: string;
                      expectedImpact: string; actualOutcome?: string; scenarioId?: UUID; }
```

Monthly summaries are **calculated, not stored**, so they can never go out of sync with the inputs.

### 5.2 Calculation rules (single source of truth)
For each month *m* in the forecast:

- **Revenue(m)** = sum of recurring revenue items active in *m* + one-off revenue items dated *m*
- **Costs(m)** = sum of recurring expense items active in *m* + one-off expense items dated *m*
- **Net cash flow(m)** = Revenue(m) − Costs(m)
- **Closing cash(m)** = Opening cash(m) + Net cash flow(m); Opening cash(m+1) = Closing cash(m)
- **Net burn(m)** = max(0, Costs(m) − Revenue(m))
- **Simple runway** = Current cash ÷ average net burn of the next 3 months (shown for transparency)
- **Forecast runway** = number of months until projected closing cash first falls below zero. If cash never falls below zero within the forecast, show "Cash-flow positive within forecast" instead of a number.

Scenario adjustments are applied on top of the base inputs: percentage adjustments scale revenue or costs from their start month; "add" adjustments behave like an extra revenue or expense item.

**Preset scenarios:** Base = no adjustments; Cautious = revenue −20%, costs +10%; Growth = revenue +15%, costs +5% (all editable).

### 5.3 Alerts
| Alert | Rule | Severity |
|---|---|---|
| Runway risk | Forecast runway < 6 months | Warning |
| Runway critical | Forecast runway < 3 months | Critical |
| Rising costs | Next month's costs > 115% of the last 3-month average | Warning |
| Falling revenue | Revenue down > 10% month-on-month | Warning |

Alerts always show an icon **and** text, never colour alone.

### 5.4 Phase 2 PostgreSQL schema (summary)
- Tables: `users`, `businesses`, `business_members`, `revenue_items`, `expense_items`, `scenarios`, `scenario_adjustments`, `milestones`, `decisions`.
- All primary keys `uuid DEFAULT gen_random_uuid()`.
- Child tables reference `businesses(id) ON DELETE CASCADE`; `scenario_adjustments` references `scenarios(id) ON DELETE CASCADE`.
- Amounts stored as `bigint` (cents); months as `date` (first day of month).
- **Row Level Security:** a user can read/write rows only where they are a member of the business via `business_members`; advisers get read-only policies.

### 5.5 Seed data (fictional)
**"Lumen Notes Ltd"**, a fictional two-person note-taking SaaS. Opening cash USD 48,000. Revenue: subscriptions USD 5,200/month (recurring), one-off consulting USD 2,500 in month 2. Expenses: founder salaries USD 6,000, hosting USD 400, software USD 250, marketing USD 900, accountant USD 300 (all recurring), laptop USD 1,800 one-off in month 1. Two milestones and two decisions pre-filled. No real people, companies or financial data.

---

## 6. Third-Party API & Payment Boundaries

### 6.1 Phase 1
- **No third-party APIs and no secret keys.** No `.env` file is required, so the app can be deployed to Vercel with zero configuration.
- **Upgrade flow:** clicking "Upgrade" opens a modal labelled **"Test mode – no payment will be taken"**, collects nothing sensitive, and switches the local plan flag to show which features would unlock.

### 6.2 Phase 2
- Stripe Checkout in test mode (`sk_test_...`) triggered from `/pricing`; webhook `checkout.session.completed` updates the user's plan.
- Environment segregation: server secrets (`STRIPE_SECRET_KEY`, `DATABASE_URL`, `CLERK_SECRET_KEY`, `GEMINI_API_KEY`) only in `.env.local` / Vercel environment variables; only `NEXT_PUBLIC_` keys in client code.
- `.env*` listed in `.gitignore`; no secrets ever committed to GitHub.

---

## 7. Quality, Accessibility & Compliance Standards

### 7.1 Accessibility (WCAG 2.2 Level AA)
- Text contrast ≥ 4.5:1; large text and UI components ≥ 3:1.
- Visible focus ring on all interactive elements (`outline: 2px solid` accent colour, 2 px offset).
- Every form input has a visible label; errors are announced in text next to the field.
- Every chart has a "View as table" toggle so data is not only visual.
- Fully keyboard-navigable; no keyboard traps in modals.

### 7.2 Privacy (HK PDPO / GDPR)
- **Personal Information Collection Statement** on the sign-up page: what is collected (name, business name, financial inputs), why (to calculate runway), where it is stored (only in this browser in Phase 1), and how to delete it.
- Consent timestamp stored in `Profile.privacyConsentAt`.
- **Right to erasure:** "Delete all my data" in Settings permanently clears all local data after confirmation.
- **Data portability:** "Export all data" downloads a JSON file.
- No cookies, analytics or tracking in Phase 1, so no cookie banner is needed; a banner is added in Phase 2 if analytics are introduced.

### 7.3 Trust and accuracy
- Every KPI has a "How is this calculated?" panel showing the formula and the inputs used.
- Unit tests cover every function in `finance.ts`, including edge cases: zero burn, cash-flow positive business, one-off items, scenario overlaps.
- Disclaimer in the footer: "BootPulse is a planning tool and does not provide financial advice."
- Demo data is clearly labelled as fictional.

### 7.4 Definition of done (Phase 1)
- `npm run build` completes with zero TypeScript errors.
- All finance unit tests pass.
- All routes in 3.1 render without console errors locally and on the live Vercel URL.
- Seeded demo runway matches a manual spreadsheet check.
