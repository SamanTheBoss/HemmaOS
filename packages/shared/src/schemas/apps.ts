import { z } from "zod";

export const appNameSchema = z.enum([
  "immich",
  "jellyfin",
  "adguard",
  "vaultwarden",
  "audiobookshelf",
]);

export const appInstallRequestSchema = z.object({
  app: appNameSchema,
  env: z.record(z.string()),
});

export const appInstallResponseSchema = z.object({
  success: z.boolean(),
  url: z.string(),
});

export const appControlActionSchema = z.enum(["restart", "stop", "start"]);

export const appControlRequestSchema = z.object({
  app: appNameSchema,
  action: appControlActionSchema,
});

export const appControlResponseSchema = z.object({
  success: z.boolean(),
});
