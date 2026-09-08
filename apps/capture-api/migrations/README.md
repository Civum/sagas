# Migrations

Numbered SQL files, applied in filename order by `scripts/migrate.ts`.

There are none yet. The first table is yours to design, and the columns come
from `sourceRecord` in `packages/contracts/src/model.ts`.

```
001_records.sql
002_media.sql
...
```

The runner applies each file once, inside a transaction, and records what it
applied in a `_migrations` table. Running it twice is safe. Running it on a
fresh database gives you the same schema as everyone else, which is the whole
point of a migration.

```bash
pnpm migrate
```
