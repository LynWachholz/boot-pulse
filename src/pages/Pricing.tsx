import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicShell from '../components/PublicShell'
import { Badge, Modal } from '../components/ui'
import { useStore } from '../store/useStore'
import type { PlanId } from '../types'

/** Tasks 6.1 and 6.2 — plan comparison and the simulated upgrade flow (Phase 1 test mode only). */

interface Plan {
  id: PlanId
  name: string
  price: string
  cadence: string
  summary: string
  features: string[]
  highlighted?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'USD 0',
    cadence: 'forever',
    summary: 'For getting a first clear read on your runway.',
    features: [
      '1 business',
      '12-month forecast',
      '3 scenarios (base, cautious, growth)',
      'Alerts and calculation panels',
    ],
  },
  {
    id: 'founder',
    name: 'Founder',
    price: 'USD 12',
    cadence: 'per month',
    summary: 'For a solo founder planning further ahead.',
    features: [
      '24-month forecast',
      'Unlimited custom scenarios',
      'Runway alerts',
      'CSV export of the cash-flow table',
    ],
    highlighted: true,
  },
  {
    id: 'adviser',
    name: 'Adviser / Multi-business',
    price: 'USD 39',
    cadence: 'per month',
    summary: 'For advisers reviewing several founders.',
    features: [
      'Up to 10 businesses',
      'Adviser read-only access',
      'Longer forecasts',
      'Everything in Founder',
    ],
  },
]

export default function Pricing() {
  const plan = useStore((state) => state.plan)
  const setPlan = useStore((state) => state.setPlan)
  const activeProfileId = useStore((state) => state.activeProfileId)
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const [confirmed, setConfirmed] = useState<PlanId | null>(null)

  const currentPlanName = PLANS.find((item) => item.id === plan)?.name ?? 'Free'

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Plans and pricing</h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-700">
          BootPulse Phase 1 runs entirely in <strong>test mode</strong>: switching a plan is simulated, no payment
          is taken and no card details are ever collected. Real billing is Phase 2 work.
        </p>
        <p className="mt-3 text-sm text-neutral-700">
          Current plan on this device:{' '}
          <Badge tone={plan === 'free' ? 'neutral' : 'good'}>{currentPlanName}</Badge>
          {activeProfileId ? (
            <>
              {' '}
              — you can also see it in{' '}
              <Link className="link" to="/settings">
                Settings
              </Link>
              .
            </>
          ) : null}
        </p>

        {confirmed ? (
          <p
            className="mt-4 rounded-md border border-good/30 bg-good-light px-3 py-2 text-sm text-good"
            role="status"
          >
            Test mode: this device now shows the <strong>{confirmed}</strong> plan. No payment was taken and no card
            details were requested.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PLANS.map((item) => {
            const isCurrent = item.id === plan
            return (
              <section
                key={item.id}
                aria-label={`${item.name} plan`}
                className={`card flex flex-col px-5 py-5 ${item.highlighted ? 'border-accent ring-1 ring-accent/30' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-neutral-900">{item.name}</h2>
                  {isCurrent ? (
                    <Badge tone="good">Current plan</Badge>
                  ) : item.highlighted ? (
                    <Badge tone="accent">Most popular</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">
                  {item.price}
                  <span className="ml-1 text-xs font-medium text-neutral-500">{item.cadence}</span>
                </p>
                <p className="mt-1 text-sm text-neutral-600">{item.summary}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-neutral-700">
                  {item.features.map((feature) => (
                    <li key={feature}>· {feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-4 w-full ${item.highlighted ? 'btn-primary' : 'btn-ghost'}`}
                  disabled={isCurrent}
                  aria-disabled={isCurrent}
                  onClick={() => {
                    setConfirmed(null)
                    setPendingPlan(item)
                  }}
                >
                  {isCurrent ? 'Your current plan' : `Upgrade to ${item.name}`}
                </button>
              </section>
            )
          })}
        </div>

        <div className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
          <h2 className="text-sm font-semibold text-neutral-900">What is deliberately not built yet</h2>
          <p className="mt-1">
            Real payments, cloud accounts, multiple businesses and role-based access are Phase 2. Phase 1 keeps
            everything in your browser so the core value loop — cash, burn, runway and scenarios — can be validated
            safely first.
          </p>
        </div>
      </div>

      <Modal
        open={pendingPlan !== null}
        onClose={() => setPendingPlan(null)}
        title="Test mode – no payment will be taken"
        description="This is a simulated upgrade. No card details are requested, nothing is charged, and no payment provider is contacted."
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setPendingPlan(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (pendingPlan) {
                  setPlan(pendingPlan.id)
                  setConfirmed(pendingPlan.id)
                }
                setPendingPlan(null)
              }}
            >
              Simulate upgrade to {pendingPlan?.name}
            </button>
          </>
        }
      >
        {pendingPlan ? (
          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              You selected the <strong>{pendingPlan.name}</strong> plan ({pendingPlan.price} {pendingPlan.cadence}).
            </p>
            <p>
              In test mode, BootPulse only flips a local flag on this device to show which features would unlock:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {pendingPlan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="text-xs text-neutral-500">
              The flag is stored with your other local data, appears in Settings and survives a page refresh. Real
              Stripe Checkout in test mode is Phase 2 work.
            </p>
          </div>
        ) : null}
      </Modal>
    </PublicShell>
  )
}