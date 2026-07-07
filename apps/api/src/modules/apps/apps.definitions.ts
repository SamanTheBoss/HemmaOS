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
  nextcloud: {
    name: "nextcloud",
    displayName: "Nextcloud",
    description: "Familjens filer & dokument",
    containerName: "nextcloud",
    composeFile: "/opt/hemmaos/apps/nextcloud/docker-compose.yml",
    defaultPort: 8086,
    internalPort: 80,
    proxyPath: "nextcloud",
    envFields: [],
  },
  homeassistant: {
    name: "homeassistant",
    displayName: "Home Assistant",
    description: "Hjärnan i det smarta hemmet",
    containerName: "homeassistant",
    composeFile: "/opt/hemmaos/apps/homeassistant/docker-compose.yml",
    defaultPort: 8123,
    internalPort: 8123,
    proxyPath: "homeassistant",
    envFields: [],
  },
  navidrome: {
    name: "navidrome",
    displayName: "Navidrome",
    description: "Er egen musikström",
    containerName: "navidrome",
    composeFile: "/opt/hemmaos/apps/navidrome/docker-compose.yml",
    defaultPort: 4533,
    internalPort: 4533,
    proxyPath: "navidrome",
    envFields: [],
  },
  stirling: {
    name: "stirling",
    displayName: "Stirling-PDF",
    description: "Redigera & signera PDF:er",
    containerName: "stirling",
    composeFile: "/opt/hemmaos/apps/stirling/docker-compose.yml",
    defaultPort: 8095,
    internalPort: 8080,
    proxyPath: "stirling",
    envFields: [],
  },
  uptimekuma: {
    name: "uptimekuma",
    displayName: "Uptime Kuma",
    description: "Övervakning & aviseringar",
    containerName: "uptimekuma",
    composeFile: "/opt/hemmaos/apps/uptimekuma/docker-compose.yml",
    defaultPort: 3002,
    internalPort: 3001,
    proxyPath: "uptimekuma",
    envFields: [],
  },
  memos: {
    name: "memos",
    displayName: "Memos",
    description: "Anteckningar & recept",
    containerName: "memos",
    composeFile: "/opt/hemmaos/apps/memos/docker-compose.yml",
    defaultPort: 5230,
    internalPort: 5230,
    proxyPath: "memos",
    envFields: [],
  },
  transmission: {
    name: "transmission",
    displayName: "Transmission",
    description: "Nedladdningar i bakgrunden",
    containerName: "transmission",
    composeFile: "/opt/hemmaos/apps/transmission/docker-compose.yml",
    defaultPort: 9091,
    internalPort: 9091,
    proxyPath: "transmission",
    envFields: [],
  },
};
