import { z } from "zod";

export const backupTargetTypeSchema = z.enum([
  "local",
  "usb",
  "gdrive",
  "dropbox",
  "onedrive",
  "box",
  "pcloud",
]);

export const backupSourceSchema = z.enum([
  "all",
  "immich",
  "jellyfin",
  "vaultwarden",
  "audiobookshelf",
  "adguard",
]);

export const backupScheduleSchema = z.enum([
  "daily",
  "weekly",
  "monthly",
  "manual",
]);

export const backupJobSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetType: backupTargetTypeSchema,
  targetPath: z.string(),
  sources: z.array(backupSourceSchema),
  schedule: backupScheduleSchema,
  lastRun: z.string().nullable(),
  lastStatus: z.enum(["success", "failed", "running", "never"]),
  enabled: z.boolean(),
});

export const createBackupJobRequestSchema = z.object({
  name: z.string().min(1).max(100),
  targetType: backupTargetTypeSchema,
  targetPath: z.string().min(1),
  sources: z.array(backupSourceSchema).min(1),
  schedule: backupScheduleSchema,
  rcloneConfig: z
    .object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      token: z.string().optional(),
    })
    .optional(),
});

export const createBackupJobResponseSchema = z.object({
  success: z.boolean(),
  job: backupJobSchema,
});

export const backupJobsResponseSchema = z.object({
  jobs: z.array(backupJobSchema),
});

export const runBackupRequestSchema = z.object({
  jobId: z.string(),
});

export const runBackupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const deleteBackupRequestSchema = z.object({
  jobId: z.string(),
});

export const deleteBackupResponseSchema = z.object({
  success: z.boolean(),
});

export const usbDeviceSchema = z.object({
  name: z.string(),
  path: z.string(),
  size: z.string(),
  mounted: z.boolean(),
});

export const usbDevicesResponseSchema = z.object({
  devices: z.array(usbDeviceSchema),
});
