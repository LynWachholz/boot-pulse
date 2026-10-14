import { useState, type FormEvent } from 'react'
import CashChart, { seriesColor } from '../components/CashChart'
import {
  Badge,
  CalculatedPanel,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  MoneyInput,
  PageHeader,
  Select,
  TableWrap,
  TextInput,
} from '../components/ui'
import { IconEdit, IconPlus, IconTrash } from '../components/icons'
import { useBusinessForecast, forecastForScenario } from '../hooks/useBusinessForecast'
import { useStore } from '../store/useStore'
import type { Adjustment, AdjustmentType, Scenario } from '../types'
import { formatMoney, formatMonths, parseAmount } from '../lib/money'
import { formatMonthLabel, isMonth } from '../lib/months'
import { createPresetAdjustments, formatRunway, scenarioTotals } from '../lib/finance'

/** Tasks 5.8 and 5.9 — scenario list, adjustment editor, presets and side-by-side comparison. */

const ADJUSTMENT_LABELS: Record<AdjustmentType, string> = {
  revenue_pct: 'Revenue %',
  cost_pct: 'Cost %',
  add_revenue: 'Extra revenue',
  add_cost: 'Extra cost',
}

interface AdjustmentForm {
  id?: string
  label: string
  type: AdjustmentType
  /** Percentage for *_pct, cents for add_* */
  value: number
  recurring: boolean
  startMonth: string
  endMonth: string
}

