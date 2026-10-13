import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Currency } from '../types'
import { CURRENCIES, CURRENCY_LABELS } from '../lib/money'
import { currentMonth, formatMonthLong } from '../lib/months'
import { useStore } from '../store/useStore'
import { Checkbox, Field, MoneyInput, Select, TextInput } from '../components/ui'

/** Task 3.2 — local sign-up with the PICS privacy notice and required consent. */

export default function SignUp() {
  const navigate = useNavigate()
  const signUp = useStore((state) => state.signUp)

  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [openingCash, setOpeningCash] = useState(0)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (name.trim() === '') nextErrors.name = 'Enter your name.'
    if (businessName.trim() === '') nextErrors.businessName = 'Enter a business name.'
    if (openingCash < 0) nextErrors.openingCash = 'Opening cash cannot be negative.'
    if (!consent) nextErrors.consent = 'Please agree to the privacy notice to continue.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    signUp({ name, businessName, currency, openingCash, startMonth: currentMonth() })
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Create your local profile</h1>
      <p className="mt-1 text-sm text-neutral-600">
        This is a demo sign-up: no password is stored and no account is created on any server.
      </p>

      <form className="card mt-6 space-y-5 px-5 py-6" onSubmit={handleSubmit} noValidate>
        <Field label="Your name" htmlFor="signup-name" required error={errors.name}>
          <TextInput
            id="signup-name"
            value={name}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'signup-name-error' : undefined}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label="Business name" htmlFor="signup-business" required error={errors.businessName}>
          <TextInput
            id="signup-business"
            value={businessName}
            aria-invalid={errors.businessName ? true : undefined}
            aria-describedby={errors.businessName ? 'signup-business-error' : undefined}
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Currency" htmlFor="signup-currency" hint="You can change this later in Settings.">
            <Select
              id="signup-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_LABELS[code]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Opening cash balance"
            htmlFor="signup-cash"
            required
            error={errors.openingCash}
            hint="Cash in the bank today."
          >
            <MoneyInput
              id="signup-cash"
              value={openingCash}
              currency={currency}
              onChange={setOpeningCash}
              invalid={Boolean(errors.openingCash)}
            />
          </Field>
        </div>

        <div className="rounded-md border border-neutral-200 bg-neutral-25 p-4 text-sm text-neutral-700">
          <h2 className="text-sm font-semibold text-neutral-900">
            Personal Information Collection Statement (PICS)
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>What we collect:</strong> your name, your business name and the financial figures you
              enter (opening cash, revenue and costs).
            </li>
            <li>
              <strong>Why:</strong> only to calculate your cash flow, burn rate and runway, and to show you
              scenarios.
            </li>
            <li>
              <strong>Where it is stored:</strong> in this browser only (<code>localStorage</code> on this
              device). Nothing is uploaded to a server, and Phase 1 has no accounts, cookies, analytics or
              tracking.
            </li>
            <li>
              <strong>How to delete it:</strong> open <Link className="link" to="/settings">Settings</Link> at
              any time and choose &ldquo;Delete all my data&rdquo;. You can also export everything as JSON
              first.
            </li>
          </ul>
          <p className="mt-3">
            Because everything stays in your browser, clearing your browser data will also remove your
            BootPulse data. BootPulse is a planning tool and does not provide financial advice.
          </p>
        </div>

        <Checkbox
          id="signup-consent"
          checked={consent}
          onChange={setConsent}
          required
          error={errors.consent}
          label={
            <>
              I have read the privacy notice and agree to BootPulse storing this information in my browser.
              {consent ? <span className="sr-only">Consent recorded.</span> : null}
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary">
            Create profile and continue
          </button>
          <Link className="link text-sm" to="/login">
            I already have a local profile
          </Link>
        </div>
      </form>

      <p className="mt-4 text-xs text-neutral-500">
        Forecasts start in {formatMonthLong(currentMonth())}. All figures are stored as whole cents to avoid
        rounding errors.
      </p>
    </div>
  )
}