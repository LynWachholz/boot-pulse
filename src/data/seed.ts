import type {
  Business,
  Decision,
  ExpenseItem,
  Milestone,
  Month,
  Profile,
  RevenueItem,
  Scenario,
} from '../types'
import { addMonths, currentMonth } from '../lib/months'
import { createPresetAdjustments } from '../lib/finance'
import { uid } from '../lib/id'

/**
 * Fictional seeded demo business — PRD 5.5.
 * "Lumen Notes Ltd" is a made-up two-person note-taking SaaS. No real people, companies
 * or financial data are used anywhere in the demo.
 */

export const DEMO_BUSINESS_NAME = 'Lumen Notes Ltd'
export const DEMO_PROFILE_NAME = 'Maya (demo founder)'
export const DEMO_OPENING_CASH = 4_800_000 // USD 48,000.00 in cents

export interface SeedBundle {
  profile: Profile
  business: Business
  revenue: RevenueItem[]
  expenses: ExpenseItem[]
  scenarios: Scenario[]
  milestones: Milestone[]
  decisions: Decision[]
}

function isoDaysAgo(days: number, now: Date): string {
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

/**
 * Builds a complete, self-consistent demo dataset.
 * `startMonth` defaults to the current calendar month so the demo is always "live",
 * but it can be pinned in tests for deterministic numbers.
 */
export function createSeedData(startMonth: Month = currentMonth(), now: Date = new Date()): SeedBundle {
  const month1 = startMonth
  const month2 = addMonths(month1, 1)
  const month3 = addMonths(month1, 2)
  const month6 = addMonths(month1, 5)

  const profileId = uid()
  const businessId = uid()

  const profile: Profile = {
    id: profileId,
    name: DEMO_PROFILE_NAME,
    createdAt: now.toISOString(),
    privacyConsentAt: now.toISOString(),
  }

  const business: Business = {
    id: businessId,
    profileId,
    name: DEMO_BUSINESS_NAME,
    currency: 'USD',
    openingCash: DEMO_OPENING_CASH,
    startMonth: month1,
  }

  const revenue: RevenueItem[] = [
    {
      id: uid(),
      businessId,
      name: 'Subscriptions (MRR)',
      amount: 520_000, // USD 5,200.00
      type: 'recurring',
      startMonth: month1,
      notes: 'Fictional recurring revenue for the demo business.',
    },
    {
      id: uid(),
      businessId,
      name: 'One-off consulting project',
      amount: 250_000, // USD 2,500.00
      type: 'one_off',
      startMonth: month2,
      notes: 'Fictional one-off revenue booked in month 2.',
    },
  ]

  const expenses: ExpenseItem[] = [
    {
      id: uid(),
      businessId,
      name: 'Founder salaries',
      amount: 600_000, // USD 6,000.00
      category: 'people',
      behaviour: 'fixed',
      type: 'recurring',
      startMonth: month1,
    },
    {
      id: uid(),
      businessId,
      name: 'Cloud hosting',
      amount: 40_000, // USD 400.00
      category: 'software',
      behaviour: 'fixed',
      type: 'recurring',
      startMonth: month1,
    },
    {
      id: uid(),
      businessId,
      name: 'Software subscriptions',
      amount: 25_000, // USD 250.00
      category: 'software',
      behaviour: 'fixed',
      type: 'recurring',
      startMonth: month1,
    },
    {
      id: uid(),
      businessId,
      name: 'Marketing',
      amount: 90_000, // USD 900.00
      category: 'marketing',
      behaviour: 'variable',
      type: 'recurring',
      startMonth: month1,
    },
    {
      id: uid(),
      businessId,
      name: 'Accountant',
      amount: 30_000, // USD 300.00
      category: 'other',
      behaviour: 'fixed',
      type: 'recurring',
      startMonth: month1,
    },
    {
      id: uid(),
      businessId,
      name: 'New laptop',
      amount: 180_000, // USD 1,800.00
      category: 'office',
      behaviour: 'fixed',
      type: 'one_off',
      startMonth: month1,
      notes: 'Fictional one-off equipment purchase in month 1.',
    },
  ]

  const presets = createPresetAdjustments(month1)
  const scenarios: Scenario[] = [
    { id: uid(), businessId, name: 'Base', kind: 'base', adjustments: presets.base },
    { id: uid(), businessId, name: 'Cautious', kind: 'cautious', adjustments: presets.cautious },
    { id: uid(), businessId, name: 'Growth', kind: 'growth', adjustments: presets.growth },
  ]

  const cautiousId = scenarios[1].id

  const milestones: Milestone[] = [
    {
      id: uid(),
      businessId,
      title: 'Reach USD 6,000 MRR',
      targetMonth: month6,
      status: 'in_progress',
    },
    {
      id: uid(),
      businessId,
      title: 'Ship v2 onboarding',
      targetMonth: month3,
      status: 'planned',
    },
  ]

  const decisions: Decision[] = [
    {
      id: uid(),
      businessId,
      date: isoDaysAgo(45, now),
      title: 'Keep founder salaries at USD 6,000/month',
      reasoning:
        'Both founders can live on this for now, and it protects the runway while the product finds its footing.',
      expectedImpact: 'Cash burn stays around USD 2,650/month.',
      actualOutcome: 'Burn has matched the plan so far.',
      scenarioId: scenarios[0].id,
    },
    {
      id: uid(),
      businessId,
      date: isoDaysAgo(10, now),
      title: 'Pause paid marketing instead of hiring a freelancer',
      reasoning:
        'The cautious scenario showed the hire would shorten runway, while marketing spend is easier to switch off.',
      expectedImpact: 'Runway extends by roughly 2 months versus the cautious case.',
      scenarioId: cautiousId,
    },
  ]

  return { profile, business, revenue, expenses, scenarios, milestones, decisions }
}