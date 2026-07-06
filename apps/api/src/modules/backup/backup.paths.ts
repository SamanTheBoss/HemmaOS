import type { BackupSource } from "./backup.types.js";

export const BACKUP_SOURCE_PATHS: Record<BackupSource, string> = {
  all: "/opt/hemmaos/data",
  immich: "/opt/hemmaos/data/immich",
  jellyfin: "/opt/hemmaos/data/jellyfin",
  vaultwarden: "/opt/hemmaos/data/vaultwarden",
  audiobookshelf: "/opt/hemmaos/data/audiobookshelf",
  adguard: "/opt/hemmaos/data/adguard",
};

export const BACKUP_JOBS_FILE = "/opt/hemmaos/config/backup-jobs.json";
