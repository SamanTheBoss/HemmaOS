import { hostShell } from "../../shared/lib/shell.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import type { SupportToggleResponse } from "./support.types.js";

// Whether an operator has configured a support key at all. The UI uses this to
// hide the whole support control when it isn't set (no half-working toggle).
export function getSupportStatus(): { configured: boolean } {
  return { configured: !!process.env["TAILSCALE_SUPPORT_KEY"] };
}

export async function toggleSupport(
  enabled: boolean,
): Promise<SupportToggleResponse> {
  const supportKey = process.env["TAILSCALE_SUPPORT_KEY"];

  if (enabled) {
    if (!supportKey) {
      throw new AppError(
        400,
        "Support auth key not configured",
        "MISSING_SUPPORT_KEY",
      );
    }
    // Tailscale runs on the HOST (installed by provision.sh), so drive it via
    // the host helper. --ssh exposes SSH only over the encrypted tailnet — no
    // public port is ever opened. The tag scopes it to the support tailnet.
    await hostShell(
      `tailscale up --ssh --advertise-tags=tag:support --authkey=${supportKey}`,
    );
  } else {
    await hostShell("tailscale down");
  }

  return { support_active: enabled };
}
