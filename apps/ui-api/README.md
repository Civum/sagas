# apps/ui-api — the experience layer's read API

This app is yours, and it ships nearly empty.

This app serves the archive to a browser: places for the map, the article for
one place, and search. It only reads. Nothing is submitted through here,
because submission belongs to the content layer.

## Why this is separate from apps/web

It is separate so that the people on your team who own the back end and the
database own a whole app, rather than some files inside somebody else's.

It also means this can be deployed and scaled apart from the front end. Map
queries are the expensive part of this layer, so check what the free tier of
whichever host you choose allows for server time.

## The one thing not to do

Do not make `apps/web` fetch from this API in server components.

A server making an HTTP request to its own API to render a page adds a network
round trip and a new way to fail, and gains nothing. Server components import
`@sagas/read-model` directly. This API exists for the browser, and for whatever
else consumes the archive later.

## Where the queries live

They live in `packages/read-model`, which `apps/web` imports too, so there is
one home for data access. Do not duplicate queries here.

Today those functions read fixture JSON off disk. Putting a real database behind
them is the first infrastructure job on this layer, and nothing that calls them
changes when you do.

Read `docs/GIS.md` before writing the map query. "Everything within 2km" is not
a subtraction problem, and a table scan on every pan will be the first thing that
makes the map feel slow.

## Where to start

```bash
cd apps/ui-api
pnpm db:up && pnpm db:verify
```

Your read model runs on port 5435 in a container defined by this app's own
`docker-compose.yml`. The other two layers have their own on 5433 and 5434.

1. `packages/read-model/src/index.ts` — the seam, and the comments on what each
   function becomes with a database behind it.
2. `apps/web/README.md` — who calls this and how.
3. `docs/GIS.md` — spatial queries, and the coordinate order that is easy to
   get backwards.

## Who owns what

This app is yours alone. `apps/capture-api` belongs to the content layer and
`apps/graph-api` to the intelligence layer. They are separate apps so that no
two teams edit the same files, and so each can be deployed on its own terms.

Your database is your own: a read model shaped for map queries and article pages.
The intelligence layer runs a different database, the authoritative store for
claims and the graph. See `apps/graph-api/README.md`.

## Making it a real app

It is a package with a placeholder in `src/index.ts` and no framework, because
picking one is your call. To turn it into a server:

1. Add whatever you are using to `dependencies`
2. Add a `dev` and a `start` script so `pnpm dev` picks it up
3. Add a `test` script so the automated checks run it
4. `pnpm install` from the repo root
