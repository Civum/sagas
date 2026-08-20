-- Runs once, the first time the volume is created.
--
-- Enables the spatial extensions and nothing else. No tables, no seed data.
-- The schema is the intelligence layer's deliverable.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Useful for fuzzy matching on vernacular place names later. Cheap to enable
-- now, annoying to remember to add once migrations exist.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- A marker row so `pnpm db:verify` can prove init actually ran rather than
-- just proving the server accepts connections.
CREATE TABLE IF NOT EXISTS scaffold_init (
  id           integer PRIMARY KEY DEFAULT 1,
  initialised  timestamptz NOT NULL DEFAULT now(),
  note         text NOT NULL,
  CONSTRAINT scaffold_init_single_row CHECK (id = 1)
);

INSERT INTO scaffold_init (note)
VALUES ('Scaffold init ran. Extensions enabled. No application tables — those are yours.')
ON CONFLICT (id) DO NOTHING;
