import type {
  Adjustment,
  Cents,
  ExpenseItem,
  Month,
  RevenueItem,
  Scenario,
} from '../types'
import { compareMonths, generateMonths, isActiveInMonth, formatMonthLabel } from './months'
import { uid } from './id'

/**
 * BootPulse financial engine — PRD 5.2 / 5.3.
 * Pure functions only: no React, no storage, no side effects, so every rule is unit-testable.
 * All amounts are integer cents; all months are "YYYY-MM" strings.
 */

export interface ForecastInput {
  openingCash: Cents
  startMonth: Month
  /** Number of forecast months, e.g. 12 for the Free plan. */
  months: number
  revenue: RevenueItem[]
  expenses: ExpenseItem[]
  /** Scenario adjustments applied on top of the base inputs (PRD 5.2). */
  adjustments?: Adjustment[]
}

export interface CashFlowRow {
  month: Month
  openingCash: Cents
  revenue: Cents
  costs: Cents
  /** Net cash flow = revenue − costs */
  net: Cents
  closingCash: Cents
  /** Net burn = max(0, costs − revenue) */
  netBurn: Cents
}

export type RunwayResult =
  | { kind: 'months'; months: number }
  | { kind: 'cash_flow_positive' }

export type AlertRule = 'runway_critical' | 'runway_risk' | 'rising_costs' | 'falling_revenue'

export interface Alert {
  id: string
  rule: AlertRule
  severity: 'critical' | 'warning'
  /** Short label, e.g. "Runway critical". */
  title: string
  /** Full sentence; alerts always show an icon *and* text (PRD 5.3). */
  message: string
  month?: Month
}

/* ------------------------------------------------------------------ *
 * Revenue and costs per month (task 2.4)
 * ------------------------------------------------------------------ */

/** Revenue(m): recurring items active in m + one-off items dated exactly m. */
export function monthlyRevenue(items: RevenueItem[], month: Month): Cents {
  return items.reduce((total, item) => {
    if (item.type === 'recurring') {
      return isActiveInMonth(item, month) ? total + item.amount : total
    }
    return item.startMonth === month ? total + item.amount : total
  }, 0)
}

/** Costs(m): recurring items active in m + one-off items dated exactly m. */
export function monthlyCosts(items: ExpenseItem[], month: Month): Cents {
  return items.reduce((total, item) => {
    if (item.type === 'recurring') {
      return isActiveInMonth(item, month) ? total + item.amount : total
    }
    return item.startMonth === month ? total + item.amount : total
  }, 0)
}

/* ------------------------------------------------------------------ *
 * Scenario adjustments (task 2.7)
 * ------------------------------------------------------------------ */

/** True when an adjustment applies to `month`. Non-recurring adjustments apply once, in their start month. */
export function isAdjustmentActive(adjustment: Adjustment, month: Month): boolean {
  if (!adjustment.recurring) return adjustment.startMonth === month
  if (compareMonths(month, adjustment.startMonth) < 0) return false
  if (adjustment.endMonth && compareMonths(month, adjustment.endMonth) > 0) return false
  return true
}

/**
 * Applies adjustments to a month's base figures.
 * Percentage adjustments are applied one after another (compounding), then "add" adjustments
 * behave like an extra revenue or expense item (PRD 5.2).
 */
export function applyAdjustments(
  revenue: Cents,
  costs: Cents,
  month: Month,
  adjustments: Adjustment[] = [],
): { revenue: Cents; costs: Cents } {
  let nextRevenue = revenue
  let nextCosts = costs

  for (const adjustment of adjustments) {
    if (!isAdjustmentActive(adjustment, month)) continue
    switch (adjustment.type) {
      case 'revenue_pct':
        nextRevenue = Math.round(nextRevenue * (1 + adjustment.value / 100))
        break
      case 'cost_pct':
        nextCosts = Math.round(nextCosts * (1 + adjustment.value / 100))
        break
      case 'add_revenue':
        nextRevenue += adjustment.value
        break
      case 'add_cost':
        nextCosts += adjustment.value
        break
    }
  }

  return { revenue: nextRevenue, costs: nextCosts }
}

