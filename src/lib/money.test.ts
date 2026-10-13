import { describe, expect, it } from 'vitest'
import { formatMoney, formatMoneySigned, formatNumber, fromCents, parseAmount, toCents } from './money'

describe('money', () => {
  it('formats whole amounts with currency and thousand separators', () => {
    expect(formatMoney(4_800_000, 'USD')).toBe('$48,000')
  })

  it('shows decimals only when there are minor units', () => {
    expect(formatMoney(123_456, 'USD')).toBe('$1,234.56')
    expect(formatMoney(123_400, 'USD')).toBe('$1,234')
  })

  it('renders negative amounts with a leading minus sign', () => {
    expect(formatMoney(-4_800_000, 'USD')).toBe('-$48,000')
    expect(formatMoney(-123_456, 'USD')).toBe('-$1,234.56')
  })

  it('formats EUR and HKD', () => {
    expect(formatMoney(4_800_000, 'EUR')).toBe('€48,000')
    expect(formatMoney(4_800_000, 'HKD')).toBe('HK$48,000')
  })

  it('keeps an explicit sign for deltas', () => {
    expect(formatMoneySigned(250_000, 'USD')).toBe('+$2,500')
    expect(formatMoneySigned(0, 'USD')).toBe('$0')
  })

  it('converts between cents and display values without floating-point drift', () => {
    expect(toCents(48000)).toBe(4_800_000)
    expect(toCents(0.1 + 0.2)).toBe(30)
    expect(fromCents(4_800_050)).toBe(48000.5)
  })

  it('parses messy user input', () => {
    expect(parseAmount('$12,500')).toBe(12500)
    expect(parseAmount('1 234.5')).toBe(1234.5)
    expect(parseAmount('-300')).toBe(-300)
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
  })

  it('groups bare numbers', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
})
