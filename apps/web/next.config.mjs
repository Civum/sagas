import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

const rootEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));

if (existsSync(rootEnvPath) && !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  const rootEnv = parseEnv(readFileSync(rootEnvPath, 'utf8'));
  if (rootEnv.NEXT_PUBLIC_MAPBOX_TOKEN) {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = rootEnv.NEXT_PUBLIC_MAPBOX_TOKEN;
  }
}

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source, not build output.
  transpilePackages: ['@sagas/contracts', '@sagas/fixtures', '@sagas/read-model'],
};
