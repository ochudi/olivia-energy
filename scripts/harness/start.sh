#!/usr/bin/env bash
# Runs the site without Docker: Homebrew Postgres 18 with stand-in auth and
# storage schemas, PostgREST, and a small proxy that speaks enough of the
# Supabase API (REST, password auth, public storage) for the site and the
# admin. For QA when the real stack is unavailable; not a substitute for it.
#
#   brew install postgresql@18 postgrest
#   scripts/harness/start.sh            # then npm run dev / npm run build && npm run start
#   scripts/harness/start.sh stop
#
# .env.local's defaults (http://127.0.0.1:54321 and the sb_* keys) work as-is.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
STATE="${HARNESS_DIR:-$ROOT/.harness}"
PG="${PG_BIN:-/opt/homebrew/opt/postgresql@18/bin}"
psql() { "$PG/psql" -v ON_ERROR_STOP=1 -q -h 127.0.0.1 -p 54322 -U postgres -d postgres "$@"; }

if [ "${1:-}" = "stop" ]; then
  pkill -f "$HERE/proxy.mjs" 2>/dev/null || true
  pkill -f "postgrest $HERE/postgrest.conf" 2>/dev/null || true
  "$PG/pg_ctl" -D "$STATE/pg" stop -m fast >/dev/null 2>&1 || true
  echo "harness stopped"; exit 0
fi

mkdir -p "$STATE/media"
if [ ! -d "$STATE/pg" ]; then
  "$PG/initdb" -D "$STATE/pg" -U postgres --auth=trust -E UTF8 --locale=C >"$STATE/initdb.log" 2>&1
  "$PG/pg_ctl" -D "$STATE/pg" -l "$STATE/pg.log" -o "-p 54322 -c unix_socket_directories='' -c listen_addresses=127.0.0.1" start >/dev/null
  sleep 2
  psql -f "$HERE/shim.sql"
  for m in "$ROOT"/supabase/migrations/*.sql; do psql -f "$m"; done
  psql -f "$ROOT/supabase/seed.sql"
  for s in "$ROOT"/supabase/seeds/*.sql; do psql -f "$s"; done
  psql -f "$HERE/harness-functions.sql"
  echo "database created and seeded"
else
  "$PG/pg_ctl" -D "$STATE/pg" -l "$STATE/pg.log" -o "-p 54322 -c unix_socket_directories='' -c listen_addresses=127.0.0.1" start >/dev/null 2>&1 || true
  sleep 1
fi
nohup /opt/homebrew/bin/postgrest "$HERE/postgrest.conf" >"$STATE/postgrest.log" 2>&1 &
sleep 2
MEDIA_DIR="$STATE/media" nohup node "$HERE/proxy.mjs" >"$STATE/proxy.log" 2>&1 &
sleep 1
curl -sf "http://127.0.0.1:54321/rest/v1/settings?select=key&limit=1" -H "apikey: harness" >/dev/null && echo "harness ready on http://127.0.0.1:54321 (Postgres 54322, PostgREST 3010)"
