import type { Config } from 'tailwindcss';
import base from '@sagas/tailwind-config/web';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [base],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        focus: 'rgb(var(--color-focus) / <alpha-value>)',
      },
      spacing: {
        page: 'var(--space-page)',
      },
    },
  },
} satisfies Config;
