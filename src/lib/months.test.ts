import { describe, expect, it } from 'vitest'
import {
  addMonths,
  compareMonths,
  currentMonth,
  formatMonthLabel,
  formatMonthLong,
  generateMonths,
  isActiveInMonth,
  isMonth,
  monthToIndex,
  monthsBetween,
} from './months'

describe('months', () => {
  it('generates an ordered month list across a year boundary (Dec → Jan)', () => {
    expect(generateMonths('2026-11', 4)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02'])
  })

  it('shifts months forward and backward', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-01', 0)).toBe('2026-01')
  })

  it('produces strictly increasing indices', () => {
    expect(monthToIndex('2027-01') - monthToIndex('2026-12')).toBe(1)
    expect(compareMonths('2026-02', '2026-01')).toBeGreaterThan(0)
    expect(monthsBetween('2026-01', '2027-01')).toBe(12)
  })

  it('validates month strings', () => {
    expect(isMonth('2026-01')).toBe(true)
    expect(isMonth('2026-13')).toBe(false)
    expect(isMonth('26-01')).toBe(false)
  })

  it('marks an item active from its start month up to and including its end month', () => {
    const recurring = { startMonth: '2026-01', endMonth: '2026-03' }
    expect(isActiveInMonth(recurring, '2025-12')).toBe(false)
    expect(isActiveInMonth(recurring, '2026-01')).toBe(true)
    expect(isActiveInMonth(recurring, '2026-03')).toBe(true)
    expect(isActiveInMonth(recurring, '2026-04')).toBe(false)
  })

  it('treats an open-ended item as active forever after it starts', () => {
    expect(isActiveInMonth({ startMonth: '2026-01' }, '2030-05')).toBe(true)
  })

  it('labels months for display', () => {
    expect(formatMonthLabel('2026-03')).toBe('Mar 2026')
    expect(formatMonthLong('2026-03')).toBe('March 2026')
  })

  it('derives the current month', () => {
    expect(currentMonth(new Date(2026, 0, 15))).toBe('2026-01')
    expect(currentMonth(new Date(2026, 11, 31))).toBe('2026-12')
  })
})