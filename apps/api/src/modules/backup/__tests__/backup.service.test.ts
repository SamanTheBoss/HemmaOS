import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../shared/lib/shell.js", () => ({
  shell: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

import { getJobs, createJob, deleteJob } from "../backup.service.js";
import { readFile, writeFile } from "node:fs/promises";
import { shell } from "../../../shared/lib/shell.js";

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockShell = vi.mocked(shell);

describe("backup.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getJobs", () => {
    it("returns empty array when no jobs file exists", async () => {
      mockReadFile.mockRejectedValue(new Error("ENOENT"));
      const jobs = await getJobs();
      expect(jobs).toEqual([]);
    });

    it("returns parsed jobs from file", async () => {
      const mockJobs = [
        {
          id: "test-id",
          name: "Test Backup",
          targetType: "local",
          targetPath: "/mnt/backup",
          sources: ["all"],
          schedule: "daily",
          lastRun: null,
          lastStatus: "never",
          enabled: true,
        },
      ];
      mockReadFile.mockResolvedValue(JSON.stringify(mockJobs));
      const jobs = await getJobs();
      expect(jobs).toEqual(mockJobs);
    });
  });

  describe("createJob", () => {
    it("creates a new backup job and installs cron", async () => {
      mockReadFile.mockRejectedValue(new Error("ENOENT"));

      const job = await createJob({
        name: "Daglig backup",
        targetType: "local",
        targetPath: "/mnt/usb",
        sources: ["immich"],
        schedule: "daily",
      });

      expect(job.name).toBe("Daglig backup");
      expect(job.targetType).toBe("local");
      expect(job.enabled).toBe(true);
      expect(job.lastStatus).toBe("never");
      expect(mockWriteFile).toHaveBeenCalled();
      expect(mockShell).toHaveBeenCalled();
    });

    it("skips cron for manual schedule", async () => {
      mockReadFile.mockRejectedValue(new Error("ENOENT"));

      await createJob({
        name: "Manuell backup",
        targetType: "local",
        targetPath: "/mnt/usb",
        sources: ["all"],
        schedule: "manual",
      });

      expect(mockShell).not.toHaveBeenCalled();
    });
  });

  describe("deleteJob", () => {
    it("throws when job not found", async () => {
      mockReadFile.mockResolvedValue("[]");
      await expect(deleteJob("nonexistent")).rejects.toThrow(
        "Backup job not found",
      );
    });

    it("removes job and its cron entry", async () => {
      const jobs = [
        {
          id: "job-1",
          name: "Test",
          targetType: "local",
          targetPath: "/mnt",
          sources: ["all"],
          schedule: "daily",
          lastRun: null,
          lastStatus: "never",
          enabled: true,
        },
      ];
      mockReadFile.mockResolvedValue(JSON.stringify(jobs));

      await deleteJob("job-1");

      expect(mockShell).toHaveBeenCalled();
      const savedData = (mockWriteFile as any).mock.calls[0][1];
      expect(JSON.parse(savedData)).toEqual([]);
    });
  });
});
