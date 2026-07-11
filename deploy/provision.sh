#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# Provision a HemmaOS box for someone else (e.g. a friend's Ubuntu machine).
#
# Run this ONCE, on the box, after cloning the repo to /opt/hemmaos. It:
#   1. Pins the box to the latest RELEASE tag (never tracks raw `main`).
#   2. Installs Tailscale on the HOST and joins your SUPPORT tailnet, then
#      immediately brings it DOWN — remote support is OFF by default and only
#      comes up when the family taps "Enable remote support" in the UI.
#   3. Installs YOUR SSH public key (from a USB stick, never from the repo) so
#      you can SSH in over the tailnet once support is enabled.
#   4. Runs the normal install.sh.
#
# Nothing here opens a port to the public internet. You reach the box only over
# the encrypted Tailscale IP (100.x), and only while support is toggled on.
#
# Usage:
#   sudo TS_SUPPORT_KEY=tskey-auth-xxxx \
#        PUBKEY_PATH=/media/usb/id_ed25519.pub \
#        bash deploy/provision.sh
#
# Env:
#   TS_SUPPORT_KEY  (required) reusable, tagged auth key from your SEPARATE
#                   support tailnet — NOT your personal one. Create it at
#                   login.tailscale.com > Settings > Keys, tag:support.
#   PUBKEY_PATH     (optional) path to your SSH public key on the USB stick.
#   SSH_USER        (optional) local user to authorise the key for. Default:
#                   the invoking sudo user, else the first /home user.
# ===========================================================================

REPO_DIR="/opt/hemmaos"
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"

echo "=== HemmaOS provisioning ==="

# --- 0. Sanity ------------------------------------------------------------
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ $REPO_DIR is not a git checkout. Clone the repo there first:" >&2
  echo "   sudo git clone https://github.com/SamanTheBoss/HemmaOS.git $REPO_DIR" >&2
  exit 1
fi
if [ -z "${TS_SUPPORT_KEY:-}" ]; then
  echo "❌ TS_SUPPORT_KEY is required (tagged auth key from your support tailnet)." >&2
  exit 1
fi

# --- 1. Pin to the latest release tag -------------------------------------
echo "--- Pinning to latest release ---"
cd "$REPO_DIR"
$SUDO git fetch --tags --force --prune origin
latest="$($SUDO git tag -l 'v*' | sort -V | tail -n1)"
if [ -n "$latest" ]; then
  echo "Checking out $latest"
  $SUDO git checkout -f "$latest"
else
  echo "⚠️  No release tags yet — staying on the current checkout."
  echo "    Cut one from your dev machine with: bash deploy/release.sh minor"
fi

# --- 2. Tailscale on the host (support tunnel, OFF by default) -------------
echo "--- Installing Tailscale (host) ---"
if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | $SUDO sh
fi

echo "Joining support tailnet (will be brought down immediately)..."
# --ssh: lets you SSH over the tailnet. tag:support scopes it via your ACLs.
# We authenticate now (so no interactive login is ever needed on this box),
# then take it straight down — the UI toggle is the only thing that brings it up.
$SUDO tailscale up --ssh --advertise-tags=tag:support \
  --authkey="$TS_SUPPORT_KEY" --hostname="hemmaos-$(hostname)" || \
  echo "⚠️  tailscale up failed — check the auth key/tag."
$SUDO tailscale down || true
echo "Remote support: configured and OFF by default."

# --- 3. Install your SSH public key (from USB, not the repo) --------------
if [ -n "${PUBKEY_PATH:-}" ] && [ -f "$PUBKEY_PATH" ]; then
  SSH_USER="${SSH_USER:-${SUDO_USER:-}}"
  if [ -z "$SSH_USER" ]; then
    SSH_USER="$(find /home -maxdepth 1 -mindepth 1 -type d -printf '%f\n' 2>/dev/null | head -1)"
  fi
  if [ -n "$SSH_USER" ]; then
    HOME_DIR="/home/$SSH_USER"
    echo "--- Authorising SSH key for $SSH_USER ---"
    $SUDO mkdir -p "$HOME_DIR/.ssh"
    # Append without duplicating if re-run.
    PUB="$(cat "$PUBKEY_PATH")"
    if ! $SUDO grep -qF "$PUB" "$HOME_DIR/.ssh/authorized_keys" 2>/dev/null; then
      echo "$PUB" | $SUDO tee -a "$HOME_DIR/.ssh/authorized_keys" >/dev/null
    fi
    $SUDO chmod 700 "$HOME_DIR/.ssh"
    $SUDO chmod 600 "$HOME_DIR/.ssh/authorized_keys"
    $SUDO chown -R "$SSH_USER:$SSH_USER" "$HOME_DIR/.ssh"
    echo "Key installed."
  else
    echo "⚠️  Could not determine a user to install the SSH key for; skipping."
  fi
else
  echo "ℹ️  No PUBKEY_PATH given — skipping SSH key install."
  echo "   (You can still use 'tailscale ssh' once support is enabled.)"
fi

# --- 3b. Persist the support key for the API container --------------------
# docker compose reads deploy/.env when bringing the stack up, so the api's
# TAILSCALE_SUPPORT_KEY (which gates the support toggle) survives reboots.
# deploy/.env is gitignored, so the key never lands in the repo.
ENV_FILE="$REPO_DIR/deploy/.env"
if ! $SUDO grep -q '^TAILSCALE_SUPPORT_KEY=' "$ENV_FILE" 2>/dev/null; then
  echo "TAILSCALE_SUPPORT_KEY=$TS_SUPPORT_KEY" | $SUDO tee -a "$ENV_FILE" >/dev/null
fi

# --- 4. Normal install ----------------------------------------------------
echo "--- Running install.sh ---"
$SUDO bash "$REPO_DIR/deploy/install.sh"

echo ""
echo "=== Provisioning complete ==="
echo "Box is pinned to: ${latest:-<current checkout>}"
echo "Remote support is OFF. When the family taps 'Enable remote support',"
echo "connect from your machine with:"
echo "   tailscale switch support   # your dedicated support tailnet"
echo "   tailscale ssh ${SSH_USER:-<user>}@hemmaos-$(hostname)"
