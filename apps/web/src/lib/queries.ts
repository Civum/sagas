/**
 * Every read the interface does goes through here.
 *
 * Today these functions read fixture JSON off disk. That is a starting point,
 * not the design. Your first infrastructure job is to seed the fixtures into a
 * local Postgres and make these functions query it instead. Nothing that calls
 * them changes when you do, which is why they sit behind one file.
 *
 * Do that early. If the whole interface is built against a file and the database
 * arrives in November, November is when you find out which components assumed
 * data was free to fetch.
 *
 * Rule: components take data as props. Pages and route handlers call these
 * functions and pass the result down. If you find yourself importing fixture
 * JSON inside a component, that's the mistake this file exists to prevent. It is
 * also what would stop the same component rendering against all four states on
 * /dev.
 */

import { loadAllStates, loadState } from '@sagas/fixtures/conformance';
import type { GraphState, Site } from '@sagas/contracts';

/** The fixture snapshots that exist. Real data won't be labelled like this. */
export type FixtureStateId = 't0' | 't1' | 't2' | 't3';

export const FIXTURE_STATES: FixtureStateId[] = ['t0', 't1', 't2', 't3'];

/**
 * Every place, for the map and for search.
 *
 * TODO(db): becomes `SELECT ... FROM sites`, with a bounding-box filter so the
 * map doesn't fetch the whole country to draw one neighbourhood. That filter is
 * the reason this takes arguments eventually.
 */
export function listSites(): Site[] {
  return loadAllStates()
    .slice(-1)
    .map((s) => s.site);
}

/**
 * Everything known about one place, as of one moment.
 *
 * TODO(db): becomes a join across places, records, claims, and contributions,
 * then the scoring pass. Watch the query count — the naive version does one
 * query per claim and falls over at any real size.
 */
export function getSiteState(stateId: FixtureStateId): GraphState {
  return loadState(stateId);
}
