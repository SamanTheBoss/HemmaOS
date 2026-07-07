import type { AppName } from "./apps.types.js";

export interface AppDefinition {
  name: AppName;
  displayName: string;
  description: string;
  containerName: string;
  composeFile: string;
  /** Host-published port (what the browser opens directly). */
  defaultPort: number;
  /** Port the app listens on *inside* its container (Caddy upstream target). */
  internalPort: number;
  envFields: { key: string; label: string; type: "text" | "password" }[];
  /** Reverse proxy path prefix used in the Caddyfile */
  proxyPath: string;
  /** Extra headers to set on the reverse proxy (e.g., X-Real-IP) */
  proxyHeaders?: Record<string, string>;
}

export const APP_DEFINITIONS: Record<AppName, AppDefinition> = {
  immich: {
    name: "immich",
    displayName: "Immich",
    description: "Fotobackup för hela familjen",
    containerName: "immich_server",
    composeFile: "/opt/hemmaos/apps/immich/docker-compose.yml",
    defaultPort: 2283,
    internalPort: 2283,
    proxyPath: "immich",
    envFields: [
      { key: "ADMIN_PASS", label: "Standardlösenord", type: "password" },
      { key: "USER", label: "Första användarnamn", type: "text" },
    ],
  },
  jellyfin: {
    name: "jellyfin",
    displayName: "Jellyfin",
    description: "Familjens Netflix",
    containerName: "jellyfin",
    composeFile: "/opt/hemmaos/apps/jellyfin/docker-compose.yml",
    defaultPort: 8096,
    internalPort: 8096,
    proxyPath: "jellyfin",
    envFields: [],
  },
  adguard: {
    name: "adguard",
    displayName: "AdGuard Home",
    description: "Reklamfritt Wifi",
    containerName: "adguardhome",
    composeFile: "/opt/hemmaos/apps/adguard/docker-compose.yml",
    defaultPort: 3001,
    internalPort: 3000,
    proxyPath: "adguard",
    envFields: [],
  },
  vaultwarden: {
    name: "vaultwarden",
    displayName: "Vaultwarden",
    description: "Lösenordsvalv",
    containerName: "vaultwarden",
    composeFile: "/opt/hemmaos/apps/vaultwarden/docker-compose.yml",
    defaultPort: 8080,
    internalPort: 80,
    proxyPath: "vaultwarden",
    proxyHeaders: { "X-Real-IP": "{remote_host}" },
    envFields: [
      { key: "ADMIN_TOKEN", label: "Admin-lösenord", type: "password" },
    ],
  },
  audiobookshelf: {
    name: "audiobookshelf",
    displayName: "Audiobookshelf",
    description: "Ljudböcker",
    containerName: "audiobookshelf",
    composeFile: "/opt/hemmaos/apps/audiobookshelf/docker-compose.yml",
    defaultPort: 13378,
    internalPort: 80,
    proxyPath: "audiobookshelf",
    envFields: [],
  },
  wordpress: {
    name: "wordpress",
    displayName: "WordPress",
    description: "Din egen hemsida & blogg",
    containerName: "wordpress",
    composeFile: "/opt/hemmaos/apps/wordpress/docker-compose.yml",
    defaultPort: 8085,
    internalPort: 80,
    proxyPath: "wordpress",
    envFields: [],
  },
};
