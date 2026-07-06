import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

import { toggleSupport } from "../support.service.js";
import { shell } from "../../../shared/lib/shell.js";

const mockShell = vi.mocked(shell);

describe("support.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleSupport", () => {
    it("enables support via tailscale up", async () => {
      process.env["TAILSCALE_SUPPORT_KEY"] = "tskey-test-123";

      const result = await toggleSupport(true);

      expect(mockShell).toHaveBeenCalledWith(
        "tailscale up --ssh --advertise-tags=tag:support --authkey=tskey-test-123",
      );
      expect(result.support_active).toBe(true);

      delete process.env["TAILSCALE_SUPPORT_KEY"];
    });

    it("disables support via tailscale down", async () => {
      const result = await toggleSupport(false);

      expect(mockShell).toHaveBeenCalledWith("tailscale down");
      expect(result.support_active).toBe(false);
    });

    it("throws if support key is not configured when enabling", async () => {
      delete process.env["TAILSCALE_SUPPORT_KEY"];

      await expect(toggleSupport(true)).rejects.toThrow(
        "Support auth key not configured",
      );
    });
  });
});
