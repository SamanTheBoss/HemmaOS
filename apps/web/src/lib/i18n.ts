export type Locale = "sv" | "en";

const translations = {
  sv: {
    // Navigation
    "nav.home": "Hem",
    "nav.apps": "Appar",
    "nav.settings": "Inställningar",

    // Dashboard
    "dashboard.healthy": "Ditt hem är säkrat",
    "dashboard.healthy.sub": "Alla tjänster körs som de ska.",
    "dashboard.degraded": "Något behöver uppmärksamhet",
    "dashboard.degraded.sub": "Kontrollera inställningarna.",
    "dashboard.unhealthy": "Systemet har problem",
    "dashboard.storage": "Lagring",
    "dashboard.storage.used": "{used} av {total} använt",
    "dashboard.storage.estimate": "~ Utrymme kvar för {years} familjebilder",
    "dashboard.memory": "Minne",
    "dashboard.memory.used": "{percent}% av RAM används",
    "dashboard.backup": "Backup",
    "dashboard.backup.none": "Ingen extra backup konfigurerad",
    "dashboard.backup.configure": "Konfigurera synkronisering under Inställningar.",
    "dashboard.backup.failed": "Kontrollera synkinställningarna.",

    // Apps
    "apps.title": "Appar",
    "apps.subtitle": "Installera och hantera dina familjeappar.",
    "apps.install": "Installera",
    "apps.open": "Öppna",
    "apps.installing": "HemmaOS konfigurerar din app...",
    "apps.installing.wait": "Detta kan ta en liten stund",
    "apps.done": "Klart!",
    "apps.done.message": "{name} är nu installerat och redo att användas.",
    "apps.done.mobile": "Ladda ner mobilappen {app} och anslut med adressen ovan.",
    "apps.goto": "Gå till min app",
    "apps.no.config": "Inga inställningar krävs. Appen är redo att installeras.",

    // Settings
    "settings.title": "Inställningar",
    "settings.subtitle": "Hantera systemet, fjärråtkomst och support.",
    "settings.remote": "Fjärråtkomst",
    "settings.remote.desc": "Kom åt boxen utanför hemmet",
    "settings.remote.via": "Via Tailscale",
    "settings.remote.login": "Öppna Tailscale-inloggning",
    "settings.remote.waiting": "Väntar på inloggning...",
    "settings.remote.off": "Slå på för att logga in med Tailscale.",
    "settings.support": "Muradi Fjärrsupport",
    "settings.support.toggle": "Aktivera fjärrsupport",
    "settings.support.warning": "När denna är aktiv kan en Muradi-tekniker felsöka din box på distans.",
    "settings.sync": "Synkronisering",
    "settings.sync.new": "Ny",
    "settings.sync.empty": "Inga synkjobb konfigurerade. Tryck \"Ny\" för att börja.",
    "settings.logs": "Systemloggar",
    "settings.logs.select": "Välj container...",
    "settings.logs.empty": "Välj en container och tryck play.",
    "settings.logs.waiting": "Väntar på loggar...",
    "settings.reboot": "Starta om HemmaOS",
    "settings.reboot.confirm": "Starta om?",
    "settings.reboot.warning": "Alla tjänster kommer att stoppas tillfälligt. Är du säker?",
    "settings.reboot.cancel": "Avbryt",
    "settings.reboot.action": "Starta om",

    // Backup wizard
    "backup.wizard.title": "Ny synkronisering",
    "backup.wizard.target": "Välj var du vill synka dina filer till.",
    "backup.wizard.name": "Namn",
    "backup.wizard.name.placeholder": "T.ex. Daglig backup till USB",
    "backup.wizard.local": "Lokal mapp",
    "backup.wizard.usb": "USB-disk",
    "backup.wizard.cloud": "Moln",
    "backup.wizard.path": "Sökväg",
    "backup.wizard.usb.select": "Välj USB-enhet",
    "backup.wizard.usb.none": "Ingen USB-enhet hittades. Anslut en och försök igen.",
    "backup.wizard.cloud.title": "Välj molntjänst",
    "backup.wizard.cloud.desc": "Logga in med ditt konto för att synka filer dit.",
    "backup.wizard.sources": "Vad ska synkas?",
    "backup.wizard.sources.desc": "Välj vilken data som ska ingå i synkroniseringen.",
    "backup.wizard.schedule": "Hur ofta?",
    "backup.wizard.schedule.desc": "Välj schema för automatisk synkronisering.",
    "backup.wizard.creating": "Konfigurerar synkronisering...",
    "backup.wizard.done": "Klart!",
    "backup.wizard.next": "Nästa",
    "backup.wizard.back": "Tillbaka",
    "backup.wizard.create": "Skapa",
    "backup.wizard.close": "Stäng",
    "backup.wizard.all": "Allt",
    "backup.schedule.daily": "Dagligen (kl 03:00)",
    "backup.schedule.weekly": "Varje söndag (kl 03:00)",
    "backup.schedule.monthly": "1:a varje månad",
    "backup.schedule.manual": "Bara manuellt",

    // Auth
    "auth.login.title": "Logga in",
    "auth.login.password": "Lösenord",
    "auth.login.action": "Logga in",
    "auth.login.error": "Fel lösenord",
    "auth.setup.title": "Välkommen till HemmaOS",
    "auth.setup.subtitle": "Låt oss konfigurera ditt system.",
    "auth.setup.name": "Ge ditt system ett namn",
    "auth.setup.name.placeholder": "T.ex. Familjens Server",
    "auth.setup.language": "Språk",
    "auth.setup.timezone": "Tidszon",
    "auth.setup.password": "Välj ett lösenord",
    "auth.setup.password.confirm": "Bekräfta lösenord",
    "auth.setup.action": "Kom igång",
    "auth.setup.password.mismatch": "Lösenorden matchar inte",

    // Common
    "common.loading": "Laddar...",
    "common.error": "Något gick fel",
  },
  en: {
    "nav.home": "Home",
    "nav.apps": "Apps",
    "nav.settings": "Settings",

    "dashboard.healthy": "Your home is secure",
    "dashboard.healthy.sub": "All services are running properly.",
    "dashboard.degraded": "Something needs attention",
    "dashboard.degraded.sub": "Check your settings.",
    "dashboard.unhealthy": "System issues detected",
    "dashboard.storage": "Storage",
    "dashboard.storage.used": "{used} of {total} used",
    "dashboard.storage.estimate": "~ Space left for {years} of family photos",
    "dashboard.memory": "Memory",
    "dashboard.memory.used": "{percent}% of RAM in use",
    "dashboard.backup": "Backup",
    "dashboard.backup.none": "No extra backup configured",
    "dashboard.backup.configure": "Set up sync in Settings.",
    "dashboard.backup.failed": "Check sync settings.",

    "apps.title": "Apps",
    "apps.subtitle": "Install and manage your family apps.",
    "apps.install": "Install",
    "apps.open": "Open",
    "apps.installing": "HemmaOS is configuring your app...",
    "apps.installing.wait": "This may take a moment",
    "apps.done": "Done!",
    "apps.done.message": "{name} is now installed and ready to use.",
    "apps.done.mobile": "Download the mobile app {app} and connect using the address above.",
    "apps.goto": "Go to my app",
    "apps.no.config": "No configuration needed. The app is ready to install.",

    "settings.title": "Settings",
    "settings.subtitle": "Manage the system, remote access, and support.",
    "settings.remote": "Remote Access",
    "settings.remote.desc": "Access your box outside the home",
    "settings.remote.via": "Via Tailscale",
    "settings.remote.login": "Open Tailscale login",
    "settings.remote.waiting": "Waiting for login...",
    "settings.remote.off": "Turn on to log in with Tailscale.",
    "settings.support": "Muradi Remote Support",
    "settings.support.toggle": "Enable remote support",
    "settings.support.warning": "When active, a Muradi technician can troubleshoot your box remotely.",
    "settings.sync": "Sync",
    "settings.sync.new": "New",
    "settings.sync.empty": "No sync jobs configured. Press \"New\" to start.",
    "settings.logs": "System Logs",
    "settings.logs.select": "Select container...",
    "settings.logs.empty": "Select a container and press play.",
    "settings.logs.waiting": "Waiting for logs...",
    "settings.reboot": "Restart HemmaOS",
    "settings.reboot.confirm": "Restart?",
    "settings.reboot.warning": "All services will be temporarily stopped. Are you sure?",
    "settings.reboot.cancel": "Cancel",
    "settings.reboot.action": "Restart",

    "backup.wizard.title": "New sync",
    "backup.wizard.target": "Choose where to sync your files.",
    "backup.wizard.name": "Name",
    "backup.wizard.name.placeholder": "E.g. Daily backup to USB",
    "backup.wizard.local": "Local folder",
    "backup.wizard.usb": "USB drive",
    "backup.wizard.cloud": "Cloud",
    "backup.wizard.path": "Path",
    "backup.wizard.usb.select": "Select USB device",
    "backup.wizard.usb.none": "No USB device found. Connect one and try again.",
    "backup.wizard.cloud.title": "Choose cloud service",
    "backup.wizard.cloud.desc": "Sign in with your account to sync files there.",
    "backup.wizard.sources": "What to sync?",
    "backup.wizard.sources.desc": "Choose which data to include in the sync.",
    "backup.wizard.schedule": "How often?",
    "backup.wizard.schedule.desc": "Choose a schedule for automatic syncing.",
    "backup.wizard.creating": "Configuring sync...",
    "backup.wizard.done": "Done!",
    "backup.wizard.next": "Next",
    "backup.wizard.back": "Back",
    "backup.wizard.create": "Create",
    "backup.wizard.close": "Close",
    "backup.wizard.all": "All",
    "backup.schedule.daily": "Daily (at 03:00)",
    "backup.schedule.weekly": "Every Sunday (at 03:00)",
    "backup.schedule.monthly": "1st of each month",
    "backup.schedule.manual": "Manual only",

    "auth.login.title": "Log in",
    "auth.login.password": "Password",
    "auth.login.action": "Log in",
    "auth.login.error": "Wrong password",
    "auth.setup.title": "Welcome to HemmaOS",
    "auth.setup.subtitle": "Let's set up your system.",
    "auth.setup.name": "Give your system a name",
    "auth.setup.name.placeholder": "E.g. Family Server",
    "auth.setup.language": "Language",
    "auth.setup.timezone": "Timezone",
    "auth.setup.password": "Choose a password",
    "auth.setup.password.confirm": "Confirm password",
    "auth.setup.action": "Get started",
    "auth.setup.password.mismatch": "Passwords don't match",

    "common.loading": "Loading...",
    "common.error": "Something went wrong",
  },
} as const;

type TranslationKey = keyof (typeof translations)["sv"];

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("hemmaos-locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("hemmaos-locale") as Locale | null;
    if (stored && (stored === "sv" || stored === "en")) {
      currentLocale = stored;
    }
  }
  return currentLocale;
}

export function t(
  key: TranslationKey,
  params?: Record<string, string>,
): string {
  const str: string =
    translations[currentLocale]?.[key] ?? translations.en[key] ?? key;
  if (!params) return str;
  return Object.entries(params).reduce<string>(
    (acc, [k, v]) => acc.replace(`{${k}}`, v),
    str,
  );
}
