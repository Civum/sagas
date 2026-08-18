import type { Config } from 'tailwindcss';
import base from '@sagas/tailwind-config/web';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [base],
} satisfies Config;
