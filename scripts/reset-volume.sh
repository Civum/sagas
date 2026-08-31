#!/usr/bin/env bash
# Throws away one service's data without touching the other's.
#
# `docker compose down -v` deletes every volume in the project, so resetting
# storage would take your database with it. This removes one container and one
# volume by name.
#
#   bash scripts/reset-volume.sh postgres
#   bash scripts/reset-volume.sh minio
set -euo pipefail

SERVICE="${1:-}"
case "$SERVICE" in
  postgres) VOLUME_MATCH="sagas-pgdata"; PROFILE=() ;;
  minio)    VOLUME_MATCH="sagas-minio";  PROFILE=(--profile media) ;;
  *)
    echo "Usage: bash scripts/reset-volume.sh [postgres|minio]"
    exit 1
    ;;
esac

echo "This deletes all $SERVICE data. The other service is left alone."

docker compose "${PROFILE[@]}" rm -sf "$SERVICE" >/dev/null 2>&1 || true

# The volume is named <project>_<volume>, and the project name comes from the
# directory, so match on the part we control rather than guessing the prefix.
VOLUMES=$(docker volume ls -q --filter "name=$VOLUME_MATCH" || true)
if [ -z "$VOLUMES" ]; then
  echo "✓ nothing to remove, $SERVICE had no volume"
  exit 0
fi

echo "$VOLUMES" | xargs -r docker volume rm >/dev/null
echo "✓ removed: $VOLUMES"
echo "  Start it again with: pnpm $( [ "$SERVICE" = minio ] && echo storage:up || echo db:up )"
