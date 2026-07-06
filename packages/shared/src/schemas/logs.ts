import { z } from "zod";

export const logContainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(["running", "exited", "paused", "restarting", "dead"]),
});

export const logContainersResponseSchema = z.object({
  containers: z.array(logContainerSchema),
});

export const logQuerySchema = z.object({
  tail: z.coerce.number().int().min(1).max(5000).default(100),
});
