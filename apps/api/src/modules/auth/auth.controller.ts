import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { currentAuth } from "../../shared/middleware/auth.js";
import type { Role } from "./auth.service.js";

export function me(_req: Request, res: Response): void {
  const auth = currentAuth(res);
  res.json({
    data: auth
      ? { name: auth.name, role: auth.role }
      : { name: null, role: null },
  });
}

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await authService.listUsers();
    res.json({ data: { users } });
  } catch (err) {
    next(err);
  }
}

export async function addUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, password, role } = req.body as {
      name: string;
      password: string;
      role: Role;
    };
    const result = await authService.addUser({
      name,
      password,
      role: role === "child" ? "child" : "parent",
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params["id"];
    await authService.deleteUser(typeof id === "string" ? id : "");
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

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
