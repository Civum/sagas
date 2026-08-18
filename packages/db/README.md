# packages/db — reserved

Intended home for the PostgreSQL + PostGIS schema and migrations.

**Not built yet, deliberately** — same reason as `apps/api`. Designing the
persistence model is explicitly UofI's semester-one deliverable, not something
the scaffold should hand them pre-decided. The shapes in `@sagas/contracts` are
the constraint; how they are stored is the research.

If you are on the intelligence team and reading this: start here, and expect the
types in `@sagas/contracts` to be wrong in at least one interesting way. Tell us
which one.
