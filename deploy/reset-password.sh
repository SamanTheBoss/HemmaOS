#!/usr/bin/env bash
set -euo pipefail

# ===========================================================================
# HemmaOS password reset
#
# There is intentionally NO password-recovery button in the UI — anyone on the
# home network could press it. Instead, resetting requires host access (SSH or
# physical), which is the same trust boundary as the rest of "privacy first".
#
# This removes the stored credential so the box shows the first-run setup
# wizard again, where a new password is chosen. No data is touched.
#
#   sudo bash reset-password.sh
# ===========================================================================

CONFIG_DIR="${HEMMAOS_DIR:-/opt/hemmaos}/config"
AUTH_FILE="$CONFIG_DIR/auth.json"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

if [ -f "$AUTH_FILE" ]; then
  $SUDO rm -f "$AUTH_FILE"
  echo "Password reset."
  echo "Reload the dashboard — the setup wizard will appear so you can choose a new password."
else
  echo "No credential found at $AUTH_FILE."
  echo "Setup hasn't been completed yet — just open the dashboard to set a password."
fi
