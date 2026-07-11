import {
  Camera,
  Tv,
  Shield,
  Lock,
  Headphones,
  Newspaper,
  Cloud,
  House,
  Music,
  FileText,
  Activity,
  StickyNote,
  Download,
  Clapperboard,
  MonitorPlay,
  Search,
  ArrowDownToLine,
  type LucideIcon,
} from "lucide-react";

/** App store categories (used to group the grid). */
export type CategoryId =
  | "media"
  | "smart"
  | "productivity"
  | "security"
  | "web"
  | "system";

export const CATEGORIES: { id: CategoryId; label: { sv: string; en: string } }[] =
  [
    { id: "media", label: { sv: "Media & Livsstil", en: "Media & Lifestyle" } },
    { id: "smart", label: { sv: "Smart hem", en: "Smart Home" } },
    {
      id: "productivity",
      label: { sv: "Produktivitet", en: "Productivity" },
    },
    { id: "security", label: { sv: "Säkerhet", en: "Security" } },
    { id: "web", label: { sv: "Webb & Publicering", en: "Web & Publishing" } },
    { id: "system", label: { sv: "System & Nätverk", en: "System & Network" } },
  ];

interface Localized {
  sv: string;
  en: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  /** Short one-liner (Swedish). */
  description: string;
  /** Short one-liner (English). */
  descriptionEn: string;
  /** Full paragraph for the detail page. */
  longDescription: Localized;
  category: CategoryId;
  /** What it replaces, e.g. "Google Foto / iCloud". */
  replaces?: Localized;
  developer: string;
  website: string;
  sourceUrl: string;
  /** Approximate download size, e.g. "~6 GB". */
  downloadSize: string;
  /** Screenshot URLs for the gallery (bundled assets to come). */
  gallery: string[];
  /** The app's own host-published port; the UI opens http://<box-ip>:<port>. */
  port: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  envFields: { key: string; label: string; type: "text" | "password" }[];
  mobileApp?: string;
}

// Screenshot paths served from apps/web/public/app-assets/<id>/ — populated by
// deploy/fetch-assets.sh. Missing images degrade to a gradient placeholder.
const shots = (id: string): string[] =>
  [1, 2, 3].map((n) => `/app-assets/${id}/${n}.jpg`);

