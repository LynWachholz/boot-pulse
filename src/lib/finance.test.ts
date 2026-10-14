import { describe, expect, it } from 'vitest'
import type { Adjustment, ExpenseItem, RevenueItem, Scenario } from '../types'
import {
  applyAdjustments,
  applyScenario,
  averageNetBurn,
  cashFlowTable,
  createPresetAdjustments,
  forecastRunway,
  formatRunway,
  getAlerts,
  monthlyCosts,
  monthlyRevenue,
  netBurn,
  scenarioTotals,
  simpleRunway,
  summarise,
  type CashFlowRow,
  type ForecastInput,
} from './finance'

/* ------------------------------- fixtures ------------------------------- */

const businessId = 'biz-1'

function revenue(partial: Partial<RevenueItem>): RevenueItem {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    businessId,
    name: 'Item',
    amount: 100_000,
    type: 'recurring',
    startMonth: '2026-01',
    ...partial,
  }
}

function expense(partial: Partial<ExpenseItem>): ExpenseItem {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    businessId,
    name: 'Item',
    amount: 50_000,
    category: 'other',
    behaviour: 'fixed',
    type: 'recurring',
    startMonth: '2026-01',
    ...partial,
  }
}

function input(partial: Partial<ForecastInput> = {}): ForecastInput {
  return {
    openingCash: 1_000_000,
    startMonth: '2026-01',
    months: 12,
    revenue: [],
    expenses: [],
    adjustments: [],
    ...partial,
  }
}

/* --------------------------- revenue and costs --------------------------- */

describe('monthlyRevenue', () => {
  it('counts a recurring item in every active month', () => {
    const items = [revenue({ amount: 520_000, startMonth: '2026-01' })]
    expect(monthlyRevenue(items, '2026-01')).toBe(520_000)
    expect(monthlyRevenue(items, '2026-07')).toBe(520_000)
    expect(monthlyRevenue(items, '2025-12')).toBe(0)
  })

  it('counts a one-off item only in its own month', () => {
    const items = [revenue({ amount: 250_000, type: 'one_off', startMonth: '2026-02' })]
    expect(monthlyRevenue(items, '2026-01')).toBe(0)
    expect(monthlyRevenue(items, '2026-02')).toBe(250_000)
    expect(monthlyRevenue(items, '2026-03')).toBe(0)
  })

  it('stops counting a recurring item after its end month', () => {
    const items = [revenue({ startMonth: '2026-01', endMonth: '2026-03' })]
    expect(monthlyRevenue(items, '2026-03')).toBe(100_000)
    expect(monthlyRevenue(items, '2026-04')).toBe(0)
  })
})

describe('monthlyCosts', () => {
  it('sums recurring expenses and adds one-off expenses in their month only', () => {
    const items = [
      expense({ amount: 600_000, category: 'people' }),
      expense({ amount: 40_000, category: 'software' }),
      expense({ amount: 180_000, category: 'office', type: 'one_off', startMonth: '2026-01' }),
    ]
    expect(monthlyCosts(items, '2026-01')).toBe(820_000)
    expect(monthlyCosts(items, '2026-02')).toBe(640_000)
  })
})

/* ------------------------------ cash flow ------------------------------ */

describe('cashFlowTable', () => {
  const forecast = input({
    openingCash: 4_800_000,
    months: 12,
    revenue: [revenue({ amount: 520_000 })],
    expenses: [expense({ amount: 785_000 })],
  })
  const rows = cashFlowTable(forecast)

  it('produces one row per forecast month starting at the start month', () => {
    expect(rows).toHaveLength(12)
    expect(rows[0].month).toBe('2026-01')
    expect(rows[11].month).toBe('2026-12')
  })

  it('carries closing cash of month m into opening cash of month m+1', () => {
    for (let i = 0; i < rows.length - 1; i += 1) {
      expect(rows[i + 1].openingCash).toBe(rows[i].closingCash)
    }
  })

  it('computes net cash flow as revenue minus costs', () => {
    expect(rows[0].net).toBe(520_000 - 785_000)
    expect(rows[0].closingCash).toBe(4_800_000 - 265_000)
  })
})

/* -------------------------------- runway -------------------------------- */

describe('netBurn', () => {
  it('is zero when revenue covers costs', () => {
    expect(netBurn(900_000, 700_000)).toBe(0)
  })

  it('is costs minus revenue when the month is cash-negative', () => {
    expect(netBurn(520_000, 785_000)).toBe(265_000)
  })
})

describe('simpleRunway', () => {
  it('divides current cash by the average net burn of the next three months', () => {
    const rows = cashFlowTable(
      input({ openingCash: 3_000_000, revenue: [], expenses: [expense({ amount: 100_000 })] }),
    )
    expect(averageNetBurn(rows, 3)).toBe(100_000)
    expect(simpleRunway(3_000_000, 100_000)).toBe(30)
  })

  it('returns null when there is zero burn (cash-flow positive business)', () => {
    const rows = cashFlowTable(
      input({ revenue: [revenue({ amount: 200_000 })], expenses: [expense({ amount: 150_000 })] }),
    )
    expect(averageNetBurn(rows, 3)).toBe(0)
    expect(simpleRunway(1_000_000, 0)).toBeNull()
  })
})

