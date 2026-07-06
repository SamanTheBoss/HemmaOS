import { describe, it, expect, vi } from "vitest";
import * as systemService from "../system.service.js";

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn(),
}));

import { shell } from "../../../shared/lib/shell.js";

const mockShell = vi.mocked(shell);

describe("system.service", () => {
  describe("getSystemStatus", () => {
    it("parses df and free output into structured status", async () => {
      mockShell.mockImplementation(async (cmd: string) => {
        if (cmd.includes("df")) {
          return {
            stdout: [
              "Filesystem     1K-blocks     Used Available Use% Mounted on",
              "/dev/sda1      2097152000 152043520 1945108480   8% /",
            ].join("\n"),
            stderr: "",
          };
        }
        return {
          stdout: [
            "              total        used        free      shared  buff/cache   available",
            "Mem:           7982        2713        1842         312        3426        4656",
          ].join("\n"),
          stderr: "",
        };
      });

      const result = await systemService.getSystemStatus();

      expect(result.status).toBe("HEALTHY");
      expect(result.disk.total).toBe("2000GB");
      expect(result.disk.used).toBe("145GB");
      expect(result.disk.percent).toBeGreaterThan(0);
      expect(result.ram.percent).toBe(34);
      expect(result.backup.status).toBe("UNKNOWN");
    });
  });

  describe("reboot", () => {
    it("calls shutdown command", async () => {
      mockShell.mockResolvedValue({ stdout: "", stderr: "" });

      await systemService.reboot();

      expect(mockShell).toHaveBeenCalledWith("sudo shutdown -r now");
    });
  });
});
