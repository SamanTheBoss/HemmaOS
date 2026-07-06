import { shell } from "../../shared/lib/shell.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import type { SupportToggleResponse } from "./support.types.js";

export async function toggleSupport(
  enabled: boolean,
): Promise<SupportToggleResponse> {
  const supportKey = process.env["TAILSCALE_SUPPORT_KEY"];

  if (enabled) {
    if (!supportKey) {
      throw new AppError(
        500,
        "Support auth key not configured",
        "MISSING_SUPPORT_KEY",
      );
    }
    await shell(`sudo tailscale up --authkey=${supportKey}`);
  } else {
    await shell("sudo tailscale down");
  }

  return { support_active: enabled };
}
