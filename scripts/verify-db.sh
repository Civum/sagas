#!/usr/bin/env bash
# Confirms the local database is up, reachable, and actually initialised.
# Exits non-zero with a specific message rather than a stack trace, because the
# first thing a student hits on day one should tell them what to do next.
set -uo pipefail

CONTAINER=sagas-postgres

if ! command -v docker >/dev/null 2>&1; then
  echo "✗ docker is not installed or not on PATH."
  echo "  Install Docker Desktop, then run: pnpm db:up"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "✗ the '$CONTAINER' container is not running."
  echo "  Run: pnpm db:up"
  exit 1
fi

pg() { docker exec -i "$CONTAINER" psql -U sagas -d sagas -tAc "$1" 2>/dev/null; }

if ! pg "select 1" >/dev/null; then
  echo "✗ container is running but Postgres is not accepting connections yet."
  echo "  It may still be starting. Wait ten seconds and try again."
  exit 1
fi

PGVER=$(pg "show server_version")
POSTGIS=$(pg "select postgis_version()")
INIT=$(pg "select note from scaffold_init limit 1")

if [ -z "$POSTGIS" ]; then
  echo "✗ Postgres is up but PostGIS is not available."
  echo "  The init script may not have run. Try: pnpm db:reset && pnpm db:up"
  exit 1
fi

echo "✓ Postgres      $PGVER"
echo "✓ PostGIS       $POSTGIS"
echo "✓ init          $INIT"
echo
echo "  Connection string for your .env:"
echo "  DATABASE_URL=\"postgresql://sagas:sagas@localhost:5433/sagas\""
