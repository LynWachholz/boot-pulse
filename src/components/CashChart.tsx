import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Cents, Currency, Month } from '../types'
import { formatMoney, fromCents } from '../lib/money'
import { formatMonthLabel } from '../lib/months'

/** Task 4.1 — one line per scenario, zero line highlighted, always with a "View as table" alternative. */

export interface CashSeries {
  id: string
  name: string
  /** Closing cash per month. */
  points: { month: Month; cash: Cents }[]
}

export const SERIES_COLORS = ['#0f5c58', '#7a4b00', '#14603a', '#4d5358', '#7c3aed', '#a1160f']

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length]
}

export default function CashChart({
  series,
  currency,
  title = 'Projected closing cash',
}: {
  series: CashSeries[]
  currency: Currency
  title?: string
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const data = useMemo(() => {
    const months = series[0]?.points.map((point) => point.month) ?? []
    return months.map((month, index) => {
      const row: Record<string, string | number> = { month }
      series.forEach((item) => {
        row[item.id] = fromCents(item.points[index]?.cash ?? 0)
      })
      return row
    })
  }, [series])

  const empty = series.length === 0 || data.length === 0

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <button
          type="button"
          className="btn-ghost px-3 py-1 text-xs"
          aria-pressed={view === 'table'}
          onClick={() => setView((current) => (current === 'chart' ? 'table' : 'chart'))}
        >
          {view === 'chart' ? 'View as table' : 'View as chart'}
        </button>
      </div>

      {empty ? (
        <p className="text-sm text-neutral-600">
          There is nothing to project yet — add revenue and cost items first.
        </p>
      ) : view === 'chart' ? (
        <div className="h-72 w-full" data-testid="cash-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="#e2e4e6" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={(value: string) => formatMonthLabel(value)}
                tick={{ fontSize: 12, fill: '#4d5358' }}
                interval="preserveStartEnd"
                minTickGap={12}
              />
              <YAxis
                tickFormatter={(value: number) =>
                  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
                }
                tick={{ fontSize: 12, fill: '#4d5358' }}
                width={64}
              />
              <Tooltip
                formatter={(value: number, name) => [formatMoney(Math.round(value * 100), currency), name]}
                labelFormatter={(label: string) => formatMonthLabel(label)}
                contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#e2e4e6' }}
              />
              {/* Zero line highlighted (PRD 3.3) */}
              <ReferenceLine y={0} stroke="#a1160f" strokeWidth={2} strokeDasharray="4 2" />
              {series.map((item, index) => (
                <Line
                  key={item.id}
                  type="monotone"
                  dataKey={item.id}
                  name={item.name}
                  stroke={seriesColor(index)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <ul className="mt-2 flex flex-wrap gap-4 text-xs text-neutral-700">
            {series.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-4 rounded-sm"
                  style={{ backgroundColor: seriesColor(index) }}
                />
                {item.name}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-0.5 w-4 rounded-sm bg-danger" />
              Zero line
            </li>
          </ul>
        </div>
      ) : (
        <div className="overflow-x-auto" role="region" aria-label={`${title} as a table`} tabIndex={0}>
          <table className="w-full border-collapse">
            <caption className="sr-only">{title} shown as a table of numbers</caption>
            <thead>
              <tr>
                <th scope="col" className="th">
                  Month
                </th>
                {series.map((item) => (
                  <th key={item.id} scope="col" className="th text-right">
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series[0].points.map((point, index) => (
                <tr key={point.month}>
                  <th scope="row" className="td text-left font-medium text-neutral-800">
                    {formatMonthLabel(point.month)}
                  </th>
                  {series.map((item) => {
                    const cash = item.points[index]?.cash ?? 0
                    return (
                      <td key={item.id} className={`td num ${cash < 0 ? 'text-danger' : ''}`}>
                        {formatMoney(cash, currency)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}