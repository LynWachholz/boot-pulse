import { useState, type FormEvent } from 'react'
import type { Milestone, MilestoneStatus } from '../types'
import { MILESTONE_STATUSES } from '../types'
import { useActiveBusiness, useBusinessData, useStore } from '../store/useStore'
import { formatMonthLabel, isMonth } from '../lib/months'
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  TableWrap,
  TextInput,
} from '../components/ui'
import { IconEdit, IconPlus, IconTrash } from '../components/icons'

/** Task 5.10 — milestones with title, target month and status. */

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
  missed: 'Missed',
}

const STATUS_TONES: Record<MilestoneStatus, 'neutral' | 'accent' | 'good' | 'danger'> = {
  planned: 'neutral',
  in_progress: 'accent',
  done: 'good',
  missed: 'danger',
}

interface FormState {
  id?: string
  title: string
  targetMonth: string
  status: MilestoneStatus
}

export default function Milestones() {
  const business = useActiveBusiness()
  const { milestones } = useBusinessData()
  const addMilestone = useStore((state) => state.addMilestone)
  const updateMilestone = useStore((state) => state.updateMilestone)
  const deleteMilestone = useStore((state) => state.deleteMilestone)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | MilestoneStatus>('all')
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Milestone | null>(null)

  if (!business) return null

  const filtered = milestones
    .filter((milestone) => {
      const matchesQuery =
        query.trim() === '' || milestone.title.toLowerCase().includes(query.trim().toLowerCase())
      const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter
      return matchesQuery && matchesStatus
    })
    .sort((a, b) => a.targetMonth.localeCompare(b.targetMonth))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!form) return

    const nextErrors: Record<string, string> = {}
    if (form.title.trim() === '') nextErrors.title = 'Give this milestone a title.'
    if (!isMonth(form.targetMonth)) nextErrors.targetMonth = 'Choose a target month.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = { title: form.title.trim(), targetMonth: form.targetMonth, status: form.status }
    if (form.id) {
      updateMilestone(form.id, payload)
    } else {
      addMilestone(payload)
    }
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title="Milestones"
        description="What you are aiming for, and when. Milestones keep the numbers tied to a plan."
        actions={
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setErrors({})
              setForm({ title: '', targetMonth: business.startMonth, status: 'planned' })
            }}
          >
            <IconPlus width={16} height={16} />
            Add milestone
          </button>
        }
      />

      <div className="card px-5 py-4">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <SearchInput id="milestone-search" label="Search milestones" value={query} onChange={setQuery} placeholder="Title" />
          <div className="w-full sm:w-48">
            <label className="label" htmlFor="milestone-status-filter">
              Filter by status
            </label>
            <Select
              id="milestone-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | MilestoneStatus)}
            >
              <option value="all">All statuses</option>
              {MILESTONE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {milestones.length === 0 ? (
          <EmptyState
            title="No milestones yet"
            message="Add a milestone such as “Reach USD 6,000 MRR by June” so your forecast has a target."
            action={
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setErrors({})
                  setForm({ title: '', targetMonth: business.startMonth, status: 'planned' })
                }}
              >
                Add your first milestone
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching milestones"
            message="Nothing matches this search or filter."
            action={
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setQuery('')
                  setStatusFilter('all')
                }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <TableWrap label="Milestones">
            <thead>
              <tr>
                <th scope="col" className="th">
                  Title
                </th>
                <th scope="col" className="th">
                  Target month
                </th>
                <th scope="col" className="th">
                  Status
                </th>
                <th scope="col" className="th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((milestone) => (
                <tr key={milestone.id}>
                  <th scope="row" className="td text-left font-medium text-neutral-900">
                    {milestone.title}
                  </th>
                  <td className="td">{formatMonthLabel(milestone.targetMonth)}</td>
                  <td className="td">
                    <Badge tone={STATUS_TONES[milestone.status]}>{STATUS_LABELS[milestone.status]}</Badge>
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1"
                        aria-label={`Edit ${milestone.title}`}
                        onClick={() => {
                          setErrors({})
                          setForm({
                            id: milestone.id,
                            title: milestone.title,
                            targetMonth: milestone.targetMonth,
                            status: milestone.status,
                          })
                        }}
                      >
                        <IconEdit width={16} height={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-2 py-1"
                        aria-label={`Delete ${milestone.title}`}
                        onClick={() => setPendingDelete(milestone)}
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
        title={form?.id ? 'Edit milestone' : 'Add milestone'}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button type="submit" form="milestone-form" className="btn-primary">
              {form?.id ? 'Save changes' : 'Add milestone'}
            </button>
          </>
        }
      >
        {form ? (
          <form id="milestone-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Field label="Title" htmlFor="milestone-title" required error={errors.title}>
              <TextInput
                id="milestone-title"
                value={form.title}
                aria-invalid={errors.title ? true : undefined}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target month" htmlFor="milestone-month" required error={errors.targetMonth}>
                <TextInput
                  id="milestone-month"
                  type="month"
                  value={form.targetMonth}
                  aria-invalid={errors.targetMonth ? true : undefined}
                  onChange={(event) => setForm({ ...form, targetMonth: event.target.value })}
                />
              </Field>
              <Field label="Status" htmlFor="milestone-status">
                <Select
                  id="milestone-status"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as MilestoneStatus })}
                >
                  {MILESTONE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete milestone"
        message={
          <>
            Delete <strong>{pendingDelete?.title}</strong>? This cannot be undone.
          </>
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteMilestone(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}