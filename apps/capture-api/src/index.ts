/**
 * One endpoint, end to end.
 *
 * This exists because the gap between "I can write a function" and "I can build
 * an app" is mostly not knowing how the pieces connect. So here is the whole
 * path, once, at its narrowest: a request arrives, the contract validates it, a
 * row is written, a response goes back. Everything else you build this semester
 * is this shape, widened.
 *
 *   pnpm --filter @sagas/capture-api migrate
 *   pnpm --filter @sagas/capture-api dev
 *
 * Then, from another terminal:
 *
 *   curl -X POST http://localhost:3001/records \
 *     -H 'content-type: application/json' \
 *     -d '{
 *       "id": "rec-100",
 *       "siteId": "site-001",
 *       "contributorId": "guest-abc",
 *       "text": "My great-grandmother cooked in the boarding house kitchen.",
 *       "language": "en",
 *       "submission": "submitted",
 *       "media": [],
 *       "createdAt": "2026-09-07T12:00:00Z"
 *     }'
 */
import express from 'express';
import { sourceRecord } from '@sagas/contracts';
import { pool } from './db';

const app = express();

// Without this, req.body is undefined and it is not obvious why.
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * Submit a record.
 *
 * Three steps, and they are the three steps in every endpoint you will write.
 *
 * 1. Validate against the contract. `safeParse` returns a result rather than
 *    throwing, so the failure path is ordinary code. Never trust a request body.
 * 2. Write it, using $1 $2 $3 placeholders. The values go to Postgres
 *    separately from the query text, so nothing a person typed is ever read as
 *    SQL. Do not build a query by joining strings, ever, even when it looks
 *    harmless. This is the one rule in this file that is not a preference.
 * 3. Return what was stored, with 201 because something was created.
 *
 * Note what this does not decide. The client is sending its own `id` and
 * `createdAt`, which a real system would probably generate here instead. That
 * is a genuine design question and it is yours.
 */
app.post('/records', async (req, res) => {
  const parsed = sourceRecord.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const record = parsed.data;

  const { rows } = await pool.query(
    `insert into records
       (id, site_id, contributor_id, note, "text", language, captured_at, submission, created_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      record.id,
      record.siteId,
      record.contributorId,
      record.note ?? null,
      record.text ?? null,
      record.language ?? null,
      record.capturedAt ?? null,
      record.submission,
      record.createdAt,
    ],
  );

  res.status(201).json(rows[0] ?? null);
});

/**
 * Anything a handler throws lands here.
 *
 * Express 5 forwards a rejected promise from an async handler to this
 * automatically. In Express 4 it did not, and a handler that threw would hang
 * the request forever with no error anywhere. That difference is most of why
 * this project is on 5.
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something failed on the server.' });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`capture-api listening on http://localhost:${port}`);
});
