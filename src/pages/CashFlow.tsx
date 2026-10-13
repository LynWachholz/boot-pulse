import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusinessForecast } from '../hooks/useBusinessForecast'
import { formatMoney } from '../lib/money'
import { formatMonthLabel } from '../lib/months'
import { datedFilename, downloadCsv } from '../lib/export'
import { Card, EmptyState, PageHeader, TableWrap } from '../components/ui'
import { IconDownload } from '../components/icons'

/** Task 5.7 — the 12-month cash-flow table with CSV export. */

export default function CashFlow() {
  const { business, summary } = useBusinessForecast()
  const [exported, setExported] = useState(false)

  if (!business || !summary) return null

  const currency = business.currency
  const rows = summary.rows

  const handleExport = () => {
    downloadCsv(datedFilename('bootpulse-cash-flow', 'csv'), rows)
    setExported(true)
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Nothing to show yet"
        message="Add revenue and costs first, then your 12-month cash flow appears here."
        action={
          <Link className="btn-primary" to="/revenue">
            Add revenue
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Cash flow"
        description={
          <>
            Twelve months from {formatMonthLabel(business.startMonth)}. Closing cash of one month becomes the
            opening cash of the next.
          </>
        }
        actions={
          <button type="button" className="btn-primary" onClick={handleExport}>
            <IconDownload width={16} height={16} />
            Export CSV
          </button>
        }
      />

      {exported ? (
        <p className="mb-4 rounded-md border border-good/30 bg-good-light px-3 py-2 text-sm text-good" role="status">
          CSV downloaded. It opens in Excel, Numbers and Google Sheets with one row per month.
        </p>
      ) : null}

      <Card>
        <TableWrap label="Monthly cash flow for the next 12 months">
          <caption className="sr-only">Monthly cash flow: opening cash, revenue, costs, net and closing cash</caption>
          <thead>
            <tr>
              <th scope="col" className="th">
                Month
              </th>
              <th scope="col" className="th text-right">
                Opening cash
              </th>
              <th scope="col" className="th text-right">
                Revenue
              </th>
              <th scope="col" className="th text-right">
                Costs
              </th>
              <th scope="col" className="th text-right">
                Net cash flow
              </th>
              <th scope="col" className="th text-right">
                Closing cash
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row" className="td text-left font-medium text-neutral-800">
                  {formatMonthLabel(row.month)}
                </th>
                <td className="td num">{formatMoney(row.openingCash, currency)}</td>
                <td className="td num">{formatMoney(row.revenue, currency)}</td>
                <td className="td num">{formatMoney(row.costs, currency)}</td>
                <td className={`td num ${row.net < 0 ? 'text-danger' : 'text-good'}`}>
                  {formatMoney(row.net, currency)}
                </td>
                <td className={`td num font-semibold ${row.closingCash < 0 ? 'text-danger' : ''}`}>
                  {formatMoney(row.closingCash, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <p className="mt-4 text-xs text-neutral-500">
        Net cash flow = revenue − costs. Net burn = max(0, costs − revenue). Zero and negative closing cash are
        shown with a minus sign and colour.
      </p>
    </div>
  )
}
