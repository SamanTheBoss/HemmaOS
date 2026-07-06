import { z } from "zod";

export const diskInfoSchema = z.object({
  total: z.string(),
  used: z.string(),
  percent: z.number(),
});

export const ramInfoSchema = z.object({
  percent: z.number(),
});

export const backupInfoSchema = z.object({
  last_success: z.string(),
  status: z.enum(["OK", "FAILED", "UNKNOWN"]),
});

export const systemStatusResponseSchema = z.object({
  status: z.enum(["HEALTHY", "DEGRADED", "UNHEALTHY"]),
  disk: diskInfoSchema,
  ram: ramInfoSchema,
  backup: backupInfoSchema,
});

export const rebootResponseSchema = z.object({
  success: z.boolean(),
});
