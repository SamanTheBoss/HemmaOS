import { z } from "zod";

export const supportToggleRequestSchema = z.object({
  enabled: z.boolean(),
});

export const supportToggleResponseSchema = z.object({
  support_active: z.boolean(),
});
