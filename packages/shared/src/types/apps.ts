import type { z } from "zod";
import type {
  appNameSchema,
  appInstallRequestSchema,
  appInstallResponseSchema,
  appControlActionSchema,
  appControlRequestSchema,
  appControlResponseSchema,
} from "../schemas/apps.js";

export type AppName = z.infer<typeof appNameSchema>;
export type AppInstallRequest = z.infer<typeof appInstallRequestSchema>;
export type AppInstallResponse = z.infer<typeof appInstallResponseSchema>;
export type AppControlAction = z.infer<typeof appControlActionSchema>;
export type AppControlRequest = z.infer<typeof appControlRequestSchema>;
export type AppControlResponse = z.infer<typeof appControlResponseSchema>;
