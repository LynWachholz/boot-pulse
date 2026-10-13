import type { SVGProps } from 'react'

/** Small inline icon set — stroke icons inherit `currentColor` so they meet contrast rules. */

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconDashboard = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M3 13h8V3H3zM13 21h8v-10h-8zM3 21h8v-6H3zM13 9h8V3h-8z" />
  </Base>
)

export const IconRevenue = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Base>
)

export const IconExpense = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Base>
)

export const IconCashFlow = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 15l3.5-4 3 2.5L20 7" />
  </Base>
)

export const IconScenarios = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M4 6h16M4 12h10M4 18h6" />
  </Base>
)

export const IconMilestones = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M6 3v18M6 4h11l-2 4 2 4H6" />
  </Base>
)

export const IconDecisions = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 11h8M8 15h5" />
  </Base>
)

export const IconSettings = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Base>
)

export const IconPricing = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M3 6h18v12H3z" />
    <path d="M3 10h18" />
  </Base>
)

export const IconWarning = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 3l9 16H3z" />
    <path d="M12 9v5M12 17h.01" />
  </Base>
)

export const IconCritical = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6M12 16.5h.01" />
  </Base>
)

export const IconInfo = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5h.01" />
  </Base>
)

export const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Base>
)

export const IconClose = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
)

export const IconPlus = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconSearch = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </Base>
)

export const IconDownload = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
  </Base>
)

export const IconTrash = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </Base>
)

export const IconEdit = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M14 6l4 4" />
  </Base>
)

export const IconLogout = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M15 4h4v16h-4" />
    <path d="M10 8l-4 4 4 4M6 12h9" />
  </Base>
)

export const IconMenu = (props: SVGProps<SVGSVGElement>) => (
  <Base {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
)