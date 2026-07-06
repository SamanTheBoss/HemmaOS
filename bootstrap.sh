#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# HemmaOS bootstrap — one-line installer
#
#   curl -fsSL https://raw.githubusercontent.com/SamanTheBoss/HemmaOS/main/bootstrap.sh | sudo bash
#
# Fetches HemmaOS to /opt/hemmaos and runs the installer (which ensures Docker
# is present, lays out the host directories and starts the stack). Safe to run
# again to update — it pulls the latest instead of re-cloning.
# ===========================================================================

REPO_URL="${HEMMAOS_REPO:-https://github.com/SamanTheBoss/HemmaOS.git}"
BRANCH="${HEMMAOS_BRANCH:-main}"
INSTALL_DIR="${HEMMAOS_DIR:-/opt/hemmaos}"

echo "=== HemmaOS bootstrap ==="

# Must be root (or via sudo) to write /opt and manage Docker.
if [ "$(id -u)" -ne 0 ]; then
  echo "FEL: kör som root, t.ex.  curl -fsSL <url> | sudo bash" >&2
  exit 1
fi

# Ensure git + curl are present (needed to fetch the repo).
if command -v apt-get >/dev/null 2>&1; then
  apt-get update -y || true
  apt-get install -y git curl ca-certificates || true
elif command -v dnf >/dev/null 2>&1; then
  dnf install -y git curl || true
fi

if ! command -v git >/dev/null 2>&1; then
  echo "FEL: git kunde inte installeras automatiskt. Installera git och kör om." >&2
  exit 1
fi

# Clone fresh, or update an existing install in place.
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Uppdaterar befintlig installation i $INSTALL_DIR ..."
  git -C "$INSTALL_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$INSTALL_DIR" reset --hard "origin/$BRANCH"
else
  echo "Hämtar HemmaOS till $INSTALL_DIR ..."
  rm -rf "$INSTALL_DIR"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi

# Hand off to the installer (Docker check, dirs, compose up).
echo "Kör installern ..."
bash "$INSTALL_DIR/deploy/install.sh"

# Print a friendly "open this" line with the box's LAN address.
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
IP="${IP:-<box-ip>}"

cat <<EOF

===========================================================================
 HemmaOS är igång.

   Öppna dashboarden:   http://$IP:3000

 Första gången slutför du uppsättningen (systemnamn + lösenord) i webbläsaren.
 Fjärrsupport är avstängd som standard — familjen öppnar den själv vid behov.
===========================================================================
EOF
