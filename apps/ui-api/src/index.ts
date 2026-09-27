/**
 * The read API for the experience layer. Nothing here yet.
 *
 * What it is for: serving the archive to a browser. Places for the map, the
 * article for one place, search. Reads only. Nothing is submitted through here,
 * because submission belongs to the content layer.
 *
 * It is deliberately separate from `apps/web` so that the people on your team
 * who own the back end and the database own a thing, rather than owning some
 * files inside somebody else's app. It also means the API can be deployed and
 * scaled apart from the front end, which matters more than it sounds: map
 * queries are the expensive part and hosting a Next app is priced on very
 * different terms from hosting a server.
 *
 * The data access lives in `@sagas/read-model`, shared with `apps/web`. Do not
 * duplicate queries here.
 *
 * ONE THING NOT TO DO
 *
 * Do not make `apps/web` fetch from this API in server components. A server
 * making an HTTP request to its own API to render a page adds a network hop, a
 * failure mode, and latency, for nothing. Server components import
 * `@sagas/read-model` directly. This API is for the browser and for whatever
 * consumes the archive later.
 */

export {};
