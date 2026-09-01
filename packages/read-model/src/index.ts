/**
 * Every read the experience layer does goes through here.
 *
 * Today these functions read fixture JSON off disk. That is a starting point,
 * not the design. Putting a real database behind them is the first
 * infrastructure job on this layer, and nothing that calls them changes when
 * you do, which is why they sit in one package.
 *
 * Two things import this and only two: `apps/web`, which calls it directly from
 * server components, and `apps/ui-api`, which exposes it over HTTP for the
 * browser. Server components should keep calling it directly. A server making a
 * network request to its own API to render a page is the classic mistake in this
 * shape.
 *
 * Rule: components take data as props. Pages and route handlers call these
 * functions and pass the result down. If you find yourself importing fixture
 * JSON inside a component, that is the mistake this package exists to prevent.
 */

import { loadAllStates, loadState } from '@sagas/fixtures/acceptance';
import type { GraphState, Site } from '@sagas/contracts';

/** The fixture snapshots that exist. Real data will not be labelled like this. */
export type FixtureStateId = 't0' | 't1' | 't2' | 't3';

export const FIXTURE_STATES: FixtureStateId[] = ['t0', 't1', 't2', 't3'];

/**
 * Every place, for the map and for search.
 *
 * With a database this becomes a query with a bounding-box filter, so the map
 * fetches what is on screen rather than the whole country to draw one
 * neighbourhood. That filter is why this eventually takes arguments.
 *
 * Read `docs/GIS.md` before writing that query. "Everything within 2km" is not
 * a subtraction problem.
 */
export function listSites(): Site[] {
  return loadAllStates()
    .slice(-1)
    .map((s) => s.site);
}

/**
 * Everything known about one place, as of one moment.
 *
 * With a database this becomes a join across places, records, claims and
 * contributions, then the scoring pass. Watch the query count. The obvious
 * version runs one query per claim and falls over at any real size.
 */
export function getSiteState(stateId: FixtureStateId): GraphState {
  return loadState(stateId);
}
