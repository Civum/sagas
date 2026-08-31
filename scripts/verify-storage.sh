#!/usr/bin/env bash
# Confirms object storage is up, reachable from your machine, and has a bucket.
# Makes the bucket if it is missing, so running this twice is safe.
#
# Only the content layer needs this. If you are not working on submission or
# media upload, skip it.
set -uo pipefail

CONTAINER=sagas-minio
BUCKET=sagas-media
API_PORT=9000

if ! command -v docker >/dev/null 2>&1; then
  echo "✗ docker is not installed or not on PATH."
  echo "  Install Docker Desktop, then run: pnpm storage:up"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "✗ the '$CONTAINER' container is not running."
  echo "  Run: pnpm storage:up"
  echo
  echo "  If it will not start at all, you are not stuck. See the fallbacks in"
  echo "  SETUP.md under 'When object storage will not run'."
  exit 1
fi

# Check the port is published to the host, not just open inside the container.
# A container can be perfectly healthy while nothing on your machine can reach
# it, and that failure looks identical to a broken service from the app side.
if [ -z "$(docker port "$CONTAINER" "$API_PORT" 2>/dev/null)" ]; then
  echo "✗ the container is running but port $API_PORT is not published to your machine."
  echo "  Something else may already be using it. Check with: lsof -i :$API_PORT"
  exit 1
fi

if ! (exec 3<>"/dev/tcp/127.0.0.1/$API_PORT") 2>/dev/null; then
  echo "✗ nothing is answering on localhost:$API_PORT."
  echo "  The container may still be starting. Wait ten seconds and try again."
  exit 1
fi

# Everything below runs inside the compose network, so you do not need an S3
# client installed on your machine.
run_mc() { docker compose --profile media run --rm -T mc "$1" 2>&1; }

# Bounded wait. An unbounded one turns "storage is broken" into "the terminal
# hangs forever", which is a worse thing to hand somebody on their first day.
if ! run_mc 'for i in $(seq 1 20); do mc ls local >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1' >/dev/null; then
  echo "✗ storage is running but did not accept a request within 20 seconds."
  echo "  Try: pnpm storage:reset && pnpm storage:up"
  exit 1
fi

if ! OUT=$(run_mc "mc mb --ignore-existing local/$BUCKET && mc ls local"); then
  echo "✗ could not create or list the bucket."
  echo "$OUT"
  exit 1
fi

echo "✓ object storage  running on localhost:$API_PORT"
echo "✓ bucket          $BUCKET"
echo "✓ file browser    http://localhost:9001  (sagas / sagas-dev-secret)"
echo
echo "  Add these to your .env:"
echo "  S3_ENDPOINT=\"http://localhost:$API_PORT\""
echo "  S3_REGION=\"us-east-1\""
echo "  S3_BUCKET=\"$BUCKET\""
echo "  S3_ACCESS_KEY_ID=\"sagas\""
echo "  S3_SECRET_ACCESS_KEY=\"sagas-dev-secret\""
echo "  S3_FORCE_PATH_STYLE=\"true\""
echo
echo "  These are local development credentials. They are in the repo on"
echo "  purpose and they protect nothing. Never reuse this pattern for a real"
echo "  bucket."
