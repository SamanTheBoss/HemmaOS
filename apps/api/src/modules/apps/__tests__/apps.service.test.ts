import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

// startInstall spawns `docker compose` in the background — stub the process.
vi.mock("node:child_process", () => ({
  spawn: vi.fn(() => ({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
  })),
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

import { startInstall, controlApp } from "../apps.service.js";
import { writeFile } from "node:fs/promises";
import { docker } from "../../../shared/lib/docker.js";

const mockWriteFile = vi.mocked(writeFile);
const mockDocker = vi.mocked(docker);

describe("apps.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startInstall", () => {
    it("writes the env file and starts the install", async () => {
      const result = await startInstall({
        app: "immich",
        env: { ADMIN_PASS: "secret", USER: "admin" },
      });

      expect(mockWriteFile).toHaveBeenCalledWith(
        "/opt/hemmaos/apps/immich/.env",
        "ADMIN_PASS=secret\nUSER=admin",
        "utf-8",
      );
      expect(result.started).toBe(true);
    });

    it("throws for unknown app", async () => {
      await expect(
        startInstall({ app: "nonexistent" as any, env: {} }),
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
