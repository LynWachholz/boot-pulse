import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">This page does not exist</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The link may be out of date. Head back to the landing page or open your dashboard.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link className="btn-primary" to="/">
          Go to landing page
        </Link>
        <Link className="btn-ghost" to="/dashboard">
          Open dashboard
        </Link>
      </div>
    </div>
  )
}