import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import type { Currency } from '../types'
import { formatMoney, fromCents, parseAmount, toCents } from '../lib/money'
import { IconClose, IconCritical, IconInfo, IconWarning } from './icons'

/* --------------------------------- layout --------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-neutral-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Card({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-neutral-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-25 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'warn' | 'danger' | 'good'
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    accent: 'bg-accent-light text-accent-dark border-accent/30',
    warn: 'bg-warn-light text-warn border-warn/30',
    danger: 'bg-danger-light text-danger border-danger/30',
    good: 'bg-good-light text-good border-good/30',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/* --------------------------------- forms --------------------------------- */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-neutral-500" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={`input ${className}`} {...rest} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props
  return (
    <select className={`input ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Checkbox({
  label,
  checked,
  onChange,
  id,
  error,
  required,
}: {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  id: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <label htmlFor={id} className="text-sm text-neutral-700">
          {label}
        </label>
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Amount input that speaks integer cents to the app and friendly numbers to the user. */
export function MoneyInput({
  id,
  value,
  currency,
  onChange,
  placeholder,
  required,
  describedBy,
  invalid,
}: {
  id: string
  value: number
  currency: Currency
  onChange: (cents: number) => void
  placeholder?: string
  required?: boolean
  describedBy?: string
  invalid?: boolean
}) {
  const [draft, setDraft] = useState(String(fromCents(value)))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setDraft(String(fromCents(value)))
  }, [value, focused])

  const handle = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setDraft(raw)
    const parsed = parseAmount(raw)
    onChange(parsed === null ? 0 : toCents(parsed))
  }

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500"
      >
        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'HK$'}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className="input pl-9"
        value={draft}
        placeholder={placeholder}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          setDraft(String(fromCents(value)))
        }}
        onChange={handle}
      />
    </div>
  )
}

/* --------------------------------- modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )

    focusables()[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/40 p-4 py-10">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        className={`relative z-10 w-full ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'} rounded-lg bg-white shadow-pop`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
              {title}
            </h2>
            {description ? <div className="mt-1 text-sm text-neutral-600">{description}</div> : null}
          </div>
          <button type="button" className="btn-ghost px-2 py-1" onClick={onClose} aria-label="Close dialog">
            <IconClose />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------ info panel ------------------------------ */

/**
 * "How is this calculated?" (PRD 7.3) — opens with mouse or keyboard, closes with Esc.
 */
export function CalculatedPanel({
  id,
  label = 'How is this calculated?',
  formula,
  inputs,
}: {
  id: string
  label?: string
  formula: string
  inputs: { label: string; value: string }[]
}) {
  const [open, setOpen] = useState(false)
  const panelId = `${id}-panel`

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="rounded-full p-0.5 text-neutral-500 hover:text-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label} — ${id}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            event.stopPropagation()
            setOpen(false)
          }
        }}
      >
        <IconInfo />
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
          className="absolute left-0 top-7 z-30 w-80 rounded-md border border-neutral-200 bg-white p-4 text-left shadow-pop"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-900">{label}</p>
            <button
              type="button"
              className="rounded p-0.5 text-neutral-500 hover:text-neutral-900"
              onClick={() => setOpen(false)}
              aria-label="Close calculation panel"
            >
              <IconClose width={16} height={16} />
            </button>
          </div>
          <p className="mt-2 rounded bg-neutral-50 px-2 py-1.5 font-mono text-xs text-neutral-800">{formula}</p>
          <dl className="mt-3 space-y-1 text-xs text-neutral-700">
            {inputs.map((item) => (
              <div key={item.label} className="flex justify-between gap-3">
                <dt className="text-neutral-600">{item.label}</dt>
                <dd className="tabular-nums font-medium text-neutral-900">{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-neutral-500">
            Every figure on this page comes from the same calculation module, so it can be checked by hand.
          </p>
        </div>
      ) : null}
    </span>
  )
}

/* --------------------------------- alerts --------------------------------- */

export function AlertList({
  alerts,
  emptyMessage = 'No warnings — costs and revenue look stable for the next 12 months.',
}: {
  alerts: { id: string; severity: 'critical' | 'warning'; title: string; message: string }[]
  emptyMessage?: string
}) {
  if (alerts.length === 0) {
    return <p className="text-sm text-neutral-600">{emptyMessage}</p>
  }
  return (
    <ul className="space-y-2">
      {alerts.map((alert) => {
        const critical = alert.severity === 'critical'
        return (
          <li
            key={alert.id}
            className={`flex items-start gap-3 rounded-md border px-3 py-2.5 ${
              critical ? 'border-danger/30 bg-danger-light' : 'border-warn/30 bg-warn-light'
            }`}
          >
            <span className={critical ? 'mt-0.5 text-danger' : 'mt-0.5 text-warn'}>
              {critical ? <IconCritical /> : <IconWarning />}
            </span>
            <div>
              <p className={`text-sm font-semibold ${critical ? 'text-danger' : 'text-warn'}`}>
                {alert.title}
              </p>
              <p className="text-sm text-neutral-700">{alert.message}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------- utilities ------------------------------- */

/** Consistent money cell: right aligned, tabular figures, negative in red. */
export function Money({ cents, currency }: { cents: number; currency: Currency }) {
  return (
    <span className={cents < 0 ? 'text-danger' : undefined}>{formatMoney(cents, currency)}</span>
  )
}

export function TableWrap({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={label} tabIndex={0}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

/* ------------------------------ dialogs ------------------------------ */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-neutral-700">{message}</div>
    </Modal>
  )
}

/** Search field with a visible label (PRD 7.1). */
export function SearchInput({
  id,
  label,
  value,
  onChange,
  placeholder = 'Search…',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="w-full sm:max-w-xs">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
