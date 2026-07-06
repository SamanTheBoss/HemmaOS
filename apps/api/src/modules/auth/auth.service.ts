import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../../shared/middleware/error-handler.js";

const CONFIG_FILE = "/opt/home-os/config/auth.json";
const JWT_SECRET =
  process.env["JWT_SECRET"] ?? randomBytes(32).toString("hex");

interface AuthConfig {
  passwordHash: string;
  salt: string;
  systemName: string;
  locale: string;
  timezone: string;
  setupComplete: boolean;
}

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

async function loadConfig(): Promise<AuthConfig | null> {
  try {
    const raw = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as AuthConfig;
  } catch {
    return null;
  }
}

async function saveConfig(config: AuthConfig): Promise<void> {
  await mkdir(dirname(CONFIG_FILE), { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function isSetupComplete(): Promise<boolean> {
  const config = await loadConfig();
  return config?.setupComplete ?? false;
}

export async function getSetupInfo(): Promise<{
  setupComplete: boolean;
  systemName: string | null;
  locale: string | null;
  timezone: string | null;
}> {
  const config = await loadConfig();
  if (!config) {
    return {
      setupComplete: false,
      systemName: null,
      locale: null,
      timezone: null,
    };
  }
  return {
    setupComplete: config.setupComplete,
    systemName: config.systemName,
    locale: config.locale,
    timezone: config.timezone,
  };
}

export async function setup(data: {
  password: string;
  systemName: string;
  locale: string;
  timezone: string;
}): Promise<{ token: string }> {
  const existing = await loadConfig();
  if (existing?.setupComplete) {
    throw new AppError(400, "Setup already completed", "ALREADY_SETUP");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(data.password, salt);

  const config: AuthConfig = {
    passwordHash,
    salt,
    systemName: data.systemName,
    locale: data.locale,
    timezone: data.timezone,
    setupComplete: true,
  };

  await saveConfig(config);

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return { token };
}

export async function login(password: string): Promise<{ token: string }> {
  const config = await loadConfig();
  if (!config) {
    throw new AppError(401, "System not set up", "NOT_SETUP");
  }

  const hash = hashPassword(password, config.salt);
  if (hash !== config.passwordHash) {
    throw new AppError(401, "Fel lösenord", "INVALID_PASSWORD");
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return { token };
}

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function updateSettings(data: {
  systemName?: string;
  locale?: string;
  timezone?: string;
}): Promise<void> {
  const config = await loadConfig();
  if (!config) {
    throw new AppError(400, "System not set up", "NOT_SETUP");
  }

  if (data.systemName !== undefined) config.systemName = data.systemName;
  if (data.locale !== undefined) config.locale = data.locale;
  if (data.timezone !== undefined) config.timezone = data.timezone;

  await saveConfig(config);
}
