import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type {
  Business,
  Cents,
  Currency,
  Decision,
  ExpenseItem,
  Milestone,
  Month,
  PlanId,
  Profile,
  RevenueItem,
  Scenario,
} from '../types'
import type { Adjustment } from '../types'
import { uid } from '../lib/id'
import { currentMonth } from '../lib/months'
import { createSeedData, DEMO_PROFILE_NAME } from '../data/seed'

/**
 * Task 2.10 — the single application store.
 * Everything is kept in the user's own browser (localStorage); every storage call is wrapped
 * in try/catch so private-mode browsers degrade to in-memory state instead of crashing.
 */

const STORAGE_KEY = 'bootpulse:v1'

const memoryFallback = new Map<string, string>()

/** localStorage with a graceful in-memory fallback (and no exceptions escaping to React). */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const value = window.localStorage.getItem(name)
      return value ?? memoryFallback.get(name) ?? null
    } catch {
      return memoryFallback.get(name) ?? null
    }
  },
  setItem: (name, value) => {
    memoryFallback.set(name, value)
    try {
      window.localStorage.setItem(name, value)
    } catch {
      /* storage unavailable — keep the in-memory copy */
    }
  },
  removeItem: (name) => {
    memoryFallback.delete(name)
    try {
      window.localStorage.removeItem(name)
    } catch {
      /* storage unavailable */
    }
  },
}

export interface SignUpInput {
  name: string
  businessName: string
  currency: Currency
  openingCash: Cents
  startMonth?: Month
}

export interface ExportBundle {
  exportedAt: string
  app: 'BootPulse'
  version: 1
  plan: PlanId
  activeProfileId: string | null
  activeBusinessId: string | null
  profiles: Profile[]
  businesses: Business[]
  revenue: RevenueItem[]
  expenses: ExpenseItem[]
  scenarios: Scenario[]
  milestones: Milestone[]
  decisions: Decision[]
}

export interface StoreState {
  profiles: Profile[]
  businesses: Business[]
  revenue: RevenueItem[]
  expenses: ExpenseItem[]
  scenarios: Scenario[]
  milestones: Milestone[]
  decisions: Decision[]
  activeProfileId: string | null
  activeBusinessId: string | null
  plan: PlanId
  demoBusinessId: string | null

  /* Profiles & businesses */
  signUp: (input: SignUpInput) => { profileId: string; businessId: string }
  setActiveProfile: (profileId: string | null) => void
  logOut: () => void
  updateBusiness: (id: string, patch: Partial<Business>) => void
  setCurrency: (currency: Currency) => void

  /* Revenue */
  addRevenue: (item: Omit<RevenueItem, 'id' | 'businessId'>) => RevenueItem | null
  updateRevenue: (id: string, patch: Partial<RevenueItem>) => void
  deleteRevenue: (id: string) => void

  /* Expenses */
  addExpense: (item: Omit<ExpenseItem, 'id' | 'businessId'>) => ExpenseItem | null
  updateExpense: (id: string, patch: Partial<ExpenseItem>) => void
  deleteExpense: (id: string) => void

  /* Scenarios */
  addScenario: (name: string, kind?: Scenario['kind']) => Scenario | null
  updateScenario: (id: string, patch: Partial<Omit<Scenario, 'id' | 'businessId'>>) => void
  deleteScenario: (id: string) => void
  addAdjustment: (scenarioId: string, adjustment: Omit<Adjustment, 'id'>) => void
  updateAdjustment: (scenarioId: string, adjustmentId: string, patch: Partial<Adjustment>) => void
  deleteAdjustment: (scenarioId: string, adjustmentId: string) => void

