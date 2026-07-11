#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Cut a new HemmaOS release — the "manual deploy".
#
#   bash deploy/release.sh patch     # 0.1.0 -> 0.1.1  (bugfixes)
#   bash deploy/release.sh minor     # 0.1.0 -> 0.2.0  (new features)
#   bash deploy/release.sh major     # 0.1.0 -> 1.0.0  (breaking)
#   bash deploy/release.sh 0.4.2     # explicit version
#
# What it does:
#   1. Bumps the repo-root VERSION file.
#   2. Commits + tags vX.Y.Z + pushes main and the tag.
#   3. Creates a GitHub Release with an auto-generated changelog.
#
# That GitHub Release is exactly what every box's "Check for updates" reads
# (update.service.checkForUpdate → GitHub API /releases/latest). Boxes only
# ever move when you cut a release here — never on a raw push to main.
#
# Requires: gh (GitHub CLI) logged in — `gh auth login`.
# ===========================================================================

cd "$(git rev-parse --show-toplevel)"

bump="${1:-}"
if [ -z "$bump" ]; then
  echo "Usage: bash deploy/release.sh <patch|minor|major|X.Y.Z>" >&2
  exit 1
fi

# --- Preconditions ---------------------------------------------------------
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI (gh) not found. Install it and run: gh auth login" >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ Not logged in to GitHub. Run: gh auth login" >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Working tree is dirty. Commit or stash first." >&2
  exit 1
fi
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "main" ]; then
  echo "❌ Releases are cut from main (you are on '$branch')." >&2
  exit 1
fi

# --- Compute the next version ----------------------------------------------
current="$(cat VERSION 2>/dev/null | tr -d '[:space:]')"
current="${current:-0.0.0}"
IFS='.' read -r MAJ MIN PAT <<<"$current"
MAJ="${MAJ:-0}"; MIN="${MIN:-0}"; PAT="${PAT:-0}"

case "$bump" in
  patch) next="$MAJ.$MIN.$((PAT + 1))" ;;
  minor) next="$MAJ.$((MIN + 1)).0" ;;
  major) next="$((MAJ + 1)).0.0" ;;
  [0-9]*.[0-9]*.[0-9]*) next="$bump" ;;
  *) echo "❌ Unknown bump '$bump' (use patch|minor|major|X.Y.Z)." >&2; exit 1 ;;
esac
tag="v$next"

if git rev-parse "$tag" >/dev/null 2>&1; then
  echo "❌ Tag $tag already exists." >&2
  exit 1
fi

echo "Releasing $current -> $next ($tag)"

# --- Changelog: commits since the previous tag -----------------------------
prev_tag="$(git tag -l 'v*' | sort -V | tail -n1)"
if [ -n "$prev_tag" ]; then
  range="$prev_tag..HEAD"
  echo "Changelog since $prev_tag:"
else
  range="HEAD"
  echo "Changelog (all history):"
fi
changelog="$(git log "$range" --no-merges --pretty=format:'- %s (%h)')"
[ -z "$changelog" ] && changelog="- Maintenance release."
echo "$changelog"
echo

# --- Bump, commit, tag, push ------------------------------------------------
echo "$next" > VERSION
git add VERSION
git commit -m "chore(release): $tag"
git tag -a "$tag" -m "HemmaOS $tag"
git push origin main
git push origin "$tag"

# --- GitHub Release (what boxes poll) --------------------------------------
gh release create "$tag" \
  --title "HemmaOS $tag" \
  --notes "$changelog"

echo
echo "✅ Released $tag."
echo "   Boxes will see it on their next 'Check for updates'."
