import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";

// In-memory filesystem so the service's config read/write is testable.
let store: Record<string, string> = {};
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(async (p: string) => {
    if (store[p] === undefined) throw new Error("ENOENT");
    return store[p];
  }),
  writeFile: vi.fn(async (p: string, data: string) => {
    store[p] = data;
  }),
  mkdir: vi.fn(async () => undefined),
}));

import * as auth from "../auth.service.js";

const FILE = "/opt/hemmaos/config/auth.json";

beforeEach(() => {
  store = {};
});

describe("auth.service — roles", () => {
  it("setup creates a parent, and login returns a parent token", async () => {
    await auth.setup({
      password: "hunter2",
      systemName: "X",
      locale: "sv",
      timezone: "Z",
    });
    const { token } = await auth.login("hunter2");
    expect(auth.verifyToken(token)?.role).toBe("parent");
  });

  it("migrates a legacy single-password config so login still works", async () => {
    const salt = "abc";
    const passwordHash = createHash("sha256")
      .update("old" + salt)
      .digest("hex");
    store[FILE] = JSON.stringify({
      passwordHash,
      salt,
      systemName: "X",
      locale: "sv",
      timezone: "Z",
      setupComplete: true,
    });
    const { token } = await auth.login("old");
    expect(auth.verifyToken(token)?.role).toBe("parent");
  });

  it("adds a child that logs in with the child role", async () => {
    await auth.setup({ password: "p1", systemName: "X", locale: "sv", timezone: "Z" });
    await auth.addUser({ name: "Kid", password: "kidpass", role: "child" });
    const { token } = await auth.login("kidpass");
    expect(auth.verifyToken(token)?.role).toBe("child");
  });

  it("won't delete the last parent", async () => {
    await auth.setup({ password: "p2", systemName: "X", locale: "sv", timezone: "Z" });
    const users = await auth.listUsers();
    await expect(auth.deleteUser(users[0]!.id)).rejects.toThrow();
  });

  it("rejects a wrong password", async () => {
    await auth.setup({ password: "right", systemName: "X", locale: "sv", timezone: "Z" });
    await expect(auth.login("wrong")).rejects.toThrow();
  });
});
