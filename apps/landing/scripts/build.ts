import * as path from 'node:path';

import { assertReleasable } from '../src/approval';
import { buildSite } from '../src/build';
import { content } from '../src/content';

// `pnpm --filter @sagas/landing build` writes the site to apps/landing/dist.
//
// `... build --release` is what the deploy uses. It refuses to build unless the
// copy is approved and unchanged since approval, so a draft can never be
// published even if the deploy switch is on.
if (process.argv.includes('--release')) assertReleasable(content);

const outDir = path.join(import.meta.dirname, '..', 'dist');
await buildSite(outDir);
console.log(`Landing page built in ${outDir}`);
