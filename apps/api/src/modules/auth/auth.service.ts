import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../../shared/middleware/error-handler.js";

const CONFIG_FILE = "/opt/hemmaos/config/auth.json";
const JWT_SECRET =
  process.env["JWT_SECRET"] ?? randomBytes(32).toString("hex");

export type Role = "parent" | "child";

export interface User {
  id: string;
  name: string;
  role: Role;
  passwordHash: string;
  salt: string;
}

export interface AuthPayload {
  uid: string;
  name: string;
  role: Role;
}

interface AuthConfig {
  users?: User[];
  // Legacy single-admin fields (migrated to `users` on read).
  passwordHash?: string;
  salt?: string;
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

function makeUser(name: string, role: Role, password: string): User {
  const salt = randomBytes(16).toString("hex");
  return {
    id: randomBytes(8).toString("hex"),
    name,
    role,
    salt,
    passwordHash: hashPassword(password, salt),
  };
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

// The list of users is the source of truth. Old configs stored a single
// password at the top level — migrate those to one parent user so existing
// boxes keep working without anyone being locked out.
function usersOf(config: AuthConfig): User[] {
  if (config.users && config.users.length > 0) return config.users;
  if (config.passwordHash && config.salt) {
    return [
      {
        id: "owner",
        name: "Admin",
        role: "parent",
        passwordHash: config.passwordHash,
        salt: config.salt,
      },
    ];
  }
  return [];
}

function sign(user: User): string {
  const payload: AuthPayload = {
    uid: user.id,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
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

  const owner = makeUser("Förälder", "parent", data.password);
  const config: AuthConfig = {
    users: [owner],
    systemName: data.systemName,
    locale: data.locale,
    timezone: data.timezone,
    setupComplete: true,
  };

  await saveConfig(config);
  return { token: sign(owner) };
}

export async function login(password: string): Promise<{ token: string }> {
  const config = await loadConfig();
  if (!config) {
    throw new AppError(401, "System not set up", "NOT_SETUP");
  }

  const user = usersOf(config).find(
    (u) => hashPassword(password, u.salt) === u.passwordHash,
  );
  if (!user) {
    throw new AppError(401, "Fel lösenord", "INVALID_PASSWORD");
  }

  return { token: sign(user) };
}

// Returns the decoded payload if the token is valid, otherwise null.
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function listUsers(): Promise<
  { id: string; name: string; role: Role }[]
> {
  const config = await loadConfig();
  if (!config) return [];
  return usersOf(config).map((u) => ({ id: u.id, name: u.name, role: u.role }));
}

export async function addUser(data: {
  name: string;
  password: string;
  role: Role;
}): Promise<{ id: string }> {
  const config = await loadConfig();
  if (!config) throw new AppError(400, "System not set up", "NOT_SETUP");

  const users = usersOf(config);
  const user = makeUser(
    data.name.trim() || "Familjemedlem",
    data.role,
    data.password,
  );
  config.users = [...users, user];
  // Drop legacy fields now that we have a users array.
  delete config.passwordHash;
  delete config.salt;
  await saveConfig(config);
  return { id: user.id };
}

export async function deleteUser(id: string): Promise<void> {
  const config = await loadConfig();
  if (!config) throw new AppError(400, "System not set up", "NOT_SETUP");

  const users = usersOf(config);
  const remaining = users.filter((u) => u.id !== id);
  if (remaining.filter((u) => u.role === "parent").length === 0) {
    throw new AppError(400, "Can't remove the last parent", "LAST_PARENT");
  }
  config.users = remaining;
  delete config.passwordHash;
  delete config.salt;
  await saveConfig(config);
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
