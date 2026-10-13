/**
 * BootPulse Phase 1 entities — PRD 5.1.
 * Stored in the browser (localStorage) via the Zustand store.
 */

export type UUID = string
/** "YYYY-MM" */
export type Month = string
/** Integer minor units (cents) — never floats (PRD 4.2). */
export type Cents = number

export type Currency = 'USD' | 'EUR' | 'HKD'

export type RevenueType = 'recurring' | 'one_off'
export type ExpenseCategory = 'people' | 'software' | 'marketing' | 'office' | 'other'
export type ExpenseBehaviour = 'fixed' | 'variable'
export type ScenarioKind = 'base' | 'cautious' | 'growth' | 'custom'
export type AdjustmentType = 'revenue_pct' | 'cost_pct' | 'add_revenue' | 'add_cost'
export type MilestoneStatus = 'planned' | 'in_progress' | 'done' | 'missed'
export type PlanId = 'free' | 'founder' | 'adviser'

export interface Profile {
  id: UUID
  name: string
  createdAt: string
  /** ISO timestamp recorded when the PICS consent checkbox was ticked (PRD 7.2). */
  privacyConsentAt: string
}

export interface Business {
  id: UUID
  profileId: UUID
  name: string
  currency: Currency
  openingCash: Cents
  startMonth: Month
}

export interface RevenueItem {
  id: UUID
  businessId: UUID
  name: string
  amount: Cents
  type: RevenueType
  startMonth: Month
  endMonth?: Month
  notes?: string
}

export interface ExpenseItem {
  id: UUID
  businessId: UUID
  name: string
  amount: Cents
  category: ExpenseCategory
  behaviour: ExpenseBehaviour
  type: RevenueType
  startMonth: Month
  endMonth?: Month
  notes?: string
}

export interface Adjustment {
  id: UUID
  label: string
  type: AdjustmentType
  /** % for `revenue_pct` / `cost_pct`, Cents for `add_revenue` / `add_cost`. */
  value: number
  /** true = every month from `startMonth`; false = only in `startMonth`. */
  recurring: boolean
  startMonth: Month
  endMonth?: Month
}

export interface Scenario {
  id: UUID
  businessId: UUID
  name: string
  kind: ScenarioKind
  adjustments: Adjustment[]
}

export interface Milestone {
  id: UUID
  businessId: UUID
  title: string
  targetMonth: Month
  status: MilestoneStatus
}

export interface Decision {
  id: UUID
  businessId: UUID
  date: string
  title: string
  reasoning: string
  expectedImpact: string
  actualOutcome?: string
  scenarioId?: UUID
}

/** Convenience map for label rendering. */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['people', 'software', 'marketing', 'office', 'other']
export const MILESTONE_STATUSES: MilestoneStatus[] = ['planned', 'in_progress', 'done', 'missed']