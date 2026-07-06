import { docker } from "../../shared/lib/docker.js";
import { AppError } from "../../shared/middleware/error-handler.js";
import type { LogContainer } from "./logs.types.js";

export async function listContainers(): Promise<LogContainer[]> {
  const containers = await docker.listContainers({ all: true });
  return containers.map((c) => ({
    id: c.Id.slice(0, 12),
    name: c.Names[0]?.replace(/^\//, "") ?? c.Id.slice(0, 12),
    state: c.State as LogContainer["state"],
  }));
}

export async function getContainerLogs(
  containerName: string,
  tail: number,
): Promise<string> {
  const container = docker.getContainer(containerName);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  });
  return logs.toString("utf-8");
}

export function streamContainerLogs(
  containerName: string,
  onData: (line: string) => void,
  onError: (err: Error) => void,
): () => void {
  const container = docker.getContainer(containerName);
  let stream: NodeJS.ReadableStream | null = null;
  let aborted = false;

  container
    .logs({
      stdout: true,
      stderr: true,
      follow: true,
      tail: 50,
      timestamps: true,
    })
    .then((s) => {
      if (aborted) return;
      stream = s as unknown as NodeJS.ReadableStream;
      stream.on("data", (chunk: Buffer) => {
        const lines = chunk.toString("utf-8").split("\n").filter(Boolean);
        for (const line of lines) {
          onData(line);
        }
      });
      stream.on("error", onError);
    })
    .catch((err) => {
      if (!aborted) {
        onError(
          err instanceof Error
            ? err
            : new AppError(404, "Container not found", "CONTAINER_NOT_FOUND"),
        );
      }
    });

  return () => {
    aborted = true;
    if (stream) {
      stream.removeAllListeners();
      (stream as any).destroy?.();
    }
  };
}
