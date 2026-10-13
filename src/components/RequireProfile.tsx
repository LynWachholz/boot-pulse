import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

/**
 * Task 3.4 — logged-in pages require a local profile.
 * There is no real authentication in Phase 1 (PRD 2.3); this guard simply keeps the local
 * workspace from rendering without an active profile/business.
 */
export default function RequireProfile({ children }: { children: ReactNode }) {
  const activeProfileId = useStore((state) => state.activeProfileId)
  const activeBusinessId = useStore((state) => state.activeBusinessId)
  const location = useLocation()

  if (!activeProfileId || !activeBusinessId) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}