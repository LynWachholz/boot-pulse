import { describe, expect, it } from 'vitest'
import { cashFlowToCsv, CASH_FLOW_HEADERS, datedFilename, toCsv } from './export'
import { cashFlowTable } from './finance'

describe('export', () => {
  it('writes the cash-flow table with the expected columns', () => {
    const rows = cashFlowTable({
      openingCash: 4_800_000,
      startMonth: '2026-01',
      months: 2,
      revenue: [],
      expenses: [],
    })
    const csv = cashFlowToCsv(rows)
    const lines = csv.split('\r\n')

    expect(lines[0]).toBe(CASH_FLOW_HEADERS.join(','))
    expect(lines[0]).toBe('Month,Opening cash,Revenue,Costs,Net cash flow,Closing cash')
    expect(lines[1]).toBe('2026-01,48000.00,0.00,0.00,0.00,48000.00')
    expect(lines).toHaveLength(3)
  })

  it('quotes fields containing separators or quotes', () => {
    expect(toCsv([['plain', 'has,comma'], ['say "hi"', 'line\nbreak']])).toBe(
      'plain,"has,comma"\r\n"say ""hi""","line\nbreak"',
    )
  })

  it('builds dated filenames', () => {
    expect(datedFilename('cash-flow', 'csv', new Date('2026-10-13T10:00:00Z'))).toBe(
      'cash-flow-2026-10-13.csv',
    )
  })
})