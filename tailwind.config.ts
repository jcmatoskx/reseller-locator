import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        evolt: {
          green:   '#F9A138',
          'green-dark': '#E07B0F',
          navy:    '#1A1A1A',
          'navy-light': '#2D2D2D',
          slate:   '#475569',
          muted:   '#94A3B8',
          border:  '#E2E8F0',
          surface: '#F8FAFC',
          white:   '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(26,26,26,0.06), 0 4px 16px rgba(26,26,26,0.08)',
        'card-hover': '0 4px 12px rgba(26,26,26,0.10), 0 16px 40px rgba(26,26,26,0.12)',
        panel:   '0 0 0 1px rgba(26,26,26,0.06), 0 8px 32px rgba(26,26,26,0.10)',
        green:   '0 0 0 3px rgba(249,161,56,0.20)',
      },
    },
  },
  plugins: [],
}

export default config