/** Preset scenarios (PRD 5.2) are always editable copies, never shared objects. */
export function createPresetAdjustments(startMonth: Month): Record<'base' | 'cautious' | 'growth', Adjustment[]> {
  return {
    base: [],
    cautious: [
      {
        id: uid(),
        label: 'Revenue −20%',
        type: 'revenue_pct',
        value: -20,
        recurring: true,
        startMonth,
      },
      {
        id: uid(),
        label: 'Costs +10%',
        type: 'cost_pct',
        value: 10,
        recurring: true,
        startMonth,
      },
    ],
    growth: [
      {
        id: uid(),
        label: 'Revenue +15%',
        type: 'revenue_pct',
        value: 15,
        recurring: true,
        startMonth,
      },
      {
        id: uid(),
        label: 'Costs +5%',
        type: 'cost_pct',
        value: 5,
        recurring: true,
        startMonth,
      },
    ],
  }
}

/** Returns a copy of the forecast input with the scenario's adjustments layered on top. */
export function applyScenario(input: ForecastInput, scenario: Scenario): ForecastInput {
  return { ...input, adjustments: scenario.adjustments }
}

/* ------------------------------------------------------------------ *
 * Cash-flow table (task 2.5)
 * ------------------------------------------------------------------ */

/**
 * Builds the month-by-month forecast: opening cash, revenue, costs, net and closing cash.
 * Opening cash of month m+1 is always the closing cash of month m.
 */
export function cashFlowTable(input: ForecastInput): CashFlowRow[] {
  const months = generateMonths(input.startMonth, input.months)
  const adjustments = input.adjustments ?? []
  const rows: CashFlowRow[] = []
  let openingCash = input.openingCash

  for (const month of months) {
    const baseRevenue = monthlyRevenue(input.revenue, month)
    const baseCosts = monthlyCosts(input.expenses, month)
    const { revenue, costs } = applyAdjustments(baseRevenue, baseCosts, month, adjustments)
    const net = revenue - costs
    const closingCash = openingCash + net

    rows.push({
      month,
      openingCash,
      revenue,
      costs,
      net,
      closingCash,
      netBurn: netBurn(revenue, costs),
    })

    openingCash = closingCash
  }

  return rows
}

/** Net burn(m) = max(0, costs − revenue) (PRD 5.2). */
export function netBurn(revenue: Cents, costs: Cents): Cents {
  return Math.max(0, costs - revenue)
}

/* ------------------------------------------------------------------ *
 * Runway (task 2.6)
 * ------------------------------------------------------------------ */

/** Average net burn over `count` months starting at `fromIndex` (0 = the next month). */
export function averageNetBurn(rows: CashFlowRow[], count = 3, fromIndex = 0): Cents {
  const slice = rows.slice(Math.max(0, fromIndex), Math.max(0, fromIndex) + Math.max(1, count))
  if (slice.length === 0) return 0
  const total = slice.reduce((sum, row) => sum + row.netBurn, 0)
  return Math.round(total / slice.length)
}

/**
 * Simple runway = current cash ÷ average net burn of the next 3 months (PRD 5.2).
 * Returns null when the business is not burning cash (average net burn is 0).
 */
export function simpleRunway(currentCash: Cents, averageBurn: Cents): number | null {
  if (averageBurn <= 0) return null
  return currentCash / averageBurn
}

/**
 * Forecast runway = number of months until projected closing cash reaches or falls below zero.
 * A forecast that remains above zero is only described as cash-flow positive when current
 * monthly revenue covers current monthly costs; otherwise its runway exceeds the forecast.
 */
export function forecastRunway(rows: CashFlowRow[]): RunwayResult {
  if (rows.length === 0) return { kind: 'cash_flow_positive' }
  if (rows[0].openingCash < 0) return { kind: 'months', months: 0 }
  const index = rows.findIndex((row) => row.closingCash <= 0)
  if (index === -1) return { kind: 'cash_flow_positive' }
  return { kind: 'months', months: index + 1 }
}

/** Numeric runway for comparisons; a cash-flow-positive forecast sorts above any number. */
export function runwayMonthsOrInfinity(result: RunwayResult): number {
  return result.kind === 'months' ? result.months : Number.POSITIVE_INFINITY
}

/** Human-readable runway, used by KPIs, scenario cards and the comparison table. */
export function formatRunway(result: RunwayResult, currentNetBurn = 0): string {
  if (result.kind === 'cash_flow_positive') {
    return currentNetBurn > 0 ? '12+ months' : 'Cash-flow positive'
  }
  if (result.months === 0) return '0 months — cash is already negative'
  return `${result.months} ${result.months === 1 ? 'month' : 'months'}`
}

