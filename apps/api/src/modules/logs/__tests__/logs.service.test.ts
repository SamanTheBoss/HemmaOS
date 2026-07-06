import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../shared/lib/docker.js", () => ({
  docker: {
    listContainers: vi.fn(),
    getContainer: vi.fn(),
  },
}));

import { listContainers, getContainerLogs } from "../logs.service.js";
import { docker } from "../../../shared/lib/docker.js";

const mockDocker = vi.mocked(docker);

describe("logs.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listContainers", () => {
    it("returns formatted container list", async () => {
      mockDocker.listContainers.mockResolvedValue([
        {
          Id: "abc123def456ghi789",
          Names: ["/immich_server"],
          State: "running",
        },
        {
          Id: "xyz987uvw654rst321",
          Names: ["/jellyfin"],
          State: "exited",
        },
      ] as any);

      const result = await listContainers();

      expect(result).toEqual([
        { id: "abc123def456", name: "immich_server", state: "running" },
        { id: "xyz987uvw654", name: "jellyfin", state: "exited" },
      ]);
    });
  });

  describe("getContainerLogs", () => {
    it("fetches logs from a container", async () => {
      const mockContainer = {
        logs: vi.fn().mockResolvedValue(Buffer.from("log line 1\nlog line 2")),
      };
      mockDocker.getContainer.mockReturnValue(mockContainer as any);

      const result = await getContainerLogs("immich_server", 100);

      expect(mockDocker.getContainer).toHaveBeenCalledWith("immich_server");
      expect(mockContainer.logs).toHaveBeenCalledWith({
        stdout: true,
        stderr: true,
        tail: 100,
        timestamps: true,
      });
      expect(result).toContain("log line 1");
    });
  });
});
