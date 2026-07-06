import type { BackupSource } from "./backup.types.js";

export const BACKUP_SOURCE_PATHS: Record<BackupSource, string> = {
  all: "/opt/home-os/data",
  immich: "/opt/home-os/data/immich",
  jellyfin: "/opt/home-os/data/jellyfin",
  vaultwarden: "/opt/home-os/data/vaultwarden",
  audiobookshelf: "/opt/home-os/data/audiobookshelf",
  adguard: "/opt/home-os/data/adguard",
};

export const BACKUP_JOBS_FILE = "/opt/home-os/config/backup-jobs.json";
