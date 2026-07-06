import type { z } from "zod";
import type {
  supportToggleRequestSchema,
  supportToggleResponseSchema,
} from "../schemas/support.js";

export type SupportToggleRequest = z.infer<typeof supportToggleRequestSchema>;
export type SupportToggleResponse = z.infer<typeof supportToggleResponseSchema>;
