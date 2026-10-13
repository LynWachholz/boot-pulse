import { useState, type FormEvent } from 'react'
import type { ExpenseCategory, ExpenseBehaviour, ExpenseItem, RevenueType } from '../types'
import { EXPENSE_CATEGORIES } from '../types'
import { useActiveBusiness, useBusinessData, useStore } from '../store/useStore'
import { formatMoney } from '../lib/money'
import { formatMonthLabel, isMonth } from '../lib/months'
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  MoneyInput,
  PageHeader,
  SearchInput,
  Select,
  TableWrap,
  TextInput,
} from '../components/ui'
import { IconEdit, IconPlus, IconTrash } from '../components/icons'

/** Task 5.6 — expense items: category, fixed/variable, recurring/one-off, search and filter. */

interface FormState {
  id?: string
  name: string
  amount: number
  category: ExpenseCategory
  behaviour: ExpenseBehaviour
  type: RevenueType
  startMonth: string
  endMonth: string
  notes: string
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  people: 'People',
  software: 'Software',
  marketing: 'Marketing',
  office: 'Office',
  other: 'Other',
}

const emptyForm = (startMonth: string): FormState => ({
  name: '',
  amount: 0,
  category: 'software',
  behaviour: 'fixed',
  type: 'recurring',
  startMonth,
  endMonth: '',
  notes: '',
})

