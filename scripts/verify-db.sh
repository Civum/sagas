#!/usr/bin/env bash
# Confirms a layer's database is up, reachable, and actually initialised.
# Exits non-zero with a specific message rather than a stack trace, because the
# first thing somebody hits on day one should tell them what to do next.
#
# Called by each layer's own db:verify script, which passes its container name,
# host port and database name:
#
#   bash ../../scripts/verify-db.sh sagas-content-db 5433 sagas_content
set -uo pipefail

CONTAINER="${1:?container name required}"
HOST_PORT="${2:?host port required}"
DBNAME="${3:?database name required}"

if ! command -v docker >/dev/null 2>&1; then
  echo "✗ docker is not installed or not on PATH."
  echo "  Install Docker Desktop, open it, then run db:up for your layer."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "✗ the '$CONTAINER' container is not running."
  echo "  Run db:up for your layer. If Docker Desktop is not open, open it first."
  exit 1
fi

# The container can be perfectly healthy while nothing on your machine can reach
# it, and from the app side that looks exactly like a broken database. Check the
# published port before claiming the connection string works.
if [ -z "$(docker port "$CONTAINER" 5432 2>/dev/null)" ]; then
  echo "✗ the container is running but its port is not published to your machine."
  echo "  Run db:reset then db:up for your layer."
  exit 1
fi

if ! (exec 3<>"/dev/tcp/127.0.0.1/$HOST_PORT") 2>/dev/null; then
  echo "✗ nothing is answering on localhost:$HOST_PORT."
  echo "  Either the database is still starting, or something else is holding"
  echo "  that port. Check with: lsof -i :$HOST_PORT"
  exit 1
fi

pg() { docker exec -i "$CONTAINER" psql -U sagas -d "$DBNAME" -tAc "$1" 2>/dev/null; }

if ! pg "select 1" >/dev/null; then
  echo "✗ container is running but Postgres is not accepting connections yet."
  echo "  It may still be starting. Wait ten seconds and try again."
  exit 1
fi

POSTGIS=$(pg "select postgis_version()")
INIT=$(pg "select 1 from scaffold_init limit 1")

if [ -z "$POSTGIS" ] || [ -z "$INIT" ]; then
  echo "✗ Postgres is up but the init script did not finish."
  echo "  PostGIS or the scaffold marker is missing. Run db:reset then db:up."
  exit 1
fi

echo "✓ Postgres      $(pg "show server_version")"
echo "✓ PostGIS       $POSTGIS"
echo "✓ database      $DBNAME"
echo
echo "  Put this in your .env:"
echo "  DATABASE_URL=\"postgresql://sagas:sagas@localhost:$HOST_PORT/$DBNAME\""
