import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../modules/auth/auth.service.js";

const PUBLIC_PATHS = new Set([
  "/api/auth/check",
  "/api/auth/setup",
  "/api/auth/login",
]);

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Allow public routes
  if (PUBLIC_PATHS.has(req.path)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    });
    return;
  }

  const token = authHeader.slice(7);
  if (!verifyToken(token)) {
    res.status(401).json({
      error: { message: "Invalid token", code: "INVALID_TOKEN" },
    });
    return;
  }

  next();
}
