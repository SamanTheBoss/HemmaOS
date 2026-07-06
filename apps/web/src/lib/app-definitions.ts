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
  description: string;
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
    icon: Shield,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-emerald-400 to-green-700 shadow-lg shadow-emerald-500/20",
    envFields: [],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    description: "Lösenordsvalv",
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
    icon: Headphones,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20",
    envFields: [],
    mobileApp: "Audiobookshelf (iOS / Android)",
  },
];
