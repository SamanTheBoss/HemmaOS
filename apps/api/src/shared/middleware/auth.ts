import type { Request, Response, NextFunction } from "express";
import { verifyToken, type AuthPayload } from "../../modules/auth/auth.service.js";

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

  // Prefer the Authorization header, but also accept ?token= for endpoints the
  // browser can't attach headers to — notably EventSource/SSE log streaming.
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const queryToken =
    typeof req.query["token"] === "string" ? req.query["token"] : undefined;
  const token = headerToken ?? queryToken;

  if (!token) {
    res.status(401).json({
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      error: { message: "Invalid token", code: "INVALID_TOKEN" },
    });
    return;
  }

  // Make the current user's role available to downstream handlers.
  res.locals["auth"] = payload;
  next();
}

// Gate mutating/destructive actions to parent accounts.
export function requireParent(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = res.locals["auth"] as AuthPayload | undefined;
  if (auth?.role !== "parent") {
    res.status(403).json({
      error: { message: "Parent role required", code: "FORBIDDEN" },
    });
    return;
  }
  next();
}

export function currentAuth(res: Response): AuthPayload | null {
  return (res.locals["auth"] as AuthPayload | undefined) ?? null;
}
