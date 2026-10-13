import { Link } from 'react-router-dom'
import PublicShell from '../components/PublicShell'

/** Task 5.13 — plain-language privacy statement (PRD 7.2). */

const SECTIONS = [
  {
    heading: 'What BootPulse collects',
    body: 'Only what you type in: your name, your business name, your opening cash balance, and the revenue and cost items, scenarios, milestones and decisions you add.',
  },
  {
    heading: 'Why it is collected',
    body: 'To calculate your cash flow, burn rate, runway and scenario comparisons, and to show them back to you. Nothing else. BootPulse does not sell data, profile you or run advertising.',
  },
  {
    heading: 'Where it is stored',
    body: 'In this browser only, using localStorage on this device. Phase 1 has no server, no database and no accounts, so your financial figures never leave your computer. There are no cookies, no analytics and no third-party trackers — which is why you do not see a cookie banner.',
  },
  {
    heading: 'How long it is kept',
    body: 'Until you delete it. Clearing your browser data will also remove it, because it lives only in local storage.',
  },
  {
    heading: 'Your right to erasure',
    body: 'Open Settings and choose “Delete all my data”. BootPulse permanently clears every record it holds in this browser and returns you to the landing page. You can also delete individual items at any time.',
  },
  {
    heading: 'Your right to data portability',
    body: 'Open Settings and choose “Export all data” to download a JSON file containing everything BootPulse stores for you.',
  },
  {
    heading: 'Consent',
    body: 'When you create a profile you tick a consent checkbox and BootPulse records the timestamp with your profile. You can withdraw consent at any time by deleting your data.',
  },
  {
    heading: 'Children, payments and sharing',
    body: 'BootPulse is not intended for children. Phase 1 takes no payments at all: the upgrade screen is clearly labelled “Test mode – no payment will be taken” and collects no card details. No data is shared with anyone.',
  },
  {
    heading: 'Not financial advice',
    body: 'BootPulse is a planning tool. It helps you see the consequences of your own assumptions; it does not provide financial advice.',
  },
]

export default function Privacy() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Privacy statement</h1>
        <p className="mt-2 text-sm text-neutral-700">
          Plain language, no legal padding. BootPulse handles sensitive financial information, so here is exactly
          what happens to it. This statement follows the spirit of the Hong Kong Personal Data (Privacy)
          Ordinance and the GDPR, including the right to erasure and the right to data portability.
        </p>

        <dl className="mt-8 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <dt className="text-base font-semibold text-neutral-900">{section.heading}</dt>
              <dd className="mt-1 text-sm text-neutral-700">{section.body}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
          <p>
            Manage your data in{' '}
            <Link className="link" to="/settings">
              Settings
            </Link>
            . Questions about this statement? Phase 1 is a course project prototype; if you are reviewing it, the
            person to ask is the project author listed in the README.
          </p>
        </div>
      </div>
    </PublicShell>
  )
}