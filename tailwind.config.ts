import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        heading: ['Clash Display', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // ── Brand tokens (sourced from CSS vars in globals.css) ──
        // Use bg-brand, text-brand, etc. for the primary violet accent.
        // bg-surface / text-surface for dark sidebar backgrounds.
        brand: {
          DEFAULT: 'hsl(var(--brand-violet))',        // violet-600 #7C3AED
          light:   'hsl(var(--brand-violet-light))',  // violet-400 #A78BFA
          muted:   'hsl(var(--brand-violet-muted))',  // violet-50  #EDE9FE
          dark:    'hsl(var(--brand-dark))',           // #0A0A10 sidebar
          'dark-light': 'hsl(var(--brand-dark-light))', // #12111E dark card
        },
        // Legacy aliases kept so existing bg-navy / text-pink classes still resolve
        navy: {
          DEFAULT: 'hsl(var(--brand-dark))',
          light:   'hsl(var(--brand-dark-light))',
        },
        pink: {
          DEFAULT: 'hsl(var(--brand-violet))',
          light:   'hsl(var(--brand-violet-light))',
          muted:   'hsl(var(--brand-violet-muted))',
        },
        // Semantic
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: '#DBEAFE',
        },
        // shadcn/ui tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(124, 58, 237, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(124, 58, 237, 0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
