import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Badge, EmptyState, TableWrap } from '../components/ui'
import { formatMoney } from '../lib/money'
import { formatMonthLabel } from '../lib/months'

/** Task 3.3 — choose an existing local profile, or open the seeded demo business. */

export default function Login() {
  const navigate = useNavigate()
  const profiles = useStore((state) => state.profiles)
  const businesses = useStore((state) => state.businesses)
  const setActiveProfile = useStore((state) => state.setActiveProfile)
  const loadDemoBusiness = useStore((state) => state.loadDemoBusiness)
  const demoBusinessId = useStore((state) => state.demoBusinessId)

  const openProfile = (profileId: string) => {
    setActiveProfile(profileId)
    navigate('/dashboard', { replace: true })
  }

  const openDemo = () => {
    if (!demoBusinessId) loadDemoBusiness()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Open your local profile</h1>
      <p className="mt-1 text-sm text-neutral-600">
        BootPulse Phase 1 keeps profiles in this browser only — there are no passwords and no server accounts.
      </p>

      <div className="card mt-6 px-5 py-6">
        <h2 className="text-base font-semibold text-neutral-900">Profiles on this device</h2>
        {profiles.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No local profiles yet"
              message="Create a profile in about a minute, or explore the pre-filled demo business first."
              action={
                <Link className="btn-primary" to="/signup">
                  Create a profile
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-3">
            <TableWrap label="Local profiles">
              <thead>
                <tr>
                  <th className="th">Profile</th>
                  <th className="th">Business</th>
                  <th className="th">Opening cash</th>
                  <th className="th">Starts</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const business = businesses.find((item) => item.profileId === profile.id)
                  return (
                    <tr key={profile.id}>
                      <td className="td font-medium text-neutral-900">
                        {profile.name}
                        {business?.id === demoBusinessId ? (
                          <span className="ml-2">
                            <Badge tone="accent">Demo</Badge>
                          </span>
                        ) : null}
                      </td>
                      <td className="td">{business?.name ?? '—'}</td>
                      <td className="td num">
                        {business ? formatMoney(business.openingCash, business.currency) : '—'}
                      </td>
                      <td className="td">{business ? formatMonthLabel(business.startMonth) : '—'}</td>
                      <td className="td text-right">
                        <button type="button" className="btn-primary" onClick={() => openProfile(profile.id)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </TableWrap>
          </div>
        )}
      </div>

      <div className="card mt-6 px-5 py-6">
        <h2 className="text-base font-semibold text-neutral-900">Or explore the demo business</h2>
        <p className="mt-1 text-sm text-neutral-600">
          &ldquo;Lumen Notes Ltd&rdquo; is a fictional two-person SaaS with 12 months of revenue, costs,
          scenarios, milestones and decisions already filled in. No real people, companies or financial data are
          used.
        </p>
        <button type="button" className="btn-primary mt-4" onClick={openDemo}>
          Open demo business
        </button>
      </div>

      <p className="mt-5 text-sm text-neutral-600">
        Need a fresh start?{' '}
        <Link className="link" to="/signup">
          Create a new profile
        </Link>
        .
      </p>
    </div>
  )
}