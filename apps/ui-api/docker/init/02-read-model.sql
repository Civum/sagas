-- The Experience layer's read model. The seed command also creates and
-- migrates this table for databases whose Docker volume already exists.

CREATE TABLE IF NOT EXISTS experience_read_model (
  slug        text NOT NULL,
  state_id    text NOT NULL,
  position    integer NOT NULL DEFAULT 0,
  site        jsonb NOT NULL,
  graph_state jsonb NOT NULL,
  PRIMARY KEY (slug, state_id)
);
