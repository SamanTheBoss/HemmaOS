import type { Request, Response, NextFunction } from "express";
import * as appsService from "./apps.service.js";
import type { AppInstallRequest, AppControlRequest } from "./apps.types.js";
import type { AppName } from "./apps.types.js";
import { AppError } from "../../shared/middleware/error-handler.js";

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

export async function uninstall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { app } = req.body as { app?: AppName };
    if (!app) {
      throw new AppError(400, "Missing app", "MISSING_APP");
    }
    const result = await appsService.uninstallApp(app);
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
