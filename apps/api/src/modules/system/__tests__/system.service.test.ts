import { describe, it, expect, vi } from "vitest";

// Disk now comes from statfs(), RAM from os.* — no more df/free shelling.
vi.mock("node:fs/promises", () => ({
  // 524288000 * 4096 bytes = 2000 GiB total; used = 145 GiB.
  statfs: vi.fn().mockResolvedValue({
    bsize: 4096,
    blocks: 524288000,
    bavail: 486277120,
  }),
  // No backup jobs file → backup summary is UNKNOWN.
  readFile: vi.fn().mockRejectedValue(new Error("no file")),
}));

vi.mock("node:os", () => ({
  default: { totalmem: () => 100, freemem: () => 66 },
  totalmem: () => 100,
  freemem: () => 66,
}));

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

import * as systemService from "../system.service.js";
import { shell } from "../../../shared/lib/shell.js";

const mockShell = vi.mocked(shell);

describe("system.service", () => {
  describe("getSystemStatus", () => {
    it("computes disk from statfs and ram from os", async () => {
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
      await systemService.reboot();

      expect(mockShell).toHaveBeenCalledWith(
        "docker run --rm --privileged --pid=host justincormack/nsenter1 /sbin/reboot",
      );
    });
  });
});
