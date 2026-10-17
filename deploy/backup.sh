#!/usr/bin/env bash
# Manual database backup: full dump (restore with pg_restore) plus CSV exports.
# Usage: deploy/backup.sh            (run from anywhere; reads DIGNUM_DATABASE_URL from .env.local)
# Output: backups/<YYYY-MM-DD_HHMM>/{dignum.dump,subscribers.csv,downloads.csv}
# Requires pg_dump/psql (postgresql-client) at least as new as the database server.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${DIGNUM_DATABASE_URL:-}" ]]; then
  # Read only this one variable so other values in .env.local are never evaluated by the shell.
  line="$(grep -E '^DIGNUM_DATABASE_URL=' .env.local | tail -n 1 || true)"
  DIGNUM_DATABASE_URL="${line#DIGNUM_DATABASE_URL=}"
  DIGNUM_DATABASE_URL="${DIGNUM_DATABASE_URL%\"}"
  DIGNUM_DATABASE_URL="${DIGNUM_DATABASE_URL#\"}"
fi
if [[ -z "$DIGNUM_DATABASE_URL" ]]; then
  echo "DIGNUM_DATABASE_URL is not set (environment or .env.local)" >&2
  exit 1
fi

out="backups/$(date +%Y-%m-%d_%H%M)"
mkdir -p "$out"
chmod 700 backups "$out"

pg_dump --format=custom --no-owner --file="$out/dignum.dump" "$DIGNUM_DATABASE_URL"
for table in subscribers downloads; do
  psql "$DIGNUM_DATABASE_URL" --quiet --set=ON_ERROR_STOP=1 \
    -c "\\copy (select * from $table order by created_at) to '$out/$table.csv' with (format csv, header)"
done

echo "Backup written to $(pwd)/$out"
