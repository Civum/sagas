import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { graphState } from '@sagas/contracts';
import type { GraphState } from '@sagas/contracts';

export * from './cases';

const here = dirname(fileURLToPath(import.meta.url));

/** Load a derived state and validate it against the contract before returning it. */
export function loadState(stateId: string): GraphState {
  const raw = readFileSync(join(here, '..', 'states', `example-site.${stateId}.json`), 'utf8');
  return graphState.parse(JSON.parse(raw));
}

export function loadAllStates(): GraphState[] {
  return ['t0', 't1', 't2', 't3'].map(loadState);
}
