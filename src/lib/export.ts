import type { CashFlowRow } from './finance'
import { fromCents } from './money'
import { formatMonthLabel } from './months'

/** Task 4.2 — CSV export of the cash-flow table and JSON export of all user data. */

export const CASH_FLOW_HEADERS = [
  'Month',
  'Opening cash',
  'Revenue',
  'Costs',
  'Net cash flow',
  'Closing cash',
] as const

/** Escapes a single CSV field (quotes, separators and newlines). */
function escapeCsvField(value: string | number): string {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n')
}

/**
 * Cash-flow table as CSV. Amounts are plain decimal numbers with two decimals so that
 * Excel, Numbers and Google Sheets read them as numbers (not text).
 */
export function cashFlowToCsv(rows: CashFlowRow[]): string {
  const body = rows.map((row) => [
    row.month,
    fromCents(row.openingCash).toFixed(2),
    fromCents(row.revenue).toFixed(2),
    fromCents(row.costs).toFixed(2),
    fromCents(row.net).toFixed(2),
    fromCents(row.closingCash).toFixed(2),
  ])
  return toCsv([[...CASH_FLOW_HEADERS], ...body])
}

/** Readable label for a month inside exported files. */
export function csvMonthLabel(month: string): string {
  return formatMonthLabel(month)
}

function download(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Give the browser a moment to start the download before revoking the object URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(filename: string, rows: CashFlowRow[]) {
  download(filename, cashFlowToCsv(rows), 'text/csv;charset=utf-8;')
}

export function downloadJson(filename: string, data: unknown) {
  download(filename, `${JSON.stringify(data, null, 2)}\n`, 'application/json;charset=utf-8;')
}

/** `cash-flow-2026-10-13.csv` */
export function datedFilename(base: string, extension: string, now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10)
  return `${base}-${stamp}.${extension}`
}