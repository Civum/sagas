/**
 * The content layer's server. Nothing here yet.
 *
 * Everything around it is ready. Express is installed, `db.ts` holds a
 * connection pool, `scripts/migrate.ts` applies migrations, and the contract in
 * `@sagas/contracts` describes the shapes. What is missing is the part that is
 * yours.
 *
 * The first one looks roughly like this, and every endpoint after it is the
 * same shape widened:
 *
 *   1. Validate the request body against the contract. `sourceRecord.safeParse`
 *      returns a result rather than throwing, so the failure path is ordinary
 *      code. Never trust a request body.
 *   2. Write it, using $1 $2 $3 placeholders. The values go to Postgres
 *      separately from the query text, so nothing a person typed is ever read
 *      as SQL. Do not build a query by joining strings, ever, even when it
 *      looks harmless. That is the one rule here that is not a preference.
 *   3. Return what was stored, with 201 because something was created.
 *
 * A record does not need a file attached. Somebody typing what their
 * grandmother told them is a complete contribution, and `sourceRecord` allows
 * media or text, so the first thing that works end to end involves no uploads
 * at all.
 *
 * You will also need a table to write into. That migration is yours, and
 * `migrations/` is where it goes.
 *
 * To run this once it exists:
 *
 *   pnpm migrate
 *   pnpm dev
 */

export {};
