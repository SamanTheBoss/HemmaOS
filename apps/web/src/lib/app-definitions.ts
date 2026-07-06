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
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
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
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    envFields: [],
    mobileApp: "Jellyfin (iOS / Android)",
  },
  {
    id: "adguard",
    name: "AdGuard Home",
    description: "Reklamfritt Wifi",
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-50",
    envFields: [],
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    description: "Lösenordsvalv",
    icon: Lock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
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
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    envFields: [],
    mobileApp: "Audiobookshelf (iOS / Android)",
  },
];
