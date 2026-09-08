/**
 * The connection to Postgres.
 *
 * A Pool rather than a Client, and the difference matters. A Client is one
 * connection. If you use one for a web server, every request queues behind the
 * one before it, and the first time two people submit something at once you
 * find out. A Pool keeps a handful of connections open and hands you a free one
 * per query.
 *
 * `pool.query()` is safe to call from anywhere. You only need `pool.connect()`
 * when you want several statements to succeed or fail together, which is what
 * the migration runner does.
 */
import { config } from 'dotenv';
import { Pool } from 'pg';

// Node does not read a .env file on its own, so something has to load it. The
// file lives at the repository root rather than in this app, because one .env
// for the whole workspace is one thing to keep track of instead of three.
config({ path: new URL('../../../.env', import.meta.url).pathname });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set.\n' +
      '  From the repo root:  cp .env.example .env\n' +
      '  Then uncomment the sagas_content line in it.',
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
