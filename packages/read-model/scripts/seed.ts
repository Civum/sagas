import { loadIndex, loadSiteState } from '@sagas/fixtures/acceptance';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://sagas:sagas@127.0.0.1:5435/sagas_read',
});

const states = loadIndex().sites.flatMap((site, position) =>
  site.stateIds.map((stateId) => ({
    position,
    stateId,
    state: loadSiteState(site.key, stateId),
  })),
);

const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query(`
    CREATE TABLE IF NOT EXISTS experience_read_model (
      slug        text NOT NULL,
      state_id    text NOT NULL CHECK (state_id IN ('t0', 't1', 't2', 't3')),
      position    integer NOT NULL DEFAULT 0,
      site        jsonb NOT NULL,
      graph_state jsonb NOT NULL,
      PRIMARY KEY (slug, state_id)
    )
  `);
  await client.query(
    'ALTER TABLE experience_read_model ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0',
  );
  // Start from empty so sites or states removed from the fixtures disappear.
  await client.query('DELETE FROM experience_read_model');
  for (const { position, stateId, state } of states) {
    await client.query(
      `INSERT INTO experience_read_model (slug, state_id, position, site, graph_state)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
       ON CONFLICT (slug, state_id) DO UPDATE
       SET position = EXCLUDED.position,
           site = EXCLUDED.site,
           graph_state = EXCLUDED.graph_state`,
      [state.site.slug, stateId, position, state.site, state],
    );
  }
  await client.query('COMMIT');
  console.log(`Seeded ${states.length} experience read-model states.`);
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}
