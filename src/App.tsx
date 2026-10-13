import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RequireProfile from './components/RequireProfile'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Revenue from './pages/Revenue'
import Expenses from './pages/Expenses'
import CashFlow from './pages/CashFlow'
import Scenarios from './pages/Scenarios'
import Milestones from './pages/Milestones'
import Decisions from './pages/Decisions'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

/** Every route from PRD 3.1. Logged-in pages share the sidebar layout and require a local profile. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pricing" element={<Pricing />} />

        <Route
          path="/dashboard"
          element={
            <RequireProfile>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/revenue"
          element={
            <RequireProfile>
              <AppLayout>
                <Revenue />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/expenses"
          element={
            <RequireProfile>
              <AppLayout>
                <Expenses />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/cash-flow"
          element={
            <RequireProfile>
              <AppLayout>
                <CashFlow />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/scenarios"
          element={
            <RequireProfile>
              <AppLayout>
                <Scenarios />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/milestones"
          element={
            <RequireProfile>
              <AppLayout>
                <Milestones />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/decisions"
          element={
            <RequireProfile>
              <AppLayout>
                <Decisions />
              </AppLayout>
            </RequireProfile>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireProfile>
              <AppLayout>
                <Settings />
              </AppLayout>
            </RequireProfile>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}