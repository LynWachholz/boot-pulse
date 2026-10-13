import { describe, expect, it } from 'vitest'
import { createSeedData, DEMO_OPENING_CASH } from './seed'
import {
  averageNetBurn,
  cashFlowTable,
  forecastRunway,
  getAlerts,
  monthlyCosts,
  monthlyRevenue,
  simpleRunway,
  summarise,
} from '../lib/finance'

/**
 * Task 2.9 verification gate: the seeded demo runway must equal a manual spreadsheet check.
 *
 * Manual calculation for "Lumen Notes Ltd" (start month pinned to 2026-01):
 *
 *   Opening cash ...................... USD 48,000.00  =  4,800,000 ¢
 *   Recurring revenue ................. USD  5,200.00  =    520,000 ¢ per month
 *   One-off revenue (month 2) ......... USD  2,500.00  =    250,000 ¢ once
 *   Recurring costs ................... USD  7,850.00  =    785,000 ¢ per month
 *                                       (6,000 salaries + 400 hosting + 250 software
 *                                        + 900 marketing + 300 accountant)
 *   One-off cost (month 1) ............ USD  1,800.00  =    180,000 ¢ once (laptop)
 *
 *   Month 1: revenue 520,000 − costs (785,000 + 180,000 = 965,000) = −445,000 → closing 4,355,000
 *   Month 2: revenue 520,000 + 250,000 = 770,000 − 785,000         =  −15,000 → closing 4,340,000
 *   Months 3–12: 520,000 − 785,000 = −265,000 per month            → closing declines to 1,690,000
 *
 *   Closing cash never falls below zero inside the 12-month forecast, so the forecast runway is
 *   "cash-flow positive within forecast" (PRD 5.2) — more than 12 months of cash.
 *
 *   Simple runway: average net burn of the next 3 months
 *                = (445,000 + 15,000 + 265,000) / 3 = 241,666.67 ¢ ≈ 241,667 ¢
 *                = 4,800,000 / 241,667 ≈ 19.9 months
 */
describe('seed data — Lumen Notes Ltd (manual check)', () => {
  const seed = createSeedData('2026-01', new Date('2026-01-15T09:00:00Z'))
  const rows = cashFlowTable({
    openingCash: seed.business.openingCash,
    startMonth: seed.business.startMonth,
    months: 12,
    revenue: seed.revenue,
    expenses: seed.expenses,
  })

  it('uses the fictional demo figures from PRD 5.5', () => {
    expect(seed.business.name).toBe('Lumen Notes Ltd')
    expect(seed.business.openingCash).toBe(DEMO_OPENING_CASH)
    expect(seed.business.currency).toBe('USD')
    expect(monthlyRevenue(seed.revenue, '2026-01')).toBe(520_000)
    expect(monthlyRevenue(seed.revenue, '2026-02')).toBe(770_000)
    expect(monthlyCosts(seed.expenses, '2026-01')).toBe(965_000)
    expect(monthlyCosts(seed.expenses, '2026-02')).toBe(785_000)
  })

  it('reproduces the manual month-by-month cash figures', () => {
    expect(rows).toHaveLength(12)
    expect(rows[0].closingCash).toBe(4_355_000) // 48,000 − 4,450
    expect(rows[1].closingCash).toBe(4_340_000) // 43,550 − 150
    expect(rows[2].closingCash).toBe(4_075_000) // 43,400 − 2,650
    expect(rows[11].closingCash).toBe(1_690_000) // 16,900
  })

  it('gives a forecast runway of "cash-flow positive within forecast"', () => {
    expect(forecastRunway(rows)).toEqual({ kind: 'cash_flow_positive' })
  })

  it('gives a simple runway of about 19.9 months', () => {
    expect(averageNetBurn(rows, 3)).toBe(241_667)
    const runway = simpleRunway(seed.business.openingCash, averageNetBurn(rows, 3))
    expect(runway).not.toBeNull()
    expect(runway as number).toBeCloseTo(19.86, 1)
  })

  it('triggers the expected demo alerts: falling revenue once the consulting project ends, no runway alert', () => {
    const alerts = getAlerts(rows)
    expect(alerts.map((alert) => alert.rule)).toEqual(['falling_revenue'])
    expect(alerts[0].month).toBe('2026-03')
  })

  it('ships three preset scenarios, two milestones and two decisions', () => {
    expect(seed.scenarios.map((scenario) => scenario.kind)).toEqual(['base', 'cautious', 'growth'])
    expect(seed.milestones).toHaveLength(2)
    expect(seed.decisions).toHaveLength(2)
    expect(seed.decisions[1].scenarioId).toBe(seed.scenarios[1].id)
  })

  it('starts the cautious scenario from the business start month', () => {
    expect(seed.scenarios[1].adjustments.every((a) => a.startMonth === '2026-01')).toBe(true)
    expect(seed.scenarios[1].adjustments.map((a) => a.value)).toEqual([-20, 10])
  })

  it('summarises the dashboard KPIs from the seeded inputs', () => {
    const summary = summarise({
      openingCash: seed.business.openingCash,
      startMonth: seed.business.startMonth,
      months: 12,
      revenue: seed.revenue,
      expenses: seed.expenses,
    })
    expect(summary.currentCash).toBe(4_800_000)
    expect(summary.monthlyRevenue).toBe(520_000)
    expect(summary.monthlyCosts).toBe(965_000)
    expect(summary.netBurn).toBe(445_000)
  })
})