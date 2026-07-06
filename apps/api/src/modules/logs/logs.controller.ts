import type { Request, Response, NextFunction } from "express";
import * as logsService from "./logs.service.js";

export async function listContainers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const containers = await logsService.listContainers();
    res.json({ data: { containers } });
  } catch (err) {
    next(err);
  }
}

export async function getLogs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { container } = req.params;
    const tail = parseInt(req.query["tail"] as string) || 100;
    const logs = await logsService.getContainerLogs(container as string, tail);
    res.json({ data: { logs } });
  } catch (err) {
    next(err);
  }
}

export function streamLogs(
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { container } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write("data: connected\n\n");

  const cleanup = logsService.streamContainerLogs(
    container as string,
    (line) => {
      res.write(`data: ${JSON.stringify({ line })}\n\n`);
    },
    (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    },
  );

  req.on("close", () => {
    cleanup();
  });
}
