import { Link, useNavigate } from 'react-router-dom'
import PublicShell from '../components/PublicShell'
import { IconCashFlow, IconScenarios, IconWarning } from '../components/icons'
import { useStore } from '../store/useStore'

/** Task 5.1 — hero, three benefits, how it works, pricing preview and the footer disclaimer. */

const BENEFITS = [
  {
    icon: IconCashFlow,
    title: 'See your runway in minutes',
    body: 'Add what comes in and what goes out. BootPulse shows cash, burn and runway immediately — no formulas to maintain.',
  },
  {
    icon: IconScenarios,
    title: 'Test a decision before you commit',
    body: 'Model “hire a freelancer” or “cut marketing 30%” as a scenario and compare it side by side with your base case.',
  },
  {
    icon: IconWarning,
    title: 'Every number can be checked',
    body: 'Each figure comes with a “How is this calculated?” panel showing the formula and the inputs behind it.',
  },
]

const STEPS = [
  {
    step: '1',
    title: 'Add your starting cash',
    body: 'Opening balance, currency and the month your forecast starts.',
  },
  {
    step: '2',
    title: 'List revenue and costs',
    body: 'Recurring or one-off, with categories for costs. It takes about five minutes.',
  },
  {
    step: '3',
    title: 'Read your runway, then test a scenario',
    body: 'Compare options, record the decision and check back on what actually happened.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: 'USD 0',
    cadence: 'forever',
    features: ['1 business', '12-month forecast', '3 scenarios (base, cautious, growth)'],
    cta: 'Start free',
    to: '/signup',
    highlighted: false,
  },
  {
    name: 'Founder',
    price: 'USD 12',
    cadence: 'per month',
    features: ['24-month forecast', 'Unlimited custom scenarios', 'Runway alerts', 'CSV export'],
    cta: 'See plans',
    to: '/pricing',
    highlighted: true,
  },
  {
    name: 'Adviser / Multi-business',
    price: 'USD 39',
    cadence: 'per month',
    features: ['Up to 10 businesses', 'Adviser read-only access', 'Longer forecasts'],
    cta: 'See plans',
    to: '/pricing',
    highlighted: false,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const loadDemoBusiness = useStore((state) => state.loadDemoBusiness)

  const openDemo = () => {
    loadDemoBusiness()
    navigate('/dashboard')
  }

  return (
    <PublicShell>
      {/* Hero: headline, sub-headline and primary CTA all sit within the first 667 px of height */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Cash-flow, runway and scenario planning for bootstrapped founders
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
            How many months can you keep going — and what happens if you make this decision?
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-700">
            BootPulse shows your cash position, burn rate and runway in under five minutes, and lets you test a
            decision as a scenario before you commit to it. Every calculation is visible and editable.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary px-5 py-2.5 text-base" onClick={openDemo}>
              Try the demo
            </button>
            <Link className="btn-ghost px-5 py-2.5 text-base" to="/signup">
              Start free with my own numbers
            </Link>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            No account, no card and no server — the demo business is fictional and everything stays in your
            browser.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="text-xl font-bold tracking-tight text-neutral-900">
          Built for founders with no finance team
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card px-5 py-5">
              <span className="inline-flex rounded-md bg-accent-light p-2 text-accent">
                <Icon width={22} height={22} />
              </span>
              <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1.5 text-sm text-neutral-700">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50" aria-labelledby="how-heading">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="how-heading" className="text-xl font-bold tracking-tight text-neutral-900">
            How it works
          </h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="card px-5 py-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-neutral-700">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading" className="text-xl font-bold tracking-tight text-neutral-900">
          Simple pricing
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Phase 1 runs in <strong>test mode</strong> — upgrading is simulated and no payment is taken.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card px-5 py-5 ${plan.highlighted ? 'border-accent ring-1 ring-accent/30' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-neutral-900">{plan.name}</h3>
                {plan.highlighted ? (
                  <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-semibold text-accent-dark">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">
                {plan.price}
                <span className="ml-1 text-xs font-medium text-neutral-500">{plan.cadence}</span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-neutral-700">
                {plan.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
              <Link className={`mt-4 w-full ${plan.highlighted ? 'btn-primary' : 'btn-ghost'}`} to={plan.to}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-accent px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Try it with the fictional demo business</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/90">
              “Lumen Notes Ltd” is a made-up two-person SaaS with twelve months of revenue, costs, scenarios,
              milestones and decisions already filled in.
            </p>
          </div>
          <button
            type="button"
            className="btn bg-white px-5 py-2.5 text-base text-accent hover:bg-neutral-100"
            onClick={openDemo}
          >
            Try the demo
          </button>
        </div>
      </section>
    </PublicShell>
  )
}