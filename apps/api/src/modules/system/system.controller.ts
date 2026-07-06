import type { Request, Response, NextFunction } from "express";
import * as systemService from "./system.service.js";
import * as tailscaleService from "./tailscale.service.js";

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