export default function Scenarios() {
  const { business, base, data } = useBusinessForecast()
  const addScenario = useStore((state) => state.addScenario)
  const updateScenario = useStore((state) => state.updateScenario)
  const deleteScenario = useStore((state) => state.deleteScenario)
  const addAdjustment = useStore((state) => state.addAdjustment)
  const updateAdjustment = useStore((state) => state.updateAdjustment)
  const deleteAdjustment = useStore((state) => state.deleteAdjustment)

  const scenarios = data.scenarios
  const [selectedId, setSelectedId] = useState<string | null>(scenarios[0]?.id ?? null)
  const [compareIds, setCompareIds] = useState<string[]>(scenarios.slice(0, 2).map((item) => item.id))
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentForm | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Scenario | null>(null)
  const [newName, setNewName] = useState('')

  if (!business || !base) return null
  const currency = business.currency

  const selected = scenarios.find((item) => item.id === selectedId) ?? scenarios[0] ?? null
  const compared = compareIds
    .map((id, index) => {
      const scenario = scenarios.find((item) => item.id === id)
      if (!scenario) return null
      const { rows, summary } = forecastForScenario(base, scenario)
      return { scenario, rows, summary, color: seriesColor(index) }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const openAddAdjustment = () => {
    setErrors({})
    setAdjustmentForm({
      label: '',
      type: 'add_cost',
      value: 0,
      recurring: true,
      startMonth: business.startMonth,
      endMonth: '',
    })
  }

  const openEditAdjustment = (adjustment: Adjustment) => {
    setErrors({})
    setAdjustmentForm({
      id: adjustment.id,
      label: adjustment.label,
      type: adjustment.type,
      value: adjustment.value,
      recurring: adjustment.recurring,
      startMonth: adjustment.startMonth,
      endMonth: adjustment.endMonth ?? '',
    })
  }

  const handleAdjustmentSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!adjustmentForm || !selected) return

    const nextErrors: Record<string, string> = {}
    if (adjustmentForm.label.trim() === '') nextErrors.label = 'Describe the change, e.g. "Hire freelancer".'
    if (adjustmentForm.type === 'add_cost' || adjustmentForm.type === 'add_revenue') {
      if (adjustmentForm.value <= 0) nextErrors.value = 'Enter an amount greater than zero.'
    } else if (adjustmentForm.value === 0) {
      nextErrors.value = 'Enter a percentage change (for example -20 or 15).'
    }
    if (!isMonth(adjustmentForm.startMonth)) nextErrors.startMonth = 'Choose a start month.'
    if (adjustmentForm.recurring && adjustmentForm.endMonth !== '' && !isMonth(adjustmentForm.endMonth)) {
      nextErrors.endMonth = 'Choose a valid end month, or leave it empty.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      label: adjustmentForm.label.trim(),
      type: adjustmentForm.type,
      value: adjustmentForm.value,
      recurring: adjustmentForm.recurring,
      startMonth: adjustmentForm.startMonth,
      endMonth: adjustmentForm.recurring && adjustmentForm.endMonth !== '' ? adjustmentForm.endMonth : undefined,
    }

    if (adjustmentForm.id) {
      updateAdjustment(selected.id, adjustmentForm.id, payload)
    } else {
      addAdjustment(selected.id, payload)
    }
    setAdjustmentForm(null)
  }

  const addPresetScenarios = () => {
    const presets = createPresetAdjustments(business.startMonth)
    const baseScenario = addScenario('Base', 'base')
    const cautious = addScenario('Cautious', 'cautious')
    const growth = addScenario('Growth', 'growth')
    if (baseScenario && cautious && growth) {
      updateScenario(cautious.id, { adjustments: presets.cautious })
      updateScenario(growth.id, { adjustments: presets.growth })
      setSelectedId(cautious.id)
    }
  }

  const isMoneyType = (type: AdjustmentType) => type === 'add_cost' || type === 'add_revenue'

  return (
    <div>
      <PageHeader
        title="Scenario planner"
        description="Test a decision before you commit to it. Adjustments are applied on top of your base revenue and costs."
        actions={
          <>
            {scenarios.length === 0 ? (
              <button type="button" className="btn-ghost" onClick={addPresetScenarios}>
                Add preset scenarios
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                const scenario = addScenario(newName || 'New scenario', 'custom')
                if (scenario) {
                  setSelectedId(scenario.id)
                  setNewName('')
                }
              }}
            >
              <IconPlus width={16} height={16} />
              New scenario
            </button>
          </>
        }
      />

      {scenarios.length === 0 ? (
        <EmptyState
          title="No scenarios yet"
          message='Start with the presets — Base, Cautious (revenue −20%, costs +10%) and Growth (revenue +15%, costs +5%) — then edit them, or create your own from scratch.'
          action={
            <button type="button" className="btn-primary" onClick={addPresetScenarios}>
              Add preset scenarios
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card
            title="Scenarios"
            description="Select one to edit its adjustments."
            actions={
              <div className="w-40">
                <label className="sr-only" htmlFor="new-scenario-name">
                  New scenario name
                </label>
                <TextInput
                  id="new-scenario-name"
                  value={newName}
                  placeholder="Name…"
                  onChange={(event) => setNewName(event.target.value)}
                />
              </div>
            }
          >
            <ul className="space-y-2">
              {scenarios.map((scenario) => {
                const { summary } = forecastForScenario(base, scenario)
                const active = scenario.id === selected?.id
                return (
                  <li key={scenario.id}>
                    <div
                      className={`rounded-md border px-3 py-2 ${
                        active ? 'border-accent bg-accent-light' : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left"
                          aria-pressed={active}
                          onClick={() => setSelectedId(scenario.id)}
                        >
                          <span className="block text-sm font-semibold text-neutral-900">{scenario.name}</span>
                          <span className="block text-xs text-neutral-600">
                            {formatRunway(summary.forecastRunway, summary.netBurn)} ·{' '}
                            {scenario.adjustments.length} adjustment
                            {scenario.adjustments.length === 1 ? '' : 's'}
                          </span>
                        </button>
                        <Badge tone={scenario.kind === 'custom' ? 'neutral' : 'accent'}>{scenario.kind}</Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-neutral-700">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-neutral-300 text-accent"
                            checked={compareIds.includes(scenario.id)}
                            onChange={(event) => {
                              setCompareIds((current) =>
                                event.target.checked
                                  ? [...current, scenario.id]
                                  : current.filter((id) => id !== scenario.id),
                              )
                            }}
                          />
                          Compare
                        </label>
                        <button
                          type="button"
                          className="btn-danger ml-auto px-2 py-0.5 text-xs"
                          onClick={() => setPendingDelete(scenario)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          <Card
            className="xl:col-span-2"
            title={selected ? `Adjustments — ${selected.name}` : 'Adjustments'}
            description="Percentage changes scale revenue or costs from their start month. “Add” changes behave like an extra revenue or cost item."
            actions={
              <button type="button" className="btn-primary" onClick={openAddAdjustment} disabled={!selected}>
                <IconPlus width={16} height={16} />
                Add adjustment
              </button>
            }
          >
            {!selected || selected.adjustments.length === 0 ? (
              <EmptyState
                title="No adjustments in this scenario"
                message='Add a change such as "Hire freelancer USD 3,000/month from month 2" to see what it does to your runway.'
                action={
                  <button type="button" className="btn-primary" onClick={openAddAdjustment}>
                    Add the first adjustment
                  </button>
                }
              />
            ) : (
              <TableWrap label={`Adjustments in ${selected.name}`}>
                <thead>
                  <tr>
                    <th scope="col" className="th">
                      Change
                    </th>
                    <th scope="col" className="th">
                      Type
                    </th>
                    <th scope="col" className="th text-right">
                      Value
                    </th>
                    <th scope="col" className="th">
                      Applies
                    </th>
                    <th scope="col" className="th">
                      From
                    </th>
                    <th scope="col" className="th text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selected.adjustments.map((adjustment) => (
                    <tr key={adjustment.id}>
                      <th scope="row" className="td text-left font-medium text-neutral-900">
                        {adjustment.label}
                      </th>
                      <td className="td">{ADJUSTMENT_LABELS[adjustment.type]}</td>
                      <td className="td num">
                        {isMoneyType(adjustment.type)
                          ? formatMoney(adjustment.value, currency)
                          : `${adjustment.value > 0 ? '+' : ''}${adjustment.value}%`}
                      </td>
                      <td className="td">{adjustment.recurring ? 'Every month' : 'One month'}</td>
                      <td className="td">
                        {formatMonthLabel(adjustment.startMonth)}
                        {adjustment.endMonth ? ` – ${formatMonthLabel(adjustment.endMonth)}` : ''}
                      </td>
                      <td className="td">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn-ghost px-2 py-1"
                            onClick={() => openEditAdjustment(adjustment)}
                            aria-label={`Edit ${adjustment.label}`}
                          >
                            <IconEdit width={16} height={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-2 py-1"
                            onClick={() => selected && deleteAdjustment(selected.id, adjustment.id)}
                            aria-label={`Delete ${adjustment.label}`}
                          >
                            <IconTrash width={16} height={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </Card>
        </div>
      )}

      {scenarios.length > 0 ? (
        <Card
          className="mt-6"
          title="Side-by-side comparison"
          description="Tick two or more scenarios above to compare runway, cash at month 12 and total burn."
        >
          {compared.length === 0 ? (
            <EmptyState
              title="Nothing selected to compare"
              message="Tick at least one scenario in the list to see the comparison chart and table."
            />
          ) : (
            <>
              <CashChart
                currency={currency}
                title="Projected closing cash by scenario"
                series={compared.map((entry) => ({
                  id: entry.scenario.id,
                  name: entry.scenario.name,
                  points: entry.rows.map((row) => ({ month: row.month, cash: row.closingCash })),
                }))}
              />

              <div className="mt-6">
                <TableWrap label="Scenario comparison">
                  <thead>
                    <tr>
                      <th scope="col" className="th">
                        Scenario
                      </th>
                      <th scope="col" className="th text-right">
                        Runway
                      </th>
                      <th scope="col" className="th text-right">
                        Cash at month 12
                      </th>
                      <th scope="col" className="th text-right">
                        Total burn (12 months)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {compared.map((entry) => {
                      const totals = scenarioTotals(entry.rows)
                      return (
                        <tr key={entry.scenario.id}>
                          <th scope="row" className="td text-left font-medium text-neutral-900">
                            {entry.scenario.name}
                          </th>
                          <td className="td num">
                            {formatRunway(entry.summary.forecastRunway, entry.summary.netBurn)}
                            {entry.summary.forecastRunway.kind === 'cash_flow_positive' &&
                            entry.summary.netBurn > 0 &&
                            entry.summary.simpleRunwayMonths !== null ? (
                              <span className="block text-xs font-normal text-neutral-600">
                                ≈ {formatMonths(entry.summary.simpleRunwayMonths)} at current burn
                              </span>
                            ) : null}
                          </td>
                          <td className={`td num ${totals.month12Cash < 0 ? 'text-danger' : ''}`}>
                            {formatMoney(totals.month12Cash, currency)}
                          </td>
                          <td className="td num">{formatMoney(totals.totalBurn, currency)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </TableWrap>
              </div>
            </>
          )}
        </Card>
      ) : null}

      {selected ? (
        <Card className="mt-6" title="How the comparison is calculated">
          <div className="flex flex-wrap gap-6 text-sm text-neutral-700">
            <span className="flex items-center gap-2">
              <CalculatedPanel
                id="scenario-runway"
                formula="Runway = months until closing cash first falls below zero (or “cash-flow positive” if it never does)"
                inputs={[
                  { label: 'Selected scenario', value: selected.name },
                  { label: 'Adjustments', value: String(selected.adjustments.length) },
                ]}
              />
              Runway
            </span>
            <span className="flex items-center gap-2">
              <CalculatedPanel
                id="scenario-month12"
                formula="Cash at month 12 = opening cash + Σ net cash flow over 12 months"
                inputs={[
                  { label: 'Opening cash', value: formatMoney(business.openingCash, currency) },
                  {
                    label: 'Average net burn (next 3 months)',
                    value: formatMoney(forecastForScenario(base, selected).summary.averageBurn, currency),
                  },
                ]}
              />
              Cash at month 12
            </span>
            <span className="flex items-center gap-2">
              <CalculatedPanel
                id="scenario-burn"
                formula="Total burn = Σ max(0, costs − revenue) over the forecast"
                inputs={[
                  { label: 'Scenario', value: selected.name },
                  {
                    label: 'Total burn',
                    value: formatMoney(scenarioTotals(forecastForScenario(base, selected).rows).totalBurn, currency),
                  },
                ]}
              />
              Total burn
            </span>
          </div>
        </Card>
      ) : null}

      <Modal
        open={adjustmentForm !== null}
        onClose={() => setAdjustmentForm(null)}
        title={adjustmentForm?.id ? 'Edit adjustment' : 'Add adjustment'}
        description={`Applied to the scenario “${selected?.name ?? ''}”, on top of the base revenue and costs.`}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setAdjustmentForm(null)}>
              Cancel
            </button>
            <button type="submit" form="adjustment-form" className="btn-primary">
              {adjustmentForm?.id ? 'Save changes' : 'Add adjustment'}
            </button>
          </>
        }
      >
        {adjustmentForm ? (
          <form id="adjustment-form" className="space-y-4" onSubmit={handleAdjustmentSubmit} noValidate>
            <Field label="What changes?" htmlFor="adjustment-label" required error={errors.label}>
              <TextInput
                id="adjustment-label"
                value={adjustmentForm.label}
                placeholder="Hire freelancer USD 3,000/month"
                aria-invalid={errors.label ? true : undefined}
                onChange={(event) => setAdjustmentForm({ ...adjustmentForm, label: event.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type of change" htmlFor="adjustment-type">
                <Select
                  id="adjustment-type"
                  value={adjustmentForm.type}
                  onChange={(event) => {
                    const type = event.target.value as AdjustmentType
                    setAdjustmentForm({ ...adjustmentForm, type, value: 0 })
                  }}
                >
                  <option value="add_cost">Extra cost (e.g. a new hire)</option>
                  <option value="add_revenue">Extra revenue (e.g. a new client)</option>
                  <option value="revenue_pct">Revenue change in %</option>
                  <option value="cost_pct">Cost change in %</option>
                </Select>
              </Field>

              <Field
                label={isMoneyType(adjustmentForm.type) ? 'Amount per month' : 'Percentage change'}
                htmlFor="adjustment-value"
                required
                error={errors.value}
                hint={isMoneyType(adjustmentForm.type) ? undefined : 'Use a minus sign to reduce, e.g. -20.'}
              >
                {isMoneyType(adjustmentForm.type) ? (
                  <MoneyInput
                    id="adjustment-value"
                    value={adjustmentForm.value}
                    currency={currency}
                    invalid={Boolean(errors.value)}
                    onChange={(value) => setAdjustmentForm({ ...adjustmentForm, value })}
                  />
                ) : (
                  <TextInput
                    id="adjustment-value"
                    type="number"
                    step="1"
                    value={String(adjustmentForm.value)}
                    aria-invalid={errors.value ? true : undefined}
                    onChange={(event) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        value: parseAmount(event.target.value) ?? 0,
                      })
                    }
                  />
                )}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start month" htmlFor="adjustment-start" required error={errors.startMonth}>
                <TextInput
                  id="adjustment-start"
                  type="month"
                  value={adjustmentForm.startMonth}
                  aria-invalid={errors.startMonth ? true : undefined}
                  onChange={(event) => setAdjustmentForm({ ...adjustmentForm, startMonth: event.target.value })}
                />
              </Field>

              {adjustmentForm.recurring ? (
                <Field label="End month (optional)" htmlFor="adjustment-end" error={errors.endMonth}>
                  <TextInput
                    id="adjustment-end"
                    type="month"
                    value={adjustmentForm.endMonth}
                    aria-invalid={errors.endMonth ? true : undefined}
                    onChange={(event) => setAdjustmentForm({ ...adjustmentForm, endMonth: event.target.value })}
                  />
                </Field>
              ) : null}
            </div>

            <Field label="How long does it apply?" htmlFor="adjustment-recurring">
              <Select
                id="adjustment-recurring"
                value={adjustmentForm.recurring ? 'yes' : 'no'}
                onChange={(event) =>
                  setAdjustmentForm({ ...adjustmentForm, recurring: event.target.value === 'yes' })
                }
              >
                <option value="yes">Every month from the start month</option>
                <option value="no">Only once, in the start month</option>
              </Select>
            </Field>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete scenario"
        message={
          <>
            Delete the scenario <strong>{pendingDelete?.name}</strong> and all of its adjustments? Decisions
            linked to it keep their text but lose the link.
          </>
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteScenario(pendingDelete.id)
            setCompareIds((current) => current.filter((id) => id !== pendingDelete.id))
            if (selectedId === pendingDelete.id) setSelectedId(null)
          }
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
