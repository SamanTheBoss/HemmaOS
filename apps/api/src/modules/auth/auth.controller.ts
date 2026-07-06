import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

export async function check(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const info = await authService.getSetupInfo();
    res.json({ data: info });
  } catch (err) {
    next(err);
  }
}

export async function setup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { password, systemName, locale, timezone } = req.body as {
      password: string;
      systemName: string;
      locale: string;
      timezone: string;
    };
    const result = await authService.setup({
      password,
      systemName,
      locale,
      timezone,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { password } = req.body as { password: string };
    const result = await authService.login(password);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authService.updateSettings(req.body);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}
