#!/usr/bin/env bash
set -uo pipefail

# ===========================================================================
# Migrate an existing hand-rolled home server into HemmaOS — SAFELY.
#
# Guarantees:
#   1. NEVER touches/deletes the source. Your old server stays as a fallback.
#   2. NEVER overwrites existing HemmaOS data (cp -an = no-clobber).
#   3. The database is migrated with pg_dump (a file copy across Postgres major
#      versions would break Immich — pg14 → pg16).
#
#   sudo bash migrate-from-hemmaserver.sh [/path/to/old/server]
#
# If no path is given it looks for a `hemmaserver` folder under /home/*.
# Copies media + app configs; dumps the Immich DB to a .sql for a clean restore.
# ===========================================================================

DEST="/opt/hemmaos/data"
LOG="/opt/hemmaos/config/migrate.log"

# --- Locate the source ---
SRC="${1:-}"
if [ -z "$SRC" ]; then
  SRC="$(find /home -maxdepth 2 -type d -name hemmaserver 2>/dev/null | head -1)"
fi
if [ -z "$SRC" ] || [ ! -d "$SRC" ]; then
  echo "❌ Old server folder not found. Pass it explicitly:"
  echo "   sudo bash migrate-from-hemmaserver.sh /home/saman/hemmaserver"
  exit 1
fi

echo "=== HemmaOS migration ===" | tee "$LOG"
echo "Source: $SRC" | tee -a "$LOG"
echo "Target: $DEST (existing files are kept, never overwritten)" | tee -a "$LOG"

# Copy src → dest without clobbering and without touching the source.
copy() {
  local from="$SRC/$1" to="$DEST/$2"
  if [ ! -e "$from" ]; then
    echo "  – skip (missing): $1" | tee -a "$LOG"
    return
  fi
  mkdir -p "$to"
  echo "  → $1  →  data/$2" | tee -a "$LOG"
  cp -an "$from/." "$to/" 2>>"$LOG" || echo "    (some files skipped)" | tee -a "$LOG"
}

echo "--- Media & files (safe) ---" | tee -a "$LOG"
copy "media/filmer"      "media/movies"
copy "media/serier"      "media/tv"
copy "media/audiobooks"  "media/audiobooks"
copy "media/podcasts"    "media/podcasts"
copy "downloads"         "media/downloads"

echo "--- App configs (safe) ---" | tee -a "$LOG"
copy "vaultwarden"       "vaultwarden"
copy "bocker/config"     "audiobookshelf/config"
copy "bocker/metadata"   "audiobookshelf/metadata"
copy "jellyfin/config"   "jellyfin/config"
copy "jellyfin/cache"    "jellyfin/cache"
copy "overseerr/config"  "overseerr/config"
copy "radarr/config"     "radarr/config"
copy "sonarr/config"     "sonarr/config"
copy "qbittorrent/config" "qbittorrent/config"
copy "homeassistant/config" "homeassistant/config"

echo "--- Immich photos (files, safe) ---" | tee -a "$LOG"
# Upload location comes from the old .env; default to ./immich-data if unset.
UPLOAD_SRC="$SRC/immich-data"
if [ -f "$SRC/.env" ]; then
  # shellcheck disable=SC1090
  UL="$(grep -E '^UPLOAD_LOCATION=' "$SRC/.env" | cut -d= -f2-)"
  [ -n "${UL:-}" ] && [ -d "$UL" ] && UPLOAD_SRC="$UL"
fi
if [ -d "$UPLOAD_SRC" ]; then
  mkdir -p "$DEST/immich/upload"
  echo "  → $UPLOAD_SRC  →  data/immich/upload" | tee -a "$LOG"
  cp -an "$UPLOAD_SRC/." "$DEST/immich/upload/" 2>>"$LOG" || true
fi

echo "--- Immich database (pg_dump, NOT a file copy) ---" | tee -a "$LOG"
if docker ps --format '{{.Names}}' | grep -q '^immich_postgres$' && [ -f "$SRC/.env" ]; then
  DBUSER="$(grep -E '^DB_USERNAME=' "$SRC/.env" | cut -d= -f2-)"
  DBPASS="$(grep -E '^DB_PASSWORD=' "$SRC/.env" | cut -d= -f2-)"
  DBNAME="$(grep -E '^DB_DATABASE_NAME=' "$SRC/.env" | cut -d= -f2-)"
  DUMP="$DEST/immich/immich-db-dump.sql"
  echo "  Dumping old Immich DB → $DUMP" | tee -a "$LOG"
  if docker exec -e PGPASSWORD="$DBPASS" immich_postgres \
      pg_dump -U "${DBUSER:-postgres}" "${DBNAME:-immich}" > "$DUMP" 2>>"$LOG"; then
    echo "  ✅ Dump saved. After HemmaOS Immich is running, restore with:" | tee -a "$LOG"
    echo "     cat $DUMP | docker exec -i immich_postgres psql -U postgres immich" | tee -a "$LOG"
  else
    echo "  ⚠️  Dump failed — photos still migrated; Immich will re-scan them." | tee -a "$LOG"
  fi
else
  echo "  (old immich_postgres not running — start the old stack first if you" | tee -a "$LOG"
  echo "   want albums/faces; otherwise Immich re-scans the copied photos.)" | tee -a "$LOG"
fi

# linuxserver apps run as UID/GID 1000 — make sure they can read their configs.
chown -R 1000:1000 "$DEST"/{radarr,sonarr,overseerr,qbittorrent} 2>/dev/null || true

echo "" | tee -a "$LOG"
echo "=== Migration copy done ===" | tee -a "$LOG"
echo "Your OLD server was NOT modified — it's still your fallback." | tee -a "$LOG"
echo "Next: install the matching apps in HemmaOS, then (if dumped) restore the DB." | tee -a "$LOG"
