import type { Request, Response, NextFunction } from "express";
import type { ApiErrorResponse } from "@home-os/shared";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      error: { message: err.message, code: err.code },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error("Unhandled error:", err);

  const body: ApiErrorResponse = {
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  };
  res.status(500).json(body);
}
