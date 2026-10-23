/**
 * Every read the experience layer does goes through here.
 *
 * These functions read the experience read model from Postgres. The database
 * is loaded during module initialisation so the public, synchronous API stays
 * compatible with the existing server components and API callers.
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

import { Pool } from 'pg';
import type { GraphState, Site } from '@sagas/contracts';

/** The fixture snapshots that exist. Real data will not be labelled like this. */
export type FixtureStateId = 't0' | 't1' | 't2' | 't3';

export const FIXTURE_STATES: FixtureStateId[] = ['t0', 't1', 't2', 't3'];

interface ReadModelRow {
  slug: string;
  state_id: FixtureStateId;
  position: number;
  site: Site;
  graph_state: GraphState;
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://sagas:sagas@127.0.0.1:5435/sagas_read',
});

let rows;
try {
  rows = await pool.query<ReadModelRow>(
    `SELECT slug, state_id, position, site, graph_state
   FROM experience_read_model
   ORDER BY position, state_id`,
  );
} catch (error) {
  await pool.end();
  throw new Error(
    'Experience database not reachable. Run pnpm --filter @sagas/ui-api db:up then pnpm --filter @sagas/ui-api db:seed',
    { cause: error },
  );
}

await pool.end();

const statesBySlug = new Map<string, Map<FixtureStateId, ReadModelRow>>();
for (const row of rows.rows) {
  const states =
    statesBySlug.get(row.slug) ?? new Map<FixtureStateId, ReadModelRow>();
  states.set(row.state_id, row);
  statesBySlug.set(row.slug, states);
}

/**
 * Every place, for the map and for search.
 *
 * With a database this becomes a query with a bounding-box filter, so the map
 * fetches what is on screen rather than the whole country to draw one
 * neighbourhood. The bounding box is the argument this still does not take.
 *
 * Read `docs/GIS.md` before writing that query. "Everything within 2km" is not
 * a subtraction problem.
 */
export function listSites(stateId: FixtureStateId = 't3'): Site[] {
  return [...statesBySlug.values()]
    .map((states) => states.get(stateId)?.site)
    .filter((site): site is Site => site !== undefined);
}

/** The flagship site's slug, which is what a page falls back to with no slug. */
export const DEFAULT_SITE = 'corner-shop';

/**
 * Everything known about one place, as of one moment.
 *
 * With a database this becomes a join across places, records, claims and
 * contributions, then the scoring pass. Watch the query count. The obvious
 * version runs one query per claim and falls over at any real size.
 */
export function getSiteState(slug: string, stateId: FixtureStateId): GraphState {
  const row = statesBySlug.get(slug)?.get(stateId);
  if (!row) {
    const knownSlugs = [...statesBySlug.keys()].join(', ');
    throw new Error(
      `No site state for slug '${slug}' at '${stateId}'. Known slugs: ${knownSlugs}`,
    );
  }
  return row.graph_state;
}
