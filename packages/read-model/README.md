# packages/read-model — the experience layer's data access

Every read the experience layer does goes through here, and only two things
import it: `apps/web` calls it directly from server components, and
`apps/ui-api` exposes it over HTTP for the browser.

One home for data access means one place to change when the database arrives,
and no chance of the page and the API disagreeing about what a site is.

## What it is today

Three functions that read fixture JSON off disk. That is a starting point, not a
design.

## What it becomes

A read model: your own schema, shaped for the two things this layer actually
does, which are drawing a map and rendering an article. That is not the same
shape as the authoritative store in `packages/db`, and it should not try to be.

Putting Postgres behind these functions is the first infrastructure job on this
layer. Nothing that calls them changes when you do, which is the entire reason
they are here rather than scattered through components.

Do it early. If the whole interface is built against a file and the database
arrives in November, November is when you find out which components assumed data
was free to fetch.

## Things that will bite

**Coordinate order.** `[longitude, latitude]`, which is GeoJSON's order and the
reverse of how everyone says it out loud. Getting it backwards fails silently by
putting Boise in the Indian Ocean. See `docs/GIS.md`.

**The bounding box.** `listSites()` takes no arguments today because it returns
one place. With real data the map has to fetch what is on screen rather than the
whole country, and that filter is why the signature changes.

**Query count.** `getSiteState()` becomes a join across places, records, claims
and contributions, then a scoring pass. The obvious implementation runs one query
per claim and falls over at any real size.

## Who owns this

The experience layer, specifically whoever holds the back end and database roles
on that team. `packages/db` is a different database owned by the intelligence
layer, and `packages/db/README.md` explains the split.
