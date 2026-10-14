import { Link } from 'react-router-dom'
import CashChart from '../components/CashChart'
import { AlertList, Badge, CalculatedPanel, Card, EmptyState, PageHeader } from '../components/ui'
import { useBusinessForecast } from '../hooks/useBusinessForecast'
import { formatMoney, formatMonths } from '../lib/money'
import { formatMonthLabel } from '../lib/months'
import { formatRunway } from '../lib/finance'

const MILESTONE_LABELS: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
  missed: 'Missed',
}

/** Tasks 5.2, 5.3 and 5.4 — KPI row, calculation panels, chart, alerts and upcoming milestones. */

export default function Dashboard() {
  const { business, data, summary } = useBusinessForecast()

  if (!business || !summary) {
    return (
      <EmptyState
        title="No business loaded"
        message="Open a profile or the demo business to see your runway."
      />
    )
  }

  const currency = business.currency
  const kpis = [
    {
      key: 'cash',
      label: 'Cash',
      value: formatMoney(summary.currentCash, currency),
      sub: `Opening balance in ${formatMonthLabel(business.startMonth)}`,
      tone: 'neutral' as const,
      formula: 'Current cash = opening cash balance you entered (cash in the bank today)',
      inputs: [
        { label: 'Opening cash', value: formatMoney(summary.currentCash, currency) },
        { label: 'Currency', value: currency },
      ],
    },
    {
      key: 'revenue',
      label: 'Monthly revenue',
      value: formatMoney(summary.monthlyRevenue, currency),
      sub: `${data.revenue.length} revenue ${data.revenue.length === 1 ? 'item' : 'items'} in ${formatMonthLabel(business.startMonth)}`,
      tone: 'neutral' as const,
      formula: 'Revenue(m) = Σ recurring items active in m + one-off items dated m',
      inputs: [
        {
          label: 'Recurring items',
          value: String(data.revenue.filter((item) => item.type === 'recurring').length),
        },
        {
          label: `${formatMonthLabel(business.startMonth)} total`,
          value: formatMoney(summary.monthlyRevenue, currency),
        },
      ],
    },
    {
      key: 'costs',
      label: 'Monthly costs',
      value: formatMoney(summary.monthlyCosts, currency),
      sub: `${data.expenses.length} expense ${data.expenses.length === 1 ? 'item' : 'items'} this month`,
      tone: 'neutral' as const,
      formula: 'Costs(m) = Σ recurring items active in m + one-off items dated m (fixed and variable)',
      inputs: [
        {
          label: 'Recurring items',
          value: String(data.expenses.filter((item) => item.type === 'recurring').length),
        },
        {
          label: 'One-off items this month',
          value: String(
            data.expenses.filter(
              (item) => item.type === 'one_off' && item.startMonth === business.startMonth,
            ).length,
          ),
        },
        {
          label: `${formatMonthLabel(business.startMonth)} total`,
          value: formatMoney(summary.monthlyCosts, currency),
        },
      ],
    },
    {
      key: 'burn',
      label: 'Net burn',
      value: formatMoney(summary.netBurn, currency),
      sub: `Net cash flow ${formatMoney(summary.rows[0]?.net ?? 0, currency)}`,
      tone: summary.netBurn > 0 ? ('warn' as const) : ('neutral' as const),
      formula: 'Net burn(m) = max(0, costs(m) − revenue(m)) — zero when the month is cash-positive',
      inputs: [
        { label: 'Revenue', value: formatMoney(summary.monthlyRevenue, currency) },
        { label: 'Costs', value: formatMoney(summary.monthlyCosts, currency) },
        { label: 'Net cash flow', value: formatMoney(summary.rows[0]?.net ?? 0, currency) },
      ],
    },
    {
      key: 'runway',
      label: 'Runway',
      value: formatRunway(summary.forecastRunway, summary.netBurn),
      sub:
        summary.forecastRunway.kind === 'cash_flow_positive' && summary.netBurn > 0 && summary.simpleRunwayMonths !== null
          ? `≈ ${formatMonths(summary.simpleRunwayMonths)} at current burn`
          : summary.simpleRunwayMonths === null
            ? 'No net burn over the next 3 months'
            : `Simple runway ${formatMonths(summary.simpleRunwayMonths)} at the next 3-month average burn`,
      tone:
        summary.forecastRunway.kind === 'months' && summary.forecastRunway.months < 3
          ? ('danger' as const)
          : summary.forecastRunway.kind === 'months' && summary.forecastRunway.months < 6
            ? ('warn' as const)
            : ('neutral' as const),
      formula: 'Forecast runway = months until projected closing cash first falls below zero',
      inputs: [
        { label: 'Current cash', value: formatMoney(summary.currentCash, currency) },
        {
          label: 'Average net burn (next 3 months)',
          value: formatMoney(summary.averageBurn, currency),
        },
        {
          label: 'Simple runway',
          value:
            summary.simpleRunwayMonths === null
              ? 'Not burning cash'
              : formatMonths(summary.simpleRunwayMonths),
        },
      ],
    },
  ]

  const upcoming = [...data.milestones]
    .filter((milestone) => milestone.status !== 'done')
    .sort((a, b) => a.targetMonth.localeCompare(b.targetMonth))
    .slice(0, 4)

  const hasInputs = data.revenue.length > 0 || data.expenses.length > 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          <>
            Cash, burn and runway for <strong>{business.name}</strong>, calculated from every revenue and cost
            item. Forecast window: 12 months from {formatMonthLabel(business.startMonth)}.
          </>
        }
        actions={
          <>
            <Link className="btn-ghost" to="/revenue">
              Add revenue
            </Link>
            <Link className="btn-ghost" to="/expenses">
              Add cost
            </Link>
            <Link className="btn-primary" to="/scenarios">
              Test a scenario
            </Link>
          </>
        }
      />

      {!hasInputs ? (
        <div className="mb-6">
          <EmptyState
            title="No revenue or costs yet"
            message="Add at least one revenue item and one cost so BootPulse can calculate your burn and runway."
            action={
              <Link className="btn-primary" to="/revenue">
                Add your first revenue item
              </Link>
            }
          />
        </div>
      ) : null}

      {/* KPI row — all five cards fit above the fold at 1440 × 900 (PRD 3.3) */}
      <section aria-label="Key figures" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.key} className="card px-4 py-3.5" data-testid={`kpi-${kpi.key}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{kpi.label}</p>
              <CalculatedPanel id={`kpi-${kpi.key}`} formula={kpi.formula} inputs={kpi.inputs} />
            </div>
            <p
              className={`mt-2 text-xl font-bold leading-snug tabular-nums ${
                kpi.tone === 'danger' ? 'text-danger' : kpi.tone === 'warn' ? 'text-warn' : 'text-neutral-900'
              }`}
            >
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-neutral-600">{kpi.sub}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Projected closing cash"
          description="Twelve months ahead, from the base case. The red dashed line is zero."
        >
          <CashChart
            currency={currency}
            series={[
              {
                id: 'base',
                name: 'Base',
                points: summary.rows.map((row) => ({ month: row.month, cash: row.closingCash })),
              },
            ]}
          />
        </Card>

        <Card title="Alerts" description="Runway risk, rising costs and falling revenue.">
          <AlertList alerts={summary.alerts} />
          <p className="mt-4 text-xs text-neutral-500">
            Rules: runway under 6 months (warning) or 3 months (critical); costs above 115% of the previous
            3-month average; revenue down more than 10% month on month.
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Upcoming milestones"
          description="What you are aiming for over the forecast window."
          actions={
            <Link className="btn-ghost" to="/milestones">
              Manage milestones
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState
              title="No open milestones"
              message="Add a milestone to keep the forecast tied to what you are trying to achieve."
              action={
                <Link className="btn-primary" to="/milestones">
                  Add a milestone
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcoming.map((milestone) => (
                <li key={milestone.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{milestone.title}</p>
                    <p className="text-xs text-neutral-500">
                      Target {formatMonthLabel(milestone.targetMonth)}
                    </p>
                  </div>
                  <Badge tone={milestone.status === 'in_progress' ? 'accent' : 'neutral'}>
                    {MILESTONE_LABELS[milestone.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent decisions"
          description="What you decided and why."
          actions={
            <Link className="btn-ghost" to="/decisions">
              Open log
            </Link>
          }
        >
          {data.decisions.length === 0 ? (
            <EmptyState
              title="No decisions logged"
              message="Record a decision with its expected impact so you can compare it with what actually happened."
              action={
                <Link className="btn-primary" to="/decisions">
                  Log a decision
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {data.decisions.slice(-3).map((decision) => (
                <li key={decision.id}>
                  <p className="text-sm font-medium text-neutral-900">{decision.title}</p>
                  <p className="text-xs text-neutral-500">{decision.date}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
