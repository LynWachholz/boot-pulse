import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Currency } from '../types'
import { CURRENCIES, CURRENCY_LABELS, formatMoney } from '../lib/money'
import { formatMonthLong } from '../lib/months'
import { datedFilename, downloadJson } from '../lib/export'
import { useActiveBusiness, useActiveProfile, useStore } from '../store/useStore'
import { Badge, Card, ConfirmDialog, Field, PageHeader, Select } from '../components/ui'
import { IconDownload, IconTrash } from '../components/icons'

/** Task 5.12 — currency, reset demo data, export all data (JSON) and delete all data. */

export default function Settings() {
  const business = useActiveBusiness()
  const profile = useActiveProfile()
  const plan = useStore((state) => state.plan)
  const demoBusinessId = useStore((state) => state.demoBusinessId)
  const setCurrency = useStore((state) => state.setCurrency)
  const resetDemoData = useStore((state) => state.resetDemoData)
  const deleteAllData = useStore((state) => state.deleteAllData)
  const exportAll = useStore((state) => state.exportAll)
  const updateBusiness = useStore((state) => state.updateBusiness)
  const navigate = useNavigate()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [exported, setExported] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  if (!business) return null

  const isDemo = business.id === demoBusinessId
  const planLabel = plan === 'free' ? 'Free plan' : plan === 'founder' ? 'Founder plan' : 'Adviser plan'

  const handleExport = () => {
    downloadJson(datedFilename('bootpulse-data', 'json'), exportAll())
    setExported(true)
  }

  const handleDeleteAll = () => {
    deleteAllData()
    setConfirmDelete(false)
    navigate('/', { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Everything here affects this browser only. Nothing is stored on a server in Phase 1."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Business" description="Details you provided when you created this profile.">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Business name</dt>
              <dd className="font-medium text-neutral-900">{business.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Profile</dt>
              <dd className="font-medium text-neutral-900">{profile?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Opening cash</dt>
              <dd className="font-medium tabular-nums text-neutral-900">
                {formatMoney(business.openingCash, business.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Forecast starts</dt>
              <dd className="font-medium text-neutral-900">{formatMonthLong(business.startMonth)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-600">Current plan</dt>
              <dd>
                <Badge tone={plan === 'free' ? 'neutral' : 'good'}>{planLabel}</Badge>{' '}
                <Link className="link ml-2 text-sm" to="/pricing">
                  Change plan
                </Link>
              </dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Currency" htmlFor="settings-currency" hint="Applies to every amount in the app.">
              <Select
                id="settings-currency"
                value={business.currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Opening cash balance" htmlFor="settings-opening-cash">
              <input
                id="settings-opening-cash"
                type="text"
                inputMode="decimal"
                className="input"
                defaultValue={(business.openingCash / 100).toString()}
                onBlur={(event) => {
                  const parsed = Number(event.target.value.replace(/[^0-9.\-]/g, ''))
                  if (Number.isFinite(parsed) && parsed >= 0) {
                    updateBusiness(business.id, { openingCash: Math.round(parsed * 100) })
                  }
                  event.target.value = (business.openingCash / 100).toString()
                }}
              />
            </Field>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Your data" description="Privacy by default: you can take your data with you, or erase it.">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Export all data</p>
                  <p className="text-xs text-neutral-600">
                    Downloads a JSON file with your profile, business, items, scenarios, milestones and decisions.
                  </p>
                </div>
                <button type="button" className="btn-ghost" onClick={handleExport}>
                  <IconDownload width={16} height={16} />
                  Export JSON
                </button>
              </div>
              {exported ? (
                <p className="text-xs text-good" role="status">
                  Export downloaded.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger-light px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-danger">Delete all my data</p>
                  <p className="text-xs text-neutral-700">
                    Permanently clears every BootPulse record in this browser and returns you to the landing page.
                    This is your right to erasure.
                  </p>
                </div>
                <button type="button" className="btn-danger" onClick={() => setConfirmDelete(true)}>
                  <IconTrash width={16} height={16} />
                  Delete all data
                </button>
              </div>
            </div>
          </Card>

          <Card title="Demo data" description="Fictional data used to explore BootPulse quickly.">
            {isDemo ? (
              <>
                <p className="text-sm text-neutral-700">
                  You are currently viewing <strong>Lumen Notes Ltd</strong>, a fictional demo business. Resetting
                  restores the original demo items, scenarios, milestones and decisions.
                </p>
                <button
                  type="button"
                  className="btn-ghost mt-3"
                  onClick={() => {
                    resetDemoData()
                    setResetDone(true)
                  }}
                >
                  Reset demo data
                </button>
                {resetDone ? (
                  <p className="mt-2 text-xs text-good" role="status">
                    Demo data restored to its original state.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-neutral-700">
                This profile does not use the demo business. You can open the fictional demo from the{' '}
                <Link className="link" to="/login">
                  log-in page
                </Link>{' '}
                at any time.
              </p>
            )}
          </Card>

          <Card title="Privacy" description="What BootPulse stores and where.">
            <p className="text-sm text-neutral-700">
              Phase 1 keeps everything in this browser&rsquo;s <code>localStorage</code>. There are no accounts, no
              cookies, no analytics and no tracking. Read the full{' '}
              <Link className="link" to="/privacy">
                privacy statement
              </Link>
              .
            </p>
            {profile?.privacyConsentAt ? (
              <p className="mt-2 text-xs text-neutral-500">
                Consent recorded on {new Date(profile.privacyConsentAt).toLocaleString()}.
              </p>
            ) : null}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete all data?"
        message={
          <>
            <p>
              This permanently deletes every profile, business, revenue item, cost, scenario, milestone and
              decision stored by BootPulse in this browser, then returns you to the landing page.
            </p>
            <p className="mt-2">
              Export a JSON copy first if you want to keep a record. This cannot be undone.
            </p>
          </>
        }
        confirmLabel="Delete everything"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDeleteAll}
      />
    </div>
  )
}