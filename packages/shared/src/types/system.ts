import type { z } from "zod";
import type {
  systemStatusResponseSchema,
  rebootResponseSchema,
  diskInfoSchema,
  ramInfoSchema,
  backupInfoSchema,
} from "../schemas/system.js";

export type DiskInfo = z.infer<typeof diskInfoSchema>;
export type RamInfo = z.infer<typeof ramInfoSchema>;
export type BackupInfo = z.infer<typeof backupInfoSchema>;
export type SystemStatusResponse = z.infer<typeof systemStatusResponseSchema>;
export type RebootResponse = z.infer<typeof rebootResponseSchema>;
