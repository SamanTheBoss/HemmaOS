import {
  Camera,
  Tv,
  Shield,
  Lock,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export interface AppDefinition {
  id: string;
  name: string;
  /** Swedish description. */
  description: string;
  /** English description. */
  descriptionEn: string;
  /** The app's own port; the UI opens http://<box-ip>:<port>. */
  port: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  envFields: { key: string; label: string; type: "text" | "password" }[];
  mobileApp?: string;
}

export const APP_DEFINITIONS: AppDefinition[] = [
  {
    id: "immich",
    name: "Immich",
    description: "Fotobackup för hela familjen",
    descriptionEn: "Photo backup for the whole family",
    port: 2283,
    icon: Camera,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-500/20",
    envFields: [
      { key: "ADMIN_PASS", label: "Standardlösenord", type: "password" },
      { key: "USER", label: "Första användarnamn", type: "text" },
    ],
    mobileApp: "Immich (iOS / Android)",
  },
  {
    id: "jellyfin",
    name: "Jellyfin",
    description: "Familjens Netflix",
    descriptionEn: "The family's Netflix",
    port: 8096,
    icon: Tv,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-fuchsia-500 to-violet shadow-lg shadow-fuchsia-500/20",
    envFields: [],
    mobileApp: "Jellyfin (iOS / Android)",
  },
  {
    id: "adguard",
    name: "AdGuard Home",
    description: "Reklamfritt Wifi",
    descriptionEn: "Ad-free Wi-Fi",
    port: 3001,
    icon: Shield,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-emerald-400 to-green-700 shadow-lg shadow-emerald-500/20",
    envFields: [],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    description: "Lösenordsvalv",
    descriptionEn: "Password vault",
    port: 8080,
    icon: Lock,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-violet to-purple-700 shadow-lg shadow-violet/25",
    envFields: [
      { key: "ADMIN_TOKEN", label: "Admin-lösenord", type: "password" },
    ],
    mobileApp: "Bitwarden (iOS / Android)",
  },
  {
    id: "audiobookshelf",
    name: "Audiobookshelf",
    description: "Ljudböcker",
    descriptionEn: "Audiobooks",
    port: 13378,
    icon: Headphones,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20",
    envFields: [],
    mobileApp: "Audiobookshelf (iOS / Android)",
  },
];
