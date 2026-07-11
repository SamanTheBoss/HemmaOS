#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# On-box self-update. Triggered by the dashboard's "Apply update" button
# (system.controller → update.service.applyUpdate), which runs this via a
# privileged host helper so it survives the api/web containers being rebuilt.
#
# Boxes track RELEASE TAGS, not `main`. This checks out the newest `vX.Y.Z`
# tag — so a half-finished commit on main can never reach a customer's box.
# The matching GitHub Release is what "Check for updates" reads to decide
# whether a newer version exists (see deploy/release.sh for cutting one).
# ===========================================================================

REPO_DIR="/opt/hemmaos"
cd "$REPO_DIR"

echo "=== HemmaOS self-update ==="
git fetch --tags --force --prune origin

# Newest semver release tag (e.g. v0.2.0). sort -V handles 0.9 < 0.10 correctly.
latest="$(git tag -l 'v*' | sort -V | tail -n1)"
if [ -z "$latest" ]; then
  echo "No release tags found — staying on the current version."
  exit 0
fi

current="$(git describe --tags --exact-match 2>/dev/null || echo none)"
if [ "$current" = "$latest" ]; then
  echo "Already on $latest — nothing to do."
  exit 0
fi

echo "Updating $current -> $latest"
# Detached checkout of the release tag. -f discards any local drift on the box.
git checkout -f "$latest"

echo "Rebuilding stack..."
docker compose -f deploy/docker-compose.yml up -d --build

echo "=== Update to $latest complete ==="