export default function Expenses() {
  const business = useActiveBusiness()
  const { expenses } = useBusinessData()
  const addExpense = useStore((state) => state.addExpense)
  const updateExpense = useStore((state) => state.updateExpense)
  const deleteExpense = useStore((state) => state.deleteExpense)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all')
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<ExpenseItem | null>(null)

  if (!business) return null
  const currency = business.currency

  const filtered = expenses.filter((item) => {
    const matchesQuery =
      query.trim() === '' ||
      item.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      (item.notes ?? '').toLowerCase().includes(query.trim().toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesQuery && matchesCategory
  })

  const openCreate = () => {
    setErrors({})
    setForm(emptyForm(business.startMonth))
  }

  const openEdit = (item: ExpenseItem) => {
    setErrors({})
    setForm({
      id: item.id,
      name: item.name,
      amount: item.amount,
      category: item.category,
      behaviour: item.behaviour,
      type: item.type,
      startMonth: item.startMonth,
      endMonth: item.endMonth ?? '',
      notes: item.notes ?? '',
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!form) return

    const nextErrors: Record<string, string> = {}
    if (form.name.trim() === '') nextErrors.name = 'Give this cost a name.'
    if (form.amount <= 0) nextErrors.amount = 'Enter an amount greater than zero.'
    if (!isMonth(form.startMonth)) nextErrors.startMonth = 'Choose a start month.'
    if (form.type === 'recurring' && form.endMonth !== '' && !isMonth(form.endMonth)) {
      nextErrors.endMonth = 'Choose a valid end month, or leave it empty.'
    }
    if (form.type === 'recurring' && isMonth(form.endMonth) && form.endMonth < form.startMonth) {
      nextErrors.endMonth = 'The end month must be on or after the start month.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      name: form.name.trim(),
      amount: form.amount,
      category: form.category,
      behaviour: form.behaviour,
      type: form.type,
      startMonth: form.startMonth,
      endMonth: form.type === 'recurring' && form.endMonth !== '' ? form.endMonth : undefined,
      notes: form.notes.trim() === '' ? undefined : form.notes.trim(),
    }

    if (form.id) {
      updateExpense(form.id, payload)
    } else {
      addExpense(payload)
    }
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Fixed costs stay the same each month; variable costs flex with activity. Both can repeat or be one-off."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <IconPlus width={16} height={16} />
            Add cost
          </button>
        }
      />

      <div className="card px-5 py-4">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <SearchInput id="expense-search" label="Search costs" value={query} onChange={setQuery} placeholder="Name or notes" />
          <div className="w-full sm:w-48">
            <label className="label" htmlFor="expense-category-filter">
              Filter by category
            </label>
            <Select
              id="expense-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as 'all' | ExpenseCategory)}
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            title="No costs yet"
            message="Add salaries, software, marketing and other costs so BootPulse can calculate your burn rate."
            action={
              <button type="button" className="btn-primary" onClick={openCreate}>
                Add your first cost
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching costs"
            message="Nothing matches this search or filter. Try another keyword, or clear the filter."
            action={
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setQuery('')
                  setCategoryFilter('all')
                }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <TableWrap label="Expense items">
            <thead>
              <tr>
                <th scope="col" className="th">
                  Name
                </th>
                <th scope="col" className="th">
                  Category
                </th>
                <th scope="col" className="th">
                  Behaviour
                </th>
                <th scope="col" className="th">
                  Type
                </th>
                <th scope="col" className="th text-right">
                  Amount
                </th>
                <th scope="col" className="th">
                  Active from
                </th>
                <th scope="col" className="th">
                  Until
                </th>
                <th scope="col" className="th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <th scope="row" className="td text-left font-medium text-neutral-900">
                    {item.name}
                    {item.notes ? <p className="text-xs font-normal text-neutral-500">{item.notes}</p> : null}
                  </th>
                  <td className="td">{CATEGORY_LABELS[item.category]}</td>
                  <td className="td capitalize">{item.behaviour}</td>
                  <td className="td">
                    <Badge tone={item.type === 'recurring' ? 'accent' : 'neutral'}>
                      {item.type === 'recurring' ? 'Recurring' : 'One-off'}
                    </Badge>
                  </td>
                  <td className="td num">{formatMoney(item.amount, currency)}</td>
                  <td className="td">{formatMonthLabel(item.startMonth)}</td>
                  <td className="td">{item.endMonth ? formatMonthLabel(item.endMonth) : 'Ongoing'}</td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit ${item.name}`}
                      >
                        <IconEdit width={16} height={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-2 py-1"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${item.name}`}
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
      </div>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit cost' : 'Add cost'}
        description="Categories keep your cost base readable; fixed vs variable describes how it behaves."
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button type="submit" form="expense-form" className="btn-primary">
              {form?.id ? 'Save changes' : 'Add cost'}
            </button>
          </>
        }
      >
        {form ? (
          <form id="expense-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="Name" htmlFor="expense-name" required error={errors.name}>
              <TextInput
                id="expense-name"
                value={form.name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'expense-name-error' : undefined}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount per month" htmlFor="expense-amount" required error={errors.amount}>
                <MoneyInput
                  id="expense-amount"
                  value={form.amount}
                  currency={currency}
                  invalid={Boolean(errors.amount)}
                  onChange={(amount) => setForm({ ...form, amount })}
                />
              </Field>

              <Field label="Category" htmlFor="expense-category">
                <Select
                  id="expense-category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Behaviour" htmlFor="expense-behaviour">
                <Select
                  id="expense-behaviour"
                  value={form.behaviour}
                  onChange={(event) =>
                    setForm({ ...form, behaviour: event.target.value as ExpenseBehaviour })
                  }
                >
                  <option value="fixed">Fixed — same every month</option>
                  <option value="variable">Variable — flexes with activity</option>
                </Select>
              </Field>

              <Field label="Type" htmlFor="expense-type">
                <Select
                  id="expense-type"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value as RevenueType })}
                >
                  <option value="recurring">Recurring (every active month)</option>
                  <option value="one_off">One-off (its own month only)</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start month" htmlFor="expense-start" required error={errors.startMonth}>
                <TextInput
                  id="expense-start"
                  type="month"
                  value={form.startMonth}
                  aria-invalid={errors.startMonth ? true : undefined}
                  onChange={(event) => setForm({ ...form, startMonth: event.target.value })}
                />
              </Field>

              {form.type === 'recurring' ? (
                <Field
                  label="End month (optional)"
                  htmlFor="expense-end"
                  error={errors.endMonth}
                  hint="Leave empty for ongoing costs."
                >
                  <TextInput
                    id="expense-end"
                    type="month"
                    value={form.endMonth}
                    aria-invalid={errors.endMonth ? true : undefined}
                    onChange={(event) => setForm({ ...form, endMonth: event.target.value })}
                  />
                </Field>
              ) : null}
            </div>

            <Field label="Notes (optional)" htmlFor="expense-notes">
              <TextInput
                id="expense-notes"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </Field>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete cost"
        message={
          <>
            Delete <strong>{pendingDelete?.name}</strong>? Your cash flow, runway and alerts recalculate
            immediately. This cannot be undone.
          </>
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteExpense(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}