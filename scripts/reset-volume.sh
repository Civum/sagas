#!/usr/bin/env bash
# Throws away one service's data without touching anything else.
#
# `docker compose down -v` deletes every volume in the project, so resetting
# object storage would take the database with it. This removes one container and
# one volume by name.
#
# Called by each layer's own db:reset script, from that layer's directory:
#
#   bash ../../scripts/reset-volume.sh postgres content-pgdata
set -euo pipefail

SERVICE="${1:?service name required}"
VOLUME_MATCH="${2:?volume name required}"

echo "This deletes all $SERVICE data for this layer. Nothing else is touched."

docker compose rm -sf "$SERVICE" >/dev/null 2>&1 || true

# The volume is named <project>_<volume>, and the project name comes from the
# directory, so match on the part we control rather than guessing the prefix.
VOLUMES=$(docker volume ls -q --filter "name=$VOLUME_MATCH" || true)
if [ -z "$VOLUMES" ]; then
  echo "✓ nothing to remove, $SERVICE had no volume"
  exit 0
fi

echo "$VOLUMES" | xargs -r docker volume rm >/dev/null
echo "✓ removed: $VOLUMES"
echo "  Start it again with db:up for your layer."