/* ------------------------------------------------------------------ *
 * Alerts (task 2.8)
 * ------------------------------------------------------------------ */

/**
 * Alert rules — PRD 5.3.
 * 1. Runway critical: forecast runway < 3 months.
 * 2. Runway risk: forecast runway < 6 months.
 * 3. Rising costs: a month's costs exceed 115% of the average of the previous three months
 *    (fewer months are used at the start of the forecast).
 * 4. Falling revenue: revenue falls more than 10% versus the previous month.
 */
export function getAlerts(rows: CashFlowRow[]): Alert[] {
  const alerts: Alert[] = []
  if (rows.length === 0) return alerts

  const runway = forecastRunway(rows)
  if (runway.kind === 'months' && runway.months < 3) {
    alerts.push({
      id: 'runway_critical',
      rule: 'runway_critical',
      severity: 'critical',
      title: 'Runway critical',
      message: `Projected runway is ${runway.months} ${
        runway.months === 1 ? 'month' : 'months'
      } — below the 3-month safety line. Cut costs or raise cash now.`,
    })
  } else if (runway.kind === 'months' && runway.months < 6) {
    alerts.push({
      id: 'runway_risk',
      rule: 'runway_risk',
      severity: 'warning',
      title: 'Runway risk',
      message: `Projected runway is ${runway.months} ${
        runway.months === 1 ? 'month' : 'months'
      } — below the 6-month comfort line.`,
    })
  }

  for (let i = 1; i < rows.length; i += 1) {
    const window = rows.slice(Math.max(0, i - 3), i)
    const baseline = window.reduce((sum, row) => sum + row.costs, 0) / window.length
    if (baseline > 0 && rows[i].costs > baseline * 1.15) {
      alerts.push({
        id: `rising_costs:${rows[i].month}`,
        rule: 'rising_costs',
        severity: 'warning',
        title: 'Rising costs',
        message: `Costs in ${formatMonthLabel(rows[i].month)} are more than 115% of the previous ${window.length}-month average.`,
        month: rows[i].month,
      })
      break
    }
  }

  for (let i = 1; i < rows.length; i += 1) {
    const previous = rows[i - 1].revenue
    if (previous > 0 && rows[i].revenue < previous * 0.9) {
      alerts.push({
        id: `falling_revenue:${rows[i].month}`,
        rule: 'falling_revenue',
        severity: 'warning',
        title: 'Falling revenue',
        message: `Revenue in ${formatMonthLabel(rows[i].month)} is more than 10% below ${formatMonthLabel(rows[i - 1].month)}.`,
        month: rows[i].month,
      })
      break
    }
  }

  const severityRank: Record<Alert['severity'], number> = { critical: 0, warning: 1 }
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}

/* ------------------------------------------------------------------ *
 * Dashboard summary
 * ------------------------------------------------------------------ */

export interface Summary {
  currentCash: Cents
  monthlyRevenue: Cents
  monthlyCosts: Cents
  netBurn: Cents
  averageBurn: Cents
  simpleRunwayMonths: number | null
  forecastRunway: RunwayResult
  rows: CashFlowRow[]
  alerts: Alert[]
}

/** Everything the dashboard KPI row and the cash chart need, from one forecast input. */
export function summarise(input: ForecastInput): Summary {
  const rows = cashFlowTable(input)
  const first = rows[0]
  const averageBurn = averageNetBurn(rows, 3, 0)

  return {
    currentCash: input.openingCash,
    monthlyRevenue: first ? first.revenue : 0,
    monthlyCosts: first ? first.costs : 0,
    netBurn: first ? first.netBurn : 0,
    averageBurn,
    simpleRunwayMonths: simpleRunway(input.openingCash, averageBurn),
    forecastRunway: forecastRunway(rows),
    rows,
    alerts: getAlerts(rows),
  }
}

/** Totals used by the scenario comparison table. */
export function scenarioTotals(rows: CashFlowRow[]) {
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0)
  const totalCosts = rows.reduce((sum, row) => sum + row.costs, 0)
  return {
    totalRevenue,
    totalCosts,
    totalBurn: Math.max(0, totalCosts - totalRevenue),
    month12Cash: rows.length >= 12 ? rows[11].closingCash : (rows[rows.length - 1]?.closingCash ?? 0),
  }
}
