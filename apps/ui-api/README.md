# apps/ui-api — the experience layer's read API

Yours. It ships nearly empty.

Serving the archive to a browser: places for the map, the article for one place,
search. Reads only. Nothing is submitted through here, because submission
belongs to the content layer.

## Why this is separate from apps/web

So that the people on your team who own the back end and the database own a
thing, rather than owning some files inside somebody else's app.

It also means this can be deployed and scaled apart from the front end, which
matters more than it sounds. Map queries are the expensive part of this layer,
and hosting a Next app is priced on very different terms from hosting a server.
Free tiers for the former are measured in CPU-hours and spatial queries eat them.

## The one thing not to do

Do not make `apps/web` fetch from this API in server components.

A server making an HTTP request to its own API to render a page adds a network
hop, a new failure mode, and latency, and buys nothing. Server components import
`@sagas/read-model` directly. This API exists for the browser, and for whatever
else consumes the archive later.

## Where the queries live

`packages/read-model`, shared with `apps/web`. One home for data access, imported
by both. Do not duplicate queries here.

Today those functions read fixture JSON off disk. Putting a real database behind
them is the first infrastructure job on this layer, and nothing that calls them
changes when you do.

Read `docs/GIS.md` before writing the map query. "Everything within 2km" is not
a subtraction problem, and a table scan on every pan will be the first thing that
makes the map feel slow.

## Where to start

```bash
pnpm db:up && pnpm db:verify
```

1. `packages/read-model/src/index.ts` — the seam, and the comments on what each
   function becomes with a database behind it.
2. `apps/web/README.md` — who calls this and how.
3. `docs/GIS.md` — spatial queries and the coordinate order that silently puts
   Boise in the Indian Ocean.

## Who owns what

This app is yours alone. `apps/capture-api` belongs to the content layer and
`apps/graph-api` to the intelligence layer. They are separate apps so that no
two teams edit the same files, and so each can be deployed on its own terms.

Your database is your own: a read model shaped for map queries and article pages.
`packages/db` is a different database, the authoritative store, and it belongs to
the intelligence layer. See `packages/db/README.md`.

## Making it a real app

It is a package with a placeholder in `src/index.ts` and no framework, because
picking one is your call. To turn it into a server:

1. Add whatever you are using to `dependencies`
2. Add a `dev` and a `start` script so `pnpm dev` picks it up
3. Add a `test` script so CI runs it
4. `pnpm install` from the repo root
