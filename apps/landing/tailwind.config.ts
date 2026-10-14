import * as path from 'node:path';
import type { Config } from 'tailwindcss';
import base from '@sagas/tailwind-config/web';

// The shared preset maps colour names (background, primary, muted…) to CSS
// variables, the same way apps/web uses it. The variable values live in
// src/tokens.css until the Design workstream's tokens (De1) exist.
export default {
  content: [path.join(import.meta.dirname, 'src/**/*.ts')],
  presets: [base],
} satisfies Config;
