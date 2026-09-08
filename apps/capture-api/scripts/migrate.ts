/**
 * The migration runner. Deliberately small enough to read in one sitting.
 *
 *   pnpm --filter @sagas/capture-api migrate
 *
 * It applies every .sql file in ../migrations in filename order, once each, and
 * records what it applied in a table called _migrations. Running it twice is
 * safe. Running it on a fresh database gives you the same schema as everyone
 * else, which is the whole point of a migration.
 *
 * There are tools that do this. This is here instead so the mechanism is
 * visible rather than hidden behind a command, because you are going to be
 * writing migrations all semester and it is worth knowing what one is.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: new URL('../../../.env', import.meta.url).pathname });

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', 'migrations');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. From the repo root: cp .env.example .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`
    create table if not exists _migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const applied = new Set(
    (await pool.query<{ name: string }>('select name from _migrations')).rows.map((r) => r.name),
  );

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`already applied  ${file}`);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), 'utf8');

    // Each migration runs in its own transaction, so a file that fails halfway
    // leaves the database as it was rather than half changed.
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into _migrations (name) values ($1)', [file]);
      await client.query('commit');
      console.log(`applied          ${file}`);
    } catch (err) {
      await client.query('rollback');
      throw new Error(`${file} failed and was rolled back: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err.message);
    await pool.end();
    process.exit(1);
  });
