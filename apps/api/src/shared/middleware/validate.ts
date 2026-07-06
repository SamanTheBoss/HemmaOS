import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import type { ApiErrorResponse } from "@home-os/shared";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const body: ApiErrorResponse = {
          error: {
            message: err.errors.map((e) => e.message).join(", "),
            code: "VALIDATION_ERROR",
          },
        };
        res.status(400).json(body);
        return;
      }
      next(err);
    }
  };
}
