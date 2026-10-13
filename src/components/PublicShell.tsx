import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Public pages (landing, pricing, privacy) share this light header and the footer disclaimer. */
export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="shrink-0 text-lg font-bold tracking-tight text-accent">
            BootPulse
          </Link>
          <nav aria-label="Public navigation" className="flex items-center gap-1.5 sm:gap-2">
            <Link className="btn-ghost whitespace-nowrap px-3 py-1.5 text-sm" to="/pricing">
              Pricing
            </Link>
            <Link className="btn-ghost whitespace-nowrap px-3 py-1.5 text-sm" to="/login">
              Log in
            </Link>
            <Link className="btn-primary whitespace-nowrap px-3 py-1.5 text-sm" to="/signup">
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-neutral-500 sm:px-6">
          <p>BootPulse is a planning tool and does not provide financial advice.</p>
          <nav aria-label="Footer navigation" className="flex gap-4">
            <Link className="link" to="/privacy">
              Privacy
            </Link>
            <Link className="link" to="/pricing">
              Pricing
            </Link>
            <Link className="link" to="/login">
              Log in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