  /* Milestones */
  addMilestone: (item: Omit<Milestone, 'id' | 'businessId'>) => void
  updateMilestone: (id: string, patch: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void

  /* Decisions */
  addDecision: (item: Omit<Decision, 'id' | 'businessId'>) => void
  updateDecision: (id: string, patch: Partial<Decision>) => void
  deleteDecision: (id: string) => void

  /* Demo data, export and erasure */
  loadDemoBusiness: () => string
  resetDemoData: () => void
  deleteAllData: () => void
  exportAll: () => ExportBundle

  /* Simulated plan (Phase 1 test mode only) */
  setPlan: (plan: PlanId) => void
}

function businessOf(state: StoreState): Business | null {
  return state.businesses.find((business) => business.id === state.activeBusinessId) ?? null
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profiles: [],
      businesses: [],
      revenue: [],
      expenses: [],
      scenarios: [],
      milestones: [],
      decisions: [],
      activeProfileId: null,
      activeBusinessId: null,
      plan: 'free',
      demoBusinessId: null,

      signUp: ({ name, businessName, currency, openingCash, startMonth }) => {
        const now = new Date()
        const profile: Profile = {
          id: uid(),
          name: name.trim(),
          createdAt: now.toISOString(),
          privacyConsentAt: now.toISOString(),
        }
        const business: Business = {
          id: uid(),
          profileId: profile.id,
          name: businessName.trim(),
          currency,
          openingCash,
          startMonth: startMonth ?? currentMonth(now),
        }
        set((state) => ({
          profiles: [...state.profiles, profile],
          businesses: [...state.businesses, business],
          activeProfileId: profile.id,
          activeBusinessId: business.id,
          plan: state.plan ?? 'free',
        }))
        return { profileId: profile.id, businessId: business.id }
      },

      setActiveProfile: (profileId) => {
        const profile = get().profiles.find((item) => item.id === profileId) ?? null
        const business = get().businesses.find((item) => item.profileId === profileId) ?? null
        set({
          activeProfileId: profile ? profile.id : null,
          activeBusinessId: business ? business.id : null,
        })
      },

      logOut: () => set({ activeProfileId: null, activeBusinessId: null }),

      updateBusiness: (id, patch) =>
        set((state) => ({
          businesses: state.businesses.map((business) =>
            business.id === id ? { ...business, ...patch } : business,
          ),
        })),

      setCurrency: (currency) => {
        const business = businessOf(get())
        if (!business) return
        get().updateBusiness(business.id, { currency })
      },

      addRevenue: (item) => {
        const business = businessOf(get())
        if (!business) return null
        const next: RevenueItem = { ...item, id: uid(), businessId: business.id }
        set((state) => ({ revenue: [...state.revenue, next] }))
        return next
      },

      updateRevenue: (id, patch) =>
        set((state) => ({
          revenue: state.revenue.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      deleteRevenue: (id) => set((state) => ({ revenue: state.revenue.filter((item) => item.id !== id) })),

      addExpense: (item) => {
        const business = businessOf(get())
        if (!business) return null
        const next: ExpenseItem = { ...item, id: uid(), businessId: business.id }
        set((state) => ({ expenses: [...state.expenses, next] }))
        return next
      },

      updateExpense: (id, patch) =>
        set((state) => ({
          expenses: state.expenses.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((item) => item.id !== id) })),

      addScenario: (name, kind = 'custom') => {
        const business = businessOf(get())
        if (!business) return null
        const scenario: Scenario = {
          id: uid(),
          businessId: business.id,
          name: name.trim() || 'New scenario',
          kind,
          adjustments: [],
        }
        set((state) => ({ scenarios: [...state.scenarios, scenario] }))
        return scenario
      },

      updateScenario: (id, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === id ? { ...scenario, ...patch } : scenario,
          ),
        })),

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
          decisions: state.decisions.map((decision) =>
            decision.scenarioId === id ? { ...decision, scenarioId: undefined } : decision,
          ),
        })),

      addAdjustment: (scenarioId, adjustment) =>
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === scenarioId
              ? { ...scenario, adjustments: [...scenario.adjustments, { ...adjustment, id: uid() }] }
              : scenario,
          ),
        })),

      updateAdjustment: (scenarioId, adjustmentId, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === scenarioId
              ? {
                  ...scenario,
                  adjustments: scenario.adjustments.map((adjustment) =>
                    adjustment.id === adjustmentId ? { ...adjustment, ...patch } : adjustment,
                  ),
                }
              : scenario,
          ),
        })),

      deleteAdjustment: (scenarioId, adjustmentId) =>
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === scenarioId
              ? {
                  ...scenario,
                  adjustments: scenario.adjustments.filter(
                    (adjustment) => adjustment.id !== adjustmentId,
                  ),
                }
              : scenario,
          ),
        })),

      addMilestone: (item) => {
        const business = businessOf(get())
        if (!business) return
        set((state) => ({ milestones: [...state.milestones, { ...item, id: uid(), businessId: business.id }] }))
      },

      updateMilestone: (id, patch) =>
        set((state) => ({
          milestones: state.milestones.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      deleteMilestone: (id) =>
        set((state) => ({ milestones: state.milestones.filter((item) => item.id !== id) })),

      addDecision: (item) => {
        const business = businessOf(get())
        if (!business) return
        set((state) => ({ decisions: [...state.decisions, { ...item, id: uid(), businessId: business.id }] }))
      },

      updateDecision: (id, patch) =>
        set((state) => ({
          decisions: state.decisions.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),

      deleteDecision: (id) =>
        set((state) => ({ decisions: state.decisions.filter((item) => item.id !== id) })),

      loadDemoBusiness: () => {
        const seed = createSeedData()
        const demoProfile: Profile = { ...seed.profile, name: DEMO_PROFILE_NAME }
        set((state) => ({
          profiles: [...state.profiles.filter((profile) => profile.id !== demoProfile.id), demoProfile],
          businesses: [...state.businesses, seed.business],
          revenue: [...state.revenue, ...seed.revenue],
          expenses: [...state.expenses, ...seed.expenses],
          scenarios: [...state.scenarios, ...seed.scenarios],
          milestones: [...state.milestones, ...seed.milestones],
          decisions: [...state.decisions, ...seed.decisions],
          activeProfileId: demoProfile.id,
          activeBusinessId: seed.business.id,
          demoBusinessId: seed.business.id,
        }))
        return seed.business.id
      },

      resetDemoData: () => {
        const { demoBusinessId, businesses, profiles } = get()
        if (!demoBusinessId) return
        const demoBusiness = businesses.find((business) => business.id === demoBusinessId)
        if (!demoBusiness) return
        const seed = createSeedData(demoBusiness.startMonth)
        const profile = profiles.find((item) => item.id === demoBusiness.profileId)

        set((state) => ({
          businesses: state.businesses.map((business) =>
            business.id === demoBusinessId ? { ...seed.business, id: demoBusinessId, profileId: business.profileId } : business,
          ),
          revenue: [
            ...state.revenue.filter((item) => item.businessId !== demoBusinessId),
            ...seed.revenue.map((item) => ({ ...item, businessId: demoBusinessId })),
          ],
          expenses: [
            ...state.expenses.filter((item) => item.businessId !== demoBusinessId),
            ...seed.expenses.map((item) => ({ ...item, businessId: demoBusinessId })),
          ],
          scenarios: [
            ...state.scenarios.filter((item) => item.businessId !== demoBusinessId),
            ...seed.scenarios.map((item) => ({ ...item, businessId: demoBusinessId })),
          ],
          milestones: [
            ...state.milestones.filter((item) => item.businessId !== demoBusinessId),
            ...seed.milestones.map((item) => ({ ...item, businessId: demoBusinessId })),
          ],
          decisions: [
            ...state.decisions.filter((item) => item.businessId !== demoBusinessId),
            ...seed.decisions.map((item) => ({ ...item, businessId: demoBusinessId })),
          ],
          profiles: profile
            ? state.profiles.map((item) =>
                item.id === profile.id ? { ...seed.profile, id: profile.id, name: profile.name } : item,
              )
            : state.profiles,
        }))
      },

      deleteAllData: () => {
        memoryFallback.clear()
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* storage unavailable */
        }
        set({
          profiles: [],
          businesses: [],
          revenue: [],
          expenses: [],
          scenarios: [],
          milestones: [],
          decisions: [],
          activeProfileId: null,
          activeBusinessId: null,
          plan: 'free',
          demoBusinessId: null,
        })
      },

      exportAll: () => {
        const state = get()
        return {
          exportedAt: new Date().toISOString(),
          app: 'BootPulse',
          version: 1,
          plan: state.plan,
          activeProfileId: state.activeProfileId,
          activeBusinessId: state.activeBusinessId,
          profiles: state.profiles,
          businesses: state.businesses,
          revenue: state.revenue,
          expenses: state.expenses,
          scenarios: state.scenarios,
          milestones: state.milestones,
          decisions: state.decisions,
        }
      },

      setPlan: (plan) => set({ plan }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)

/* ----------------------------- selectors ----------------------------- */

export function useActiveBusiness(): Business | null {
  return useStore((state) => state.businesses.find((b) => b.id === state.activeBusinessId) ?? null)
}

export function useActiveProfile(): Profile | null {
  return useStore((state) => state.profiles.find((p) => p.id === state.activeProfileId) ?? null)
}

/** All records belonging to the active business, ready for the finance engine. */
export function useBusinessData() {
  const businessId = useStore((state) => state.activeBusinessId)
  const revenue = useStore((state) => state.revenue)
  const expenses = useStore((state) => state.expenses)
  const scenarios = useStore((state) => state.scenarios)
  const milestones = useStore((state) => state.milestones)
  const decisions = useStore((state) => state.decisions)

  return {
    revenue: revenue.filter((item) => item.businessId === businessId),
    expenses: expenses.filter((item) => item.businessId === businessId),
    scenarios: scenarios.filter((item) => item.businessId === businessId),
    milestones: milestones.filter((item) => item.businessId === businessId),
    decisions: decisions.filter((item) => item.businessId === businessId),
  }
}