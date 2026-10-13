import type { Adjustment, Business, Decision, ExpenseItem, Milestone, RevenueItem, Scenario } from '../types'
import { useActiveBusiness, useBusinessData } from '../store/useStore'
import { applyScenario, cashFlowTable, summarise, type ForecastInput, type Summary } from '../lib/finance'

/** Phase 1 forecasts are 12 months on every plan (plan-based gating is Phase 2). */
export const FORECAST_MONTHS = 12

export interface BusinessData {
  revenue: RevenueItem[]
  expenses: ExpenseItem[]
  scenarios: Scenario[]
  milestones: Milestone[]
  decisions: Decision[]
}

export function buildForecastInput(
  business: Business,
  data: Pick<BusinessData, 'revenue' | 'expenses'>,
  adjustments: Adjustment[] = [],
): ForecastInput {
  return {
    openingCash: business.openingCash,
    startMonth: business.startMonth,
    months: FORECAST_MONTHS,
    revenue: data.revenue,
    expenses: data.expenses,
    adjustments,
  }
}

export interface ForecastView {
  business: Business | null
  data: BusinessData
  base: ForecastInput | null
  summary: Summary | null
}

/**
 * Everything the workspace screens need for the active business: the base forecast input,
 * its summary (KPIs, rows, alerts) and scenario variants computed on demand.
 */
export function useBusinessForecast(): ForecastView {
  const business = useActiveBusiness()
  const data = useBusinessData()

  if (!business) {
    return { business: null, data, base: null, summary: null }
  }

  const base = buildForecastInput(business, data)
  return { business, data, base, summary: summarise(base) }
}

/** The same forecast with a scenario's adjustments applied. */
export function forecastForScenario(input: ForecastInput, scenario: Scenario) {
  const scenarioInput = applyScenario(input, scenario)
  return {
    input: scenarioInput,
    summary: summarise(scenarioInput),
    rows: cashFlowTable(scenarioInput),
  }
}