describe('forecastRunway', () => {
  it('counts the months until closing cash first falls below zero', () => {
    const rows = cashFlowTable(
      input({ openingCash: 1_000_000, revenue: [], expenses: [expense({ amount: 600_000 })] }),
    )
    expect(forecastRunway(rows)).toEqual({ kind: 'months', months: 2 })
    expect(formatRunway({ kind: 'months', months: 2 })).toBe('2 months')
  })

  it('reports a runway below 3 months as a single month', () => {
    const rows = cashFlowTable(
      input({ openingCash: 100_000, revenue: [], expenses: [expense({ amount: 400_000 })] }),
    )
    expect(forecastRunway(rows)).toEqual({ kind: 'months', months: 1 })
  })

  it('reports the cash-flow-positive state when cash never reaches zero and monthly revenue covers costs', () => {
    const rows = cashFlowTable(
      input({ openingCash: 1_000_000, revenue: [revenue({ amount: 200_000 })], expenses: [expense({ amount: 150_000 })] }),
    )
    expect(forecastRunway(rows)).toEqual({ kind: 'cash_flow_positive' })
    expect(formatRunway({ kind: 'cash_flow_positive' }, 0)).toBe('Cash-flow positive')
  })

  it('reports 12+ months when positive burn remains funded throughout the forecast', () => {
    const rows = cashFlowTable(
      input({ openingCash: 4_800_000, revenue: [revenue({ amount: 520_000 })], expenses: [expense({ amount: 785_000 })] }),
    )
    const runway = forecastRunway(rows)
    expect(runway).toEqual({ kind: 'cash_flow_positive' })
    expect(formatRunway(runway, rows[0].netBurn)).toBe('12+ months')
    expect(simpleRunway(rows[0].openingCash, averageNetBurn(rows, 3))).toBeCloseTo(18.1132, 3)
  })

  it('counts a month when closing cash reaches exactly zero', () => {
    const rows = cashFlowTable(
      input({ openingCash: 100_000, revenue: [], expenses: [expense({ amount: 100_000 })] }),
    )
    expect(forecastRunway(rows)).toEqual({ kind: 'months', months: 1 })
  })
})

/* ------------------------------- scenarios ------------------------------- */

describe('applyAdjustments and presets', () => {
  it('applies a percentage adjustment from its start month', () => {
    const adjustment: Adjustment = {
      id: 'a1',
      label: 'Revenue −20%',
      type: 'revenue_pct',
      value: -20,
      recurring: true,
      startMonth: '2026-03',
    }
    expect(applyAdjustments(100_000, 100_000, '2026-02', [adjustment])).toEqual({
      revenue: 100_000,
      costs: 100_000,
    })
    expect(applyAdjustments(100_000, 100_000, '2026-03', [adjustment])).toEqual({
      revenue: 80_000,
      costs: 100_000,
    })
  })

  it('applies an "add" adjustment like an extra item (recurring vs one-off)', () => {
    const recurring: Adjustment = {
      id: 'a2',
      label: 'Hire freelancer',
      type: 'add_cost',
      value: 300_000,
      recurring: true,
      startMonth: '2026-02',
    }
    const oneOff: Adjustment = { ...recurring, id: 'a3', recurring: false }

    expect(applyAdjustments(0, 0, '2026-02', [recurring]).costs).toBe(300_000)
    expect(applyAdjustments(0, 0, '2026-03', [recurring]).costs).toBe(300_000)
    expect(applyAdjustments(0, 0, '2026-03', [oneOff]).costs).toBe(0)
  })

  it('Cautious preset reduces revenue by 20% and increases costs by 10%', () => {
    const presets = createPresetAdjustments('2026-01')
    expect(presets.cautious).toHaveLength(2)

    const base = input({
      revenue: [revenue({ amount: 520_000 })],
      expenses: [expense({ amount: 785_000 })],
    })
    const cautious: Scenario = {
      id: 's1',
      businessId,
      name: 'Cautious',
      kind: 'cautious',
      adjustments: presets.cautious,
    }
    const rows = cashFlowTable(applyScenario(base, cautious))

    expect(rows[0].revenue).toBe(416_000) // 520,000 × 0.8
    expect(rows[0].costs).toBe(863_500) // 785,000 × 1.1
  })

  it('Growth preset lifts revenue by 15% and costs by 5%', () => {
    const presets = createPresetAdjustments('2026-01')
    const base = input({
      revenue: [revenue({ amount: 520_000 })],
      expenses: [expense({ amount: 785_000 })],
    })
    const growth: Scenario = {
      id: 's2',
      businessId,
      name: 'Growth',
      kind: 'growth',
      adjustments: presets.growth,
    }
    const rows = cashFlowTable(applyScenario(base, growth))

    expect(rows[0].revenue).toBe(598_000) // 520,000 × 1.15
    expect(rows[0].costs).toBe(824_250) // 785,000 × 1.05
  })

  it('Base preset leaves the forecast unchanged', () => {
    const presets = createPresetAdjustments('2026-01')
    const base = input({
      revenue: [revenue({ amount: 520_000 })],
      expenses: [expense({ amount: 785_000 })],
    })
    const baseScenario: Scenario = {
      id: 's3',
      businessId,
      name: 'Base',
      kind: 'base',
      adjustments: presets.base,
    }
    const rows = cashFlowTable(applyScenario(base, baseScenario))
    expect(rows[0].revenue).toBe(520_000)
    expect(rows[0].costs).toBe(785_000)
  })

  it('an "add_cost" adjustment shortens the runway (Hire freelancer example)', () => {
    const base = input({
      openingCash: 3_000_000,
      revenue: [revenue({ amount: 520_000 })],
      expenses: [expense({ amount: 785_000 })],
    })
    const hire: Scenario = {
      id: 's4',
      businessId,
      name: 'Hire freelancer',
      kind: 'custom',
      adjustments: [
        {
          id: 'h1',
          label: 'Hire freelancer USD 3,000/month from month 2',
          type: 'add_cost',
          value: 300_000,
          recurring: true,
          startMonth: '2026-02',
        },
      ],
    }
    const baseRunway = forecastRunway(cashFlowTable(base))
    const hireRunway = forecastRunway(cashFlowTable(applyScenario(base, hire)))

    expect(baseRunway.kind).toBe('months')
    expect(hireRunway.kind).toBe('months')
    if (baseRunway.kind === 'months' && hireRunway.kind === 'months') {
      expect(hireRunway.months).toBeLessThan(baseRunway.months)
    }
  })
})

