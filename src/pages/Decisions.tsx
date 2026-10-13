import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Decision } from '../types'
import { useBusinessData, useStore } from '../store/useStore'
import { todayISO } from '../lib/months'
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

/** Task 5.11 — decision log linking a decision to the scenario that tested it. */

interface FormState {
  id?: string
  date: string
  title: string
  reasoning: string
  expectedImpact: string
  actualOutcome: string
  scenarioId: string
}

export default function Decisions() {
  const { decisions, scenarios } = useBusinessData()
  const addDecision = useStore((state) => state.addDecision)
  const updateDecision = useStore((state) => state.updateDecision)
  const deleteDecision = useStore((state) => state.deleteDecision)

  const [query, setQuery] = useState('')
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingDelete, setPendingDelete] = useState<Decision | null>(null)

  const scenarioName = (scenarioId?: string) =>
    scenarioId ? (scenarios.find((scenario) => scenario.id === scenarioId)?.name ?? 'Scenario removed') : null

  const filtered = decisions
    .filter((decision) => {
      const needle = query.trim().toLowerCase()
      if (needle === '') return true
      return (
        decision.title.toLowerCase().includes(needle) ||
        decision.reasoning.toLowerCase().includes(needle) ||
        decision.expectedImpact.toLowerCase().includes(needle) ||
        (decision.actualOutcome ?? '').toLowerCase().includes(needle) ||
        (scenarioName(decision.scenarioId) ?? '').toLowerCase().includes(needle)
      )
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  const openCreate = () => {
    setErrors({})
    setForm({
      date: todayISO(),
      title: '',
      reasoning: '',
      expectedImpact: '',
      actualOutcome: '',
      scenarioId: '',
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!form) return

    const nextErrors: Record<string, string> = {}
    if (form.title.trim() === '') nextErrors.title = 'Describe the decision briefly.'
    if (form.reasoning.trim() === '') nextErrors.reasoning = 'Note why you decided this.'
    if (form.expectedImpact.trim() === '') nextErrors.expectedImpact = 'Note the impact you expect.'
    if (form.date.trim() === '') nextErrors.date = 'Choose a date.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      date: form.date,
      title: form.title.trim(),
      reasoning: form.reasoning.trim(),
      expectedImpact: form.expectedImpact.trim(),
      actualOutcome: form.actualOutcome.trim() === '' ? undefined : form.actualOutcome.trim(),
      scenarioId: form.scenarioId === '' ? undefined : form.scenarioId,
    }

    if (form.id) {
      updateDecision(form.id, payload)
    } else {
      addDecision(payload)
    }
    setForm(null)
  }

  return (
    <div>
      <PageHeader
        title="Decision log"
        description="Every decision, the reasoning behind it and what you expected — so future you can see whether it worked."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <IconPlus width={16} height={16} />
            Log a decision
          </button>
        }
      />

      <div className="card px-5 py-4">
        <div className="mb-4">
          <SearchInput
            id="decision-search"
            label="Search decisions"
            value={query}
            onChange={setQuery}
            placeholder="Decision, reasoning or scenario"
          />
        </div>

        {decisions.length === 0 ? (
          <EmptyState
            title="No decisions logged yet"
            message="Log a decision you are about to make — for example hiring a freelancer — and link it to the scenario you used to test it."
            action={
              <button type="button" className="btn-primary" onClick={openCreate}>
                Log your first decision
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching decisions"
            message="Nothing matches this search."
            action={
              <button type="button" className="btn-ghost" onClick={() => setQuery('')}>
                Clear search
              </button>
            }
          />
        ) : (
          <TableWrap label="Decision log">
            <thead>
              <tr>
                <th scope="col" className="th">
                  Date
                </th>
                <th scope="col" className="th">
                  Decision
                </th>
                <th scope="col" className="th">
                  Expected impact
                </th>
                <th scope="col" className="th">
                  Actual outcome
                </th>
                <th scope="col" className="th">
                  Scenario
                </th>
                <th scope="col" className="th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((decision) => (
                <tr key={decision.id}>
                  <td className="td">{decision.date}</td>
                  <th scope="row" className="td max-w-md whitespace-normal text-left font-medium text-neutral-900">
                    {decision.title}
                    <p className="mt-0.5 text-xs font-normal text-neutral-500">{decision.reasoning}</p>
                  </th>
                  <td className="td max-w-xs whitespace-normal">{decision.expectedImpact}</td>
                  <td className="td max-w-xs whitespace-normal">
                    {decision.actualOutcome ?? <span className="text-neutral-500">Not recorded yet</span>}
                  </td>
                  <td className="td">
                    {scenarioName(decision.scenarioId) ? (
                      <Badge tone="accent">{scenarioName(decision.scenarioId)}</Badge>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost px-2 py-1"
                        aria-label={`Edit ${decision.title}`}
                        onClick={() => {
                          setErrors({})
                          setForm({
                            id: decision.id,
                            date: decision.date,
                            title: decision.title,
                            reasoning: decision.reasoning,
                            expectedImpact: decision.expectedImpact,
                            actualOutcome: decision.actualOutcome ?? '',
                            scenarioId: decision.scenarioId ?? '',
                          })
                        }}
                      >
                        <IconEdit width={16} height={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-2 py-1"
                        aria-label={`Delete ${decision.title}`}
                        onClick={() => setPendingDelete(decision)}
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
        size="lg"
        title={form?.id ? 'Edit decision' : 'Log a decision'}
        description="Capture the reasoning while it is fresh, then come back and record what actually happened."
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button type="submit" form="decision-form" className="btn-primary">
              {form?.id ? 'Save changes' : 'Log decision'}
            </button>
          </>
        }
      >
        {form ? (
          <form id="decision-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="decision-date" required error={errors.date}>
                <TextInput
                  id="decision-date"
                  type="date"
                  value={form.date}
                  aria-invalid={errors.date ? true : undefined}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </Field>
              <Field label="Linked scenario (optional)" htmlFor="decision-scenario">
                <Select
                  id="decision-scenario"
                  value={form.scenarioId}
                  onChange={(event) => setForm({ ...form, scenarioId: event.target.value })}
                >
                  <option value="">No scenario linked</option>
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Decision" htmlFor="decision-title" required error={errors.title}>
              <TextInput
                id="decision-title"
                value={form.title}
                aria-invalid={errors.title ? true : undefined}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>

            <Field label="Reasoning" htmlFor="decision-reasoning" required error={errors.reasoning}>
              <textarea
                id="decision-reasoning"
                className="input min-h-24"
                value={form.reasoning}
                aria-invalid={errors.reasoning ? true : undefined}
                onChange={(event) => setForm({ ...form, reasoning: event.target.value })}
              />
            </Field>

            <Field label="Expected impact" htmlFor="decision-expected" required error={errors.expectedImpact}>
              <TextInput
                id="decision-expected"
                value={form.expectedImpact}
                aria-invalid={errors.expectedImpact ? true : undefined}
                onChange={(event) => setForm({ ...form, expectedImpact: event.target.value })}
              />
            </Field>

            <Field label="Actual outcome (optional)" htmlFor="decision-actual" hint="Fill this in later, once you know.">
              <TextInput
                id="decision-actual"
                value={form.actualOutcome}
                onChange={(event) => setForm({ ...form, actualOutcome: event.target.value })}
              />
            </Field>

            {scenarios.length === 0 ? (
              <p className="text-xs text-neutral-500">
                Tip: create a scenario first to test the decision before logging it — see{' '}
                <Link className="link" to="/scenarios">
                  Scenario planner
                </Link>
                .
              </p>
            ) : null}
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete decision"
        message={
          <>
            Delete <strong>{pendingDelete?.title}</strong>? This cannot be undone.
          </>
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteDecision(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}