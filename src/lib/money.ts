import type { Cents, Currency } from '../types'

/** Task 2.2 — convert between cents and display values, format with currency + thousand separators. */

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'HKD']

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'USD — US dollar',
  EUR: 'EUR — euro',
  HKD: 'HKD — Hong Kong dollar',
}

/** Major units (e.g. 48000.5) → integer cents (4800050). Rounds half away from zero. */
export function toCents(major: number): Cents {
  if (!Number.isFinite(major)) return 0
  return Math.round(major * 100)
}

/** Integer cents → major units (4800050 → 48000.5). */
export function fromCents(cents: Cents): number {
  return cents / 100
}

export interface FormatMoneyOptions {
  /** Force cent display on/off. Default: show decimals only when there are minor units. */
  showDecimals?: boolean
  /** Round to whole major units before formatting (used for compact KPI display). */
  round?: boolean
}

/**
 * 4800000, "USD" → "$48,000"   |   123456, "USD" → "$1,234.56"
 * Negative amounts use a leading minus sign (PRD 3.3).
 */
export function formatMoney(cents: Cents, currency: Currency = 'USD', options: FormatMoneyOptions = {}): string {
  const safe = Number.isFinite(cents) ? Math.round(cents) : 0
  const negative = safe < 0
  const absolute = Math.abs(safe)
  const showDecimals = options.showDecimals ?? absolute % 100 !== 0
  const major = options.round ? Math.round(absolute / 100) : absolute / 100

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(major)

  return negative ? `-${formatted}` : formatted
}

/** Same as formatMoney but always keeps the sign, for month-on-month deltas. */
export function formatMoneySigned(cents: Cents, currency: Currency = 'USD'): string {
  if (cents > 0) return `+${formatMoney(cents, currency)}`
  return formatMoney(cents, currency)
}

/** Bare number with thousand separators, no currency symbol (e.g. an amount input field). */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Parse a user-typed amount ("12,500", "$1,234.5", "-300") into major units.
 * Returns null when the input is not a usable number.
 */
export function parseAmount(input: string): number | null {
  if (typeof input !== 'string') return null
  const cleaned = input.replace(/[^0-9.\-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

/** Format a percentage for display: 1.6667 → "1.7%". */
export function formatMonths(value: number): string {
  return `${(Math.round(value * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 })} months`
}