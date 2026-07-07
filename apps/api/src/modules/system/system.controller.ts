import { spawn } from "node:child_process";
import type { Request, Response, NextFunction } from "express";
import * as systemService from "./system.service.js";
import * as tailscaleService from "./tailscale.service.js";
import * as updateService from "./update.service.js";

// Stream a gzip archive of the box's config (auth.json, .env, Caddyfile, app
// .env files) so the owner can restore a broken box onto a new one. Data volumes
// are intentionally NOT included — this is the small, precious config/keys set.
export function backupConfig(_req: Request, res: Response): void {
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "application/gzip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="hemmaos-backup-${date}.tar.gz"`,
  );
  const tar = spawn("tar", ["czf", "-", "-C", "/opt/hemmaos", "config"]);
  tar.stdout.pipe(res);
  tar.stderr.on("data", () => {
    /* ignore tar warnings */
  });
  tar.on("error", () => {
    if (!res.headersSent) res.status(500);
    res.end();
  });
}

export async function checkUpdate(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const info = await updateService.checkForUpdate();
    res.json({ data: info });
  } catch (err) {
    next(err);
  }
}

export async function applyUpdate(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await updateService.applyUpdate();
    res.json({ data: { started: true } });
  } catch (err) {
    next(err);
  }
}

export async function getStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = await systemService.getSystemStatus();
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function reboot(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await systemService.reboot();
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function getTailscaleStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = await tailscaleService.getStatus();
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
}

export async function startTailscaleAuth(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await tailscaleService.startAuth();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function stopTailscale(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await tailscaleService.stop();
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}
