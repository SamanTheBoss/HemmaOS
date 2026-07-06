import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

vi.mock("../../../shared/lib/docker.js", () => ({
  docker: {
    getContainer: vi.fn().mockReturnValue({
      restart: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      start: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

import { installApp, controlApp } from "../apps.service.js";
import { shell } from "../../../shared/lib/shell.js";
import { writeFile } from "node:fs/promises";
import { docker } from "../../../shared/lib/docker.js";

const mockShell = vi.mocked(shell);
const mockWriteFile = vi.mocked(writeFile);
const mockDocker = vi.mocked(docker);

describe("apps.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("installApp", () => {
    it("writes env file and runs docker compose up", async () => {
      const result = await installApp({
        app: "immich",
        env: { ADMIN_PASS: "secret", USER: "admin" },
      });

      expect(mockWriteFile).toHaveBeenCalledWith(
        "/opt/hemmaos/apps/immich/.env",
        "ADMIN_PASS=secret\nUSER=admin",
        "utf-8",
      );

      expect(mockShell).toHaveBeenCalledWith(
        "docker compose -f /opt/hemmaos/apps/immich/docker-compose.yml up -d",
      );

      expect(result.success).toBe(true);
      expect(result.url).toContain("immich");
    });

    it("throws for unknown app", async () => {
      await expect(
        installApp({ app: "nonexistent" as any, env: {} }),
      ).rejects.toThrow("Unknown app");
    });
  });

  describe("controlApp", () => {
    it("restarts a container", async () => {
      const mockContainer = {
        restart: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn(),
        start: vi.fn(),
      };
      mockDocker.getContainer.mockReturnValue(mockContainer as any);

      const result = await controlApp({
        app: "immich",
        action: "restart",
      });

      expect(mockDocker.getContainer).toHaveBeenCalledWith("immich_server");
      expect(mockContainer.restart).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