export const APP_DEFINITIONS: AppDefinition[] = [
  {
    id: "immich",
    name: "Immich",
    description: "Fotobackup för hela familjen",
    descriptionEn: "Photo backup for the whole family",
    longDescription: {
      sv: "Säkerhetskopierar automatiskt alla mobilers bilder och videor till boxen. Inbyggd AI för ansiktsigenkänning och objektsökning, minnen och album — allt lagrat hemma hos er, aldrig i molnet.",
      en: "Automatically backs up every phone's photos and videos to the box. Built-in AI for face recognition and object search, memories and albums — all stored at home, never in the cloud.",
    },
    category: "media",
    replaces: { sv: "Google Foto / iCloud", en: "Google Photos / iCloud" },
    developer: "Immich",
    website: "https://immich.app",
    sourceUrl: "https://github.com/immich-app/immich",
    downloadSize: "~6 GB",
    gallery: shots("immich"),
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
    longDescription: {
      sv: "Ert privata mediecenter för egna filmer, serier och hemvideor. Strömma till TV, mobil och surfplatta med hårdvaruaccelererad video — inga abonnemang, inga annonser.",
      en: "Your private media center for your own films, shows and home videos. Stream to TV, phone and tablet with hardware-accelerated video — no subscriptions, no ads.",
    },
    category: "media",
    replaces: { sv: "Netflix / Plex", en: "Netflix / Plex" },
    developer: "Jellyfin",
    website: "https://jellyfin.org",
    sourceUrl: "https://github.com/jellyfin/jellyfin",
    downloadSize: "~1 GB",
    gallery: shots("jellyfin"),
    port: 8096,
    icon: Tv,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-fuchsia-500 to-violet shadow-lg shadow-fuchsia-500/20",
    envFields: [],
    mobileApp: "Jellyfin (iOS / Android)",
  },
  {
    id: "audiobookshelf",
    name: "Audiobookshelf",
    description: "Ljudböcker & poddar",
    descriptionEn: "Audiobooks & podcasts",
    longDescription: {
      sv: "Hantera och strömma era egna ljudböcker och podcasts. Kommer ihåg var varje familjemedlem slutade lyssna, med appar för iOS och Android.",
      en: "Manage and stream your own audiobooks and podcasts. Remembers where each family member left off, with apps for iOS and Android.",
    },
    category: "media",
    replaces: { sv: "Audible / Storytel", en: "Audible" },
    developer: "advplyr",
    website: "https://www.audiobookshelf.org",
    sourceUrl: "https://github.com/advplyr/audiobookshelf",
    downloadSize: "~200 MB",
    gallery: shots("audiobookshelf"),
    port: 13378,
    icon: Headphones,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20",
    envFields: [],
    mobileApp: "Audiobookshelf (iOS / Android)",
  },
  {
    id: "vaultwarden",
    name: "Vaultwarden",
    description: "Lösenordsvalv",
    descriptionEn: "Password vault",
    longDescription: {
      sv: "Ett hypersäkert lösenordsvalv för hela familjen som lagras hemma hos er. Fungerar med Bitwarden-apparna i alla webbläsare och mobiler.",
      en: "A hyper-secure password vault for the whole family, stored at home. Works with the Bitwarden apps in every browser and phone.",
    },
    category: "security",
    replaces: { sv: "1Password / LastPass", en: "1Password / LastPass" },
    developer: "dani-garcia",
    website: "https://github.com/dani-garcia/vaultwarden",
    sourceUrl: "https://github.com/dani-garcia/vaultwarden",
    downloadSize: "~92 MB",
    gallery: shots("vaultwarden"),
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
    id: "adguard",
    name: "AdGuard Home",
    description: "Reklamfritt wifi",
    descriptionEn: "Ad-free Wi-Fi",
    longDescription: {
      sv: "Blockerar reklam, spårare och skadliga sidor för alla enheter i hemmet samtidigt — mobiler, datorer och smart-TV — så fort de ansluter till wifit.",
      en: "Blocks ads, trackers and malicious sites for every device in the home at once — phones, computers and smart TVs — the moment they join the Wi-Fi.",
    },
    category: "security",
    replaces: { sv: "Pi-hole", en: "Pi-hole" },
    developer: "AdGuard",
    website: "https://adguard.com/adguard-home.html",
    sourceUrl: "https://github.com/AdguardTeam/AdGuardHome",
    downloadSize: "~64 MB",
    gallery: shots("adguard"),
    port: 3001,
    icon: Shield,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-emerald-400 to-green-700 shadow-lg shadow-emerald-500/20",
    envFields: [],
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Din egen hemsida & blogg",
    descriptionEn: "Your own website & blog",
    longDescription: {
      sv: "Bygg och driv din egen hemsida, blogg eller butik på boxen. Världens mest använda publiceringsverktyg — helt under din kontroll. Kan senare publiceras på internet med egen domän.",
      en: "Build and run your own website, blog or shop on the box. The world's most-used publishing platform — fully under your control. Can later be published to the internet with your own domain.",
    },
    category: "web",
    replaces: { sv: "Wix / Squarespace", en: "Wix / Squarespace" },
    developer: "WordPress",
    website: "https://wordpress.org",
    sourceUrl: "https://github.com/WordPress/WordPress",
    downloadSize: "~700 MB",
    gallery: shots("wordpress"),
    port: 8085,
    icon: Newspaper,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-sky-500 to-indigo-700 shadow-lg shadow-indigo-500/20",
    envFields: [],
    mobileApp: "WordPress (iOS / Android)",
  },
  {
    id: "nextcloud",
    name: "Nextcloud",
    description: "Familjens filer & dokument",
    descriptionEn: "The family's files & documents",
    longDescription: {
      sv: "Er egen molnlagring för dokument, filer och kalender. Synkar mellan alla enheter — men allt lagras hemma hos er, inte hos Google eller Dropbox.",
      en: "Your own cloud storage for documents, files and calendar. Syncs across every device — but everything is stored at home, not with Google or Dropbox.",
    },
    category: "web",
    replaces: { sv: "Dropbox / OneDrive", en: "Dropbox / OneDrive" },
    developer: "Nextcloud",
    website: "https://nextcloud.com",
    sourceUrl: "https://github.com/nextcloud/server",
    downloadSize: "~1 GB",
    gallery: [],
    port: 8086,
    icon: Cloud,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg shadow-blue-500/20",
    envFields: [],
    mobileApp: "Nextcloud (iOS / Android)",
  },
  {
    id: "homeassistant",
    name: "Home Assistant",
    description: "Hjärnan i det smarta hemmet",
    descriptionEn: "The brain of the smart home",
    longDescription: {
      sv: "Samla Philips Hue, IKEA, Sonos och andra smarta prylar på ett ställe — helt lokalt, utan att data skickas till externa moln. Automationer, scener och kontroll för hela hemmet.",
      en: "Bring Philips Hue, IKEA, Sonos and other smart devices together in one place — fully local, without sending data to external clouds. Automations, scenes and control for the whole home.",
    },
    category: "smart",
    developer: "Home Assistant",
    website: "https://www.home-assistant.io",
    sourceUrl: "https://github.com/home-assistant/core",
    downloadSize: "~1,5 GB",
    gallery: [],
    port: 8123,
    icon: House,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-cyan-400 to-teal-600 shadow-lg shadow-teal-500/20",
    envFields: [],
    mobileApp: "Home Assistant (iOS / Android)",
  },
  {
    id: "navidrome",
    name: "Navidrome",
    description: "Er egen musikström",
    descriptionEn: "Your own music streaming",
    longDescription: {
      sv: "Ett privat Spotify för familjens egna musikfiler och MP3:er. Strömma till mobilen var ni än är, med appar för iOS och Android.",
      en: "A private Spotify for the family's own music files and MP3s. Stream to your phone wherever you are, with apps for iOS and Android.",
    },
    category: "media",
    replaces: { sv: "Spotify", en: "Spotify" },
    developer: "Navidrome",
    website: "https://www.navidrome.org",
    sourceUrl: "https://github.com/navidrome/navidrome",
    downloadSize: "~80 MB",
    gallery: [],
    port: 4533,
    icon: Music,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-lg shadow-fuchsia-500/20",
    envFields: [],
    mobileApp: "Symfonium / play:Sub (iOS / Android)",
  },
  {
    id: "stirling",
    name: "Stirling-PDF",
    description: "Redigera & signera PDF:er",
    descriptionEn: "Edit & sign PDFs",
    longDescription: {
      sv: "Ett komplett PDF-verktyg som körs helt lokalt. Signera, dela upp, slå ihop och konvertera dokument — känsliga avtal och deklarationer lämnar aldrig huset.",
      en: "A complete PDF toolkit that runs entirely locally. Sign, split, merge and convert documents — sensitive contracts and tax forms never leave the house.",
    },
    category: "productivity",
    replaces: { sv: "Adobe Acrobat Pro", en: "Adobe Acrobat Pro" },
    developer: "Stirling Tools",
    website: "https://www.stirlingpdf.com",
    sourceUrl: "https://github.com/Stirling-Tools/Stirling-PDF",
    downloadSize: "~600 MB",
    gallery: [],
    port: 8095,
    icon: FileText,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-rose-500 to-red-700 shadow-lg shadow-rose-500/20",
    envFields: [],
  },
  {
    id: "uptimekuma",
    name: "Uptime Kuma",
    description: "Övervakning & aviseringar",
    descriptionEn: "Monitoring & alerts",
    longDescription: {
      sv: "Håller koll på att boxen och nätverket mår bra och skickar en pushnotis till mobilen om något går ner. Snygga statuspaneler att baka in i skrivbordet.",
      en: "Keeps an eye on the box and network and sends a push notification if something goes down. Clean status panels to embed on the desktop.",
    },
    category: "system",
    developer: "louislam",
    website: "https://uptime.kuma.pet",
    sourceUrl: "https://github.com/louislam/uptime-kuma",
    downloadSize: "~200 MB",
    gallery: [],
    port: 3002,
    icon: Activity,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-emerald-400 to-green-700 shadow-lg shadow-emerald-500/20",
    envFields: [],
  },
  {
    id: "memos",
    name: "Memos",
    description: "Anteckningar & recept",
    descriptionEn: "Notes & recipes",
    longDescription: {
      sv: "En supersmidig lokal app för snabba anteckningar, kom-ihåg-listor och recept som hela familjen kan dela — helt fritt från Apple Notes och Google Keep.",
      en: "A super-smooth local app for quick notes, to-do lists and recipes the whole family can share — completely free of Apple Notes and Google Keep.",
    },
    category: "productivity",
    replaces: { sv: "Apple Notes / Google Keep", en: "Apple Notes / Google Keep" },
    developer: "Memos",
    website: "https://www.usememos.com",
    sourceUrl: "https://github.com/usememos/memos",
    downloadSize: "~60 MB",
    gallery: [],
    port: 5230,
    icon: StickyNote,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20",
    envFields: [],
  },
  {
    id: "transmission",
    name: "Transmission",
    description: "Nedladdningar i bakgrunden",
    descriptionEn: "Background downloads",
    longDescription: {
      sv: "Sköter nedladdningar säkert i bakgrunden direkt till boxens hårddisk. Kan kopplas ihop med Jellyfin för smidig mediahantering.",
      en: "Handles downloads safely in the background straight to the box's drive. Can be wired up with Jellyfin for smooth media management.",
    },
    category: "media",
    developer: "Transmission",
    website: "https://transmissionbt.com",
    sourceUrl: "https://github.com/transmission/transmission",
    downloadSize: "~120 MB",
    gallery: [],
    port: 9091,
    icon: Download,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg shadow-black/20",
    envFields: [],
  },
  {
    id: "overseerr",
    name: "Overseerr",
    description: "Önska film & serier",
    descriptionEn: "Request movies & shows",
    longDescription: {
      sv: "Familjens önskelista för film och serier. Sök en titel och tryck 'önska' — så hämtar boxen den automatiskt och lägger till den i Jellyfin. Slut på att leta.",
      en: "The family's wishlist for movies and shows. Search a title and hit 'request' — the box fetches it automatically and adds it to Jellyfin. No more hunting.",
    },
    category: "media",
    developer: "sct",
    website: "https://overseerr.dev",
    sourceUrl: "https://github.com/sct/overseerr",
    downloadSize: "~350 MB",
    gallery: [],
    port: 5055,
    icon: Search,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-indigo-400 to-purple-700 shadow-lg shadow-indigo-500/20",
    envFields: [],
  },
  {
    id: "radarr",
    name: "Radarr",
    description: "Filmer automatiskt",
    descriptionEn: "Movies, automatically",
    longDescription: {
      sv: "Håller familjens filmbibliotek uppdaterat automatiskt — hittar, laddar ner och sorterar filmer i rätt kvalitet, redo att spelas i Jellyfin.",
      en: "Keeps the family's movie library updated automatically — finds, downloads and sorts films in the right quality, ready to play in Jellyfin.",
    },
    category: "media",
    developer: "Radarr",
    website: "https://radarr.video",
    sourceUrl: "https://github.com/Radarr/Radarr",
    downloadSize: "~250 MB",
    gallery: [],
    port: 7878,
    icon: Clapperboard,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20",
    envFields: [],
  },
  {
    id: "sonarr",
    name: "Sonarr",
    description: "Serier automatiskt",
    descriptionEn: "TV shows, automatically",
    longDescription: {
      sv: "Bevakar familjens serier och hämtar nya avsnitt automatiskt när de släpps — sorterat och redo i Jellyfin. Sätt och glöm.",
      en: "Watches the family's shows and grabs new episodes automatically as they air — sorted and ready in Jellyfin. Set and forget.",
    },
    category: "media",
    developer: "Sonarr",
    website: "https://sonarr.tv",
    sourceUrl: "https://github.com/Sonarr/Sonarr",
    downloadSize: "~250 MB",
    gallery: [],
    port: 8989,
    icon: MonitorPlay,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-sky-400 to-blue-700 shadow-lg shadow-blue-500/20",
    envFields: [],
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    description: "Nedladdningsmotor",
    descriptionEn: "Download engine",
    longDescription: {
      sv: "Nedladdningsmotorn som sköter hämtningarna i bakgrunden, säkert direkt till boxens disk. Samarbetar med Radarr och Sonarr.",
      en: "The download engine that handles fetches in the background, safely straight to the box's disk. Works together with Radarr and Sonarr.",
    },
    category: "media",
    developer: "qBittorrent",
    website: "https://www.qbittorrent.org",
    sourceUrl: "https://github.com/qbittorrent/qBittorrent",
    downloadSize: "~200 MB",
    gallery: [],
    port: 8082,
    icon: ArrowDownToLine,
    color: "text-white",
    bgColor: "bg-gradient-to-br from-cyan-400 to-teal-700 shadow-lg shadow-teal-500/20",
    envFields: [],
  },
];
