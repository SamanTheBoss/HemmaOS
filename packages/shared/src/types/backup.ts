import type { z } from "zod";
import type {
  backupTargetTypeSchema,
  backupSourceSchema,
  backupScheduleSchema,
  backupLogEntrySchema,
  backupJobSchema,
  createBackupJobRequestSchema,
  createBackupJobResponseSchema,
  backupJobsResponseSchema,
  runBackupRequestSchema,
  runBackupResponseSchema,
  deleteBackupRequestSchema,
  deleteBackupResponseSchema,
  usbDeviceSchema,
  usbDevicesResponseSchema,
} from "../schemas/backup.js";

export type BackupTargetType = z.infer<typeof backupTargetTypeSchema>;
export type BackupSource = z.infer<typeof backupSourceSchema>;
export type BackupSchedule = z.infer<typeof backupScheduleSchema>;
export type BackupLogEntry = z.infer<typeof backupLogEntrySchema>;
export type BackupJob = z.infer<typeof backupJobSchema>;
export type CreateBackupJobRequest = z.infer<typeof createBackupJobRequestSchema>;
export type CreateBackupJobResponse = z.infer<typeof createBackupJobResponseSchema>;
export type BackupJobsResponse = z.infer<typeof backupJobsResponseSchema>;
export type RunBackupRequest = z.infer<typeof runBackupRequestSchema>;
export type RunBackupResponse = z.infer<typeof runBackupResponseSchema>;
export type DeleteBackupRequest = z.infer<typeof deleteBackupRequestSchema>;
export type DeleteBackupResponse = z.infer<typeof deleteBackupResponseSchema>;
export type UsbDevice = z.infer<typeof usbDeviceSchema>;
export type UsbDevicesResponse = z.infer<typeof usbDevicesResponseSchema>;
