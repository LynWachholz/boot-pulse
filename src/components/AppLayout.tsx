import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useActiveBusiness, useActiveProfile, useStore } from '../store/useStore'
import {
  IconCashFlow,
  IconDashboard,
  IconDecisions,
  IconExpense,
  IconLogout,
  IconMenu,
  IconMilestones,
  IconPricing,
  IconRevenue,
  IconScenarios,
  IconSettings,
  IconClose,
} from './icons'
import { Badge } from './ui'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/revenue', label: 'Revenue', icon: IconRevenue },
  { to: '/expenses', label: 'Expenses', icon: IconExpense },
  { to: '/cash-flow', label: 'Cash flow', icon: IconCashFlow },
  { to: '/scenarios', label: 'Scenarios', icon: IconScenarios },
  { to: '/milestones', label: 'Milestones', icon: IconMilestones },
  { to: '/decisions', label: 'Decisions', icon: IconDecisions },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const business = useActiveBusiness()
  const profile = useActiveProfile()
  const plan = useStore((state) => state.plan)
  const demoBusinessId = useStore((state) => state.demoBusinessId)
  const logOut = useStore((state) => state.logOut)
  const navigate = useNavigate()

  const isDemo = business?.id === demoBusinessId
  const planLabel = plan === 'free' ? 'Free plan' : plan === 'founder' ? 'Founder plan' : 'Adviser plan'

  const handleLogOut = () => {
    logOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-neutral-200 px-5 py-4">
          <NavLink to="/dashboard" className="text-lg font-bold tracking-tight text-accent">
            BootPulse
          </NavLink>
          <p className="mt-0.5 text-xs text-neutral-500">Runway &amp; scenario planning</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <NavItems />
        </nav>
        <div className="border-t border-neutral-200 px-3 py-3">
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-accent text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`
            }
          >
            <IconPricing />
            Plans &amp; pricing
          </NavLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="btn-ghost px-2 py-1 lg:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? <IconClose /> : <IconMenu />}
                <span className="sr-only">Toggle navigation</span>
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {business?.name ?? 'No business'}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {profile?.name ?? 'Not signed in'} · {business?.currency ?? 'USD'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDemo ? (
                <Badge tone="accent">
                  <span className="sm:hidden">Demo data</span>
                  <span className="hidden sm:inline">Fictional demo data</span>
                </Badge>
              ) : null}
              <span className="hidden sm:inline-flex">
                <Badge tone={plan === 'free' ? 'neutral' : 'good'}>{planLabel}</Badge>
              </span>
              <button
                type="button"
                className="btn-ghost whitespace-nowrap px-2 py-1.5 sm:px-4"
                onClick={handleLogOut}
                aria-label="Log out"
              >
                <IconLogout width={16} height={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>

          {menuOpen ? (
            <nav id="mobile-nav" className="border-t border-neutral-200 px-3 py-3 lg:hidden" aria-label="Main navigation">
              <NavItems onNavigate={() => setMenuOpen(false)} />
              <NavLink
                to="/pricing"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                <IconPricing />
                Plans &amp; pricing
              </NavLink>
            </nav>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

        <footer className="border-t border-neutral-200 px-4 py-4 text-xs text-neutral-500 lg:px-8">
          BootPulse is a planning tool and does not provide financial advice. Phase 1 stores all data in this
          browser only.
        </footer>
      </div>
    </div>
  )
}
