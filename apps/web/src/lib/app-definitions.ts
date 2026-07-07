import {
  Camera,
  Tv,
  Shield,
  Lock,
  Headphones,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

/** App store categories (used to group the grid). */
export type CategoryId = "media" | "security" | "web";

export const CATEGORIES: { id: CategoryId; label: { sv: string; en: string } }[] =
  [
    { id: "media", label: { sv: "Media & Livsstil", en: "Media & Lifestyle" } },
    {
      id: "security",
      label: { sv: "Säkerhet & Produktivitet", en: "Security & Productivity" },
    },
    { id: "web", label: { sv: "Webb & Publicering", en: "Web & Publishing" } },
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
];
