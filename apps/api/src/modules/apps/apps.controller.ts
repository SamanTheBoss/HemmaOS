import type { Request, Response, NextFunction } from "express";
import * as appsService from "./apps.service.js";
import type { AppInstallRequest, AppControlRequest } from "./apps.types.js";

export async function install(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await appsService.installApp(req.body as AppInstallRequest);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function control(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await appsService.controlApp(req.body as AppControlRequest);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function list(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const apps = await appsService.listApps();
    res.json({ data: { apps } });
  } catch (err) {
    next(err);
  }
}