/* -------------------------------- alerts -------------------------------- */

function rowsWith(partial: Partial<ForecastInput>): CashFlowRow[] {
  return cashFlowTable(input(partial))
}

describe('getAlerts', () => {
  it('raises a critical alert below 3 months of runway', () => {
    const alerts = getAlerts(
      rowsWith({ openingCash: 1_000_000, revenue: [], expenses: [expense({ amount: 600_000 })] }),
    )
    expect(alerts.map((a) => a.rule)).toContain('runway_critical')
    expect(alerts[0].severity).toBe('critical')
  })

  it('raises a warning between 3 and 6 months of runway', () => {
    const alerts = getAlerts(
      // USD 10,000 cash burning USD 2,100/month → cash first goes negative in month 5.
      rowsWith({ openingCash: 1_000_000, revenue: [], expenses: [expense({ amount: 210_000 })] }),
    )
    expect(alerts.map((a) => a.rule)).toContain('runway_risk')
    expect(alerts.map((a) => a.rule)).not.toContain('runway_critical')
  })

  it('raises "rising costs" when a month exceeds 115% of the previous 3-month average', () => {
    const alerts = getAlerts(
      rowsWith({
        openingCash: 5_000_000,
        revenue: [revenue({ amount: 400_000 })],
        expenses: [
          expense({ amount: 100_000 }),
          expense({ amount: 30_000, type: 'one_off', startMonth: '2026-04' }),
        ],
      }),
    )
    const rising = alerts.find((a) => a.rule === 'rising_costs')
    expect(rising).toBeDefined()
    expect(rising?.month).toBe('2026-04')
  })

  it('raises "falling revenue" when revenue drops more than 10% month on month', () => {
    const alerts = getAlerts(
      rowsWith({
        openingCash: 5_000_000,
        revenue: [
          revenue({ amount: 100_000, startMonth: '2026-01', endMonth: '2026-01' }),
          revenue({ amount: 85_000, startMonth: '2026-02' }),
        ],
        expenses: [expense({ amount: 50_000 })],
      }),
    )
    const falling = alerts.find((a) => a.rule === 'falling_revenue')
    expect(falling).toBeDefined()
    expect(falling?.month).toBe('2026-02')
  })

  it('stays quiet for a healthy, cash-flow-positive business', () => {
    const alerts = getAlerts(
      rowsWith({
        openingCash: 2_000_000,
        revenue: [revenue({ amount: 500_000 })],
        expenses: [expense({ amount: 400_000 })],
      }),
    )
    expect(alerts).toEqual([])
  })
})

/* ------------------------------- summary ------------------------------- */

describe('summarise and scenarioTotals', () => {
  const forecast = input({
    openingCash: 4_800_000,
    revenue: [revenue({ amount: 520_000 })],
    expenses: [expense({ amount: 785_000 })],
  })

  it('collects the dashboard KPI values', () => {
    const summary = summarise(forecast)
    expect(summary.currentCash).toBe(4_800_000)
    expect(summary.monthlyRevenue).toBe(520_000)
    expect(summary.monthlyCosts).toBe(785_000)
    expect(summary.netBurn).toBe(265_000)
    expect(summary.forecastRunway).toEqual({ kind: 'cash_flow_positive' })
    expect(formatRunway(summary.forecastRunway, summary.netBurn)).toBe('12+ months')
  })

  it('reports month 12 closing cash and total burn for comparisons', () => {
    const totals = scenarioTotals(cashFlowTable(forecast))
    expect(totals.month12Cash).toBe(4_800_000 - 265_000 * 12)
    expect(totals.totalBurn).toBe(265_000 * 12)
  })
})
