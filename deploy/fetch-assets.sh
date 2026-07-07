#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Fetch app store screenshots into apps/web/public/app-assets/<id>/<n>.jpg
#
# The App Store detail pages show a screenshot gallery (like Umbrel). Fill in
# each project's OFFICIAL screenshot URLs below, then run from the repo root:
#
#   bash deploy/fetch-assets.sh
#
# Missing/empty entries are skipped — the UI gracefully falls back to a themed
# gradient placeholder, so it always looks intentional. App *icons* stay as the
# built-in themed gradient tiles (our brand), so only screenshots are fetched.
# ===========================================================================

cd "$(dirname "$0")/.."
DEST="apps/web/public/app-assets"

download() {
  local id="$1"
  shift
  local urls=("$@")
  if [ "${#urls[@]}" -eq 0 ]; then
    echo "skip $id (no URLs yet)"
    return
  fi
  mkdir -p "$DEST/$id"
  local n=1
  for u in "${urls[@]}"; do
    echo "  $id/$n.jpg <- $u"
    curl -fsSL "$u" -o "$DEST/$id/$n.jpg" || echo "    FAILED: $u"
    n=$((n + 1))
  done
}

# --- Fill in official screenshot URLs (3 each is ideal). Leave empty to skip. ---
download immich
download jellyfin
download audiobookshelf
download vaultwarden
download adguard
download wordpress

echo ""
echo "Done. Rebuild the web image to serve the new screenshots:"
echo "  docker compose -f deploy/docker-compose.yml build --no-cache web && docker compose -f deploy/docker-compose.yml up -d web"
