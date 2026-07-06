// Schemas
export {
  diskInfoSchema,
  ramInfoSchema,
  backupInfoSchema,
  systemStatusResponseSchema,
  rebootResponseSchema,
} from "./schemas/system.js";

export {
  appNameSchema,
  appInstallRequestSchema,
  appInstallResponseSchema,
  appControlActionSchema,
  appControlRequestSchema,
  appControlResponseSchema,
} from "./schemas/apps.js";

export {
  supportToggleRequestSchema,
  supportToggleResponseSchema,
} from "./schemas/support.js";

export {
  logContainerSchema,
  logContainersResponseSchema,
  logQuerySchema,
} from "./schemas/logs.js";

export {
  backupTargetTypeSchema,
  backupSourceSchema,
  backupScheduleSchema,
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
} from "./schemas/backup.js";

// Types
export type {
  DiskInfo,
  RamInfo,
  BackupInfo,
  SystemStatusResponse,
  RebootResponse,
} from "./types/system.js";

export type {
  AppName,
  AppInstallRequest,
  AppInstallResponse,
  AppControlAction,
  AppControlRequest,
  AppControlResponse,
} from "./types/apps.js";

export type {
  SupportToggleRequest,
  SupportToggleResponse,
} from "./types/support.js";

export type {
  LogContainer,
  LogContainersResponse,
  LogQuery,
} from "./types/logs.js";

export type {
  BackupTargetType,
  BackupSource,
  BackupSchedule,
  BackupJob,
  CreateBackupJobRequest,
  CreateBackupJobResponse,
  BackupJobsResponse,
  RunBackupRequest,
  RunBackupResponse,
  DeleteBackupRequest,
  DeleteBackupResponse,
  UsbDevice,
  UsbDevicesResponse,
} from "./types/backup.js";

export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from "./types/common.js";
