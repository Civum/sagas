import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { graphState } from '@sagas/contracts';
import type { GraphState } from '@sagas/contracts';

export * from './cases';

const here = dirname(fileURLToPath(import.meta.url));

/** The stem of the flagship site, which is what `loadState` reads by default. */
const FLAGSHIP = 'example-site';

interface StatesIndex {
  sites: { key: string; slug: string; name: string; stateIds: string[] }[];
}

/** What the last `pnpm build:states` produced. */
export function loadIndex(): StatesIndex {
  const raw = readFileSync(join(here, '..', 'states', 'index.json'), 'utf8');
  return JSON.parse(raw) as StatesIndex;
}

/**
 * Load one site's derived state and validate it against the contract.
 *
 * `siteKey` is the directory name under `fixtures/`, not the site's slug. The
 * two are usually the same and they are not required to be.
 */
export function loadSiteState(siteKey: string, stateId: string): GraphState {
  const raw = readFileSync(join(here, '..', 'states', `${siteKey}.${stateId}.json`), 'utf8');
  return graphState.parse(JSON.parse(raw));
}

/**
 * The flagship site at one moment.
 *
 * Kept because most of the acceptance criteria are about that site, and because
 * a caller that only wants the richest example should not have to name it.
 */
export function loadState(stateId: string): GraphState {
  return loadSiteState(FLAGSHIP, stateId);
}

/** The flagship's four snapshots, in order. */
export function loadAllStates(): GraphState[] {
  return ['t0', 't1', 't2', 't3'].map(loadState);
}

/** Every site at one moment. This is what the map reads. */
export function loadWorld(stateId: string): GraphState[] {
  return loadIndex()
    .sites.filter((s) => s.stateIds.includes(stateId))
    .map((s) => loadSiteState(s.key, stateId));
}
