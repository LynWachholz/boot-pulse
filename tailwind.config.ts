import type { Config } from 'tailwindcss'

/**
 * Design tokens (PRD 3.3): calm, trustworthy finance look.
 * White / neutral grey background, one accent colour (deep teal).
 * Contrast checked against WCAG 2.2 AA (PRD 7.1).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0f5c58', // deep teal — 7.3:1 on white
          dark: '#0a4340',
          light: '#e6f2f1',
          ring: '#0f5c58',
        },
        neutral: {
          25: '#fcfcfd',
          50: '#f7f8f8',
          100: '#eff0f1',
          200: '#e2e4e6',
          300: '#c8ccd0',
          400: '#9aa1a8',
          500: '#6b7278',
          600: '#4d5358',
          700: '#383d41',
          800: '#24282b',
          900: '#15181a',
        },
        danger: {
          DEFAULT: '#a1160f', // 7.1:1 on white
          light: '#fdecea',
        },
        warn: {
          DEFAULT: '#7a4b00', // 7.4:1 on white
          light: '#fff3e0',
        },
        good: {
          DEFAULT: '#14603a',
          light: '#e7f5ec',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      boxShadow: {
        card: '0 1px 2px rgba(21, 24, 26, 0.06), 0 1px 3px rgba(21, 24, 26, 0.04)',
        pop: '0 8px 24px rgba(21, 24, 26, 0.14)',
      },
    },
  },
  plugins: [],
} satisfies Config