import type { Month } from '../types'

/** Task 2.3 — generate `YYYY-MM` months and test whether an item is active in a month. */

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/

const SHORT_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const LONG_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function isMonth(value: string): value is Month {
  return typeof value === 'string' && MONTH_PATTERN.test(value)
}

/** "2026-03" → 2026 * 12 + 2 — a monotonic integer index used for all comparisons. */
export function monthToIndex(month: Month): number {
  const match = MONTH_PATTERN.exec(month)
  if (!match) throw new Error(`Invalid month "${month}" — expected YYYY-MM`)
  return Number(match[1]) * 12 + (Number(match[2]) - 1)
}

export function indexToMonth(index: number): Month {
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
}

/** Shifts a month by `delta` months, crossing year boundaries (Dec → Jan). */
export function addMonths(month: Month, delta: number): Month {
  return indexToMonth(monthToIndex(month) + delta)
}

/** Inclusive ordered list of `count` months starting at `start`. */
export function generateMonths(start: Month, count: number): Month[] {
  const startIndex = monthToIndex(start)
  const safeCount = Math.max(0, Math.floor(count))
  return Array.from({ length: safeCount }, (_, i) => indexToMonth(startIndex + i))
}

/** Negative when `a` is before `b`, positive when after. */
export function compareMonths(a: Month, b: Month): number {
  return monthToIndex(a) - monthToIndex(b)
}

/** Whole months from `a` to `b` (b − a). */
export function monthsBetween(a: Month, b: Month): number {
  return monthToIndex(b) - monthToIndex(a)
}

export function isSameOrAfter(month: Month, boundary: Month): boolean {
  return compareMonths(month, boundary) >= 0
}

export function isSameOrBefore(month: Month, boundary: Month): boolean {
  return compareMonths(month, boundary) <= 0
}

/** The current calendar month, e.g. "2026-10". */
export function currentMonth(now: Date = new Date()): Month {
  return indexToMonth(now.getFullYear() * 12 + now.getMonth())
}

export interface MonthRange {
  startMonth: Month
  endMonth?: Month
}

/**
 * True when an item is active in `month`: it starts then or earlier and has either no end
 * month or an end month at/after `month`.
 */
export function isActiveInMonth(range: MonthRange, month: Month): boolean {
  if (!isMonth(month)) return false
  if (compareMonths(month, range.startMonth) < 0) return false
  if (range.endMonth && compareMonths(month, range.endMonth) > 0) return false
  return true
}

/** "2026-03" → "Mar 2026" */
export function formatMonthLabel(month: Month): string {
  const match = MONTH_PATTERN.exec(month)
  if (!match) return month
  return `${SHORT_LABELS[Number(match[2]) - 1]} ${match[1]}`
}

/** "2026-03" → "March 2026" */
export function formatMonthLong(month: Month): string {
  const match = MONTH_PATTERN.exec(month)
  if (!match) return month
  return `${LONG_LABELS[Number(match[2]) - 1]} ${match[1]}`
}

/** Date → ISO date string "YYYY-MM-DD" for the decision log. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}