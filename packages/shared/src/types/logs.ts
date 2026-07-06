import type { z } from "zod";
import type {
  logContainerSchema,
  logContainersResponseSchema,
  logQuerySchema,
} from "../schemas/logs.js";

export type LogContainer = z.infer<typeof logContainerSchema>;
export type LogContainersResponse = z.infer<typeof logContainersResponseSchema>;
export type LogQuery = z.infer<typeof logQuerySchema>;
