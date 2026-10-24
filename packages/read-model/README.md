# packages/read-model — the experience layer's data access

Every read the experience layer does goes through here, and only two things
import it: `apps/web` calls it directly from server components, and
`apps/ui-api` exposes it over HTTP for the browser.

One home for data access means one place to change when the database arrives,
and no chance of the page and the API disagreeing about what a site is.

## What it is today

Two functions, `listSites` and `getSiteState`, read the experience read model
from Postgres: one table, `experience_read_model`, with one row per site per
fixture state (`t0` to `t3`). The table is created by
`apps/ui-api/docker/init/02-read-model.sql` on a new Docker volume, and by the
seed on any other database.

The rows are loaded once, when the server starts, and kept in memory. That keeps
the functions synchronous for their callers, and it has four consequences:

- **The server needs the database to start.** Without it, the page fails with
  the setup commands below.
- **After seeding, restart the server.** A running `pnpm dev:web` keeps the
  rows it loaded at start-up.
- **`next build` needs the database too,** because the home page is rendered
  during the build.
- **In a production build, a re-seed needs a rebuild and a restart.** The home
  page keeps the data it was built with until `next build` runs again, and the
  other pages and API routes keep the rows loaded when `next start` began.

## Running it locally

Once, after cloning or after this lands on `main`, with Docker Desktop running:

```sh
pnpm --filter @sagas/ui-api db:up      # Postgres + PostGIS on 127.0.0.1:5435
pnpm --filter @sagas/ui-api db:seed    # load the fixtures into the read model
pnpm dev:web                           # restart it if it was already running
```

Run `db:seed` again after every upstream contract sync, then restart
`dev:web`. The seed empties the table and reloads it inside one transaction, so
it is safe to run as often as you like and leaves exactly the current fixtures.

To seed another database, such as a hosted one, set `DATABASE_URL` for that run.

## What it becomes

A read model: your own schema, shaped for the two things this layer actually
does, which are drawing a map and rendering an article. That is not the same
shape as the authoritative store the intelligence layer keeps, and it should not
try to be.

Postgres went behind these functions first (story Da1), and nothing that calls
them had to change, which is the entire reason they are here rather than
scattered through components.

What is still to come: a schema shaped for the map and the article rather than
one row of JSON per state, spatial indexing so "everything within 2km of here"
is fast enough to drive a map, and deciding what is held in memory versus
fetched per request.

## Things that will bite

**Coordinate order.** `[longitude, latitude]`, which is GeoJSON's order and the
reverse of how everyone says it out loud. Getting Boise's pair backwards gives a
latitude of -116, which Mapbox rejects, but the error appears at the map rather
than where the pair was swapped. See `docs/GIS.md`.

**The bounding box.** `listSites()` returns every place in the fixtures, which
is a handful. With real data the map has to fetch what is on screen rather than
the whole country, and that filter is the argument this still does not take.

**Query count.** `getSiteState()` becomes a join across places, records, claims
and contributions, then a scoring pass. The obvious implementation runs one query
per claim and falls over at any real size.

## Who owns this

The experience layer, specifically whoever holds the back end and database roles
on that team. The intelligence layer owns a different database, and
`apps/graph-api/README.md` explains the split.
