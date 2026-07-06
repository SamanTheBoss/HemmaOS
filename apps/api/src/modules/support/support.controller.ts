import type { Request, Response, NextFunction } from "express";
import * as supportService from "./support.service.js";
import type { SupportToggleRequest } from "./support.types.js";

export function status(_req: Request, res: Response): void {
  res.json({ data: supportService.getSupportStatus() });
}

export async function toggle(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { enabled } = req.body as SupportToggleRequest;
    const result = await supportService.toggleSupport(enabled);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
