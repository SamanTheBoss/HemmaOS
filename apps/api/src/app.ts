import express from "express";
import cors from "cors";
import { authMiddleware } from "./shared/middleware/auth.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { systemRouter } from "./modules/system/system.router.js";
import { appsRouter } from "./modules/apps/apps.router.js";
import { supportRouter } from "./modules/support/support.router.js";
import { logsRouter } from "./modules/logs/logs.router.js";
import { backupRouter } from "./modules/backup/backup.router.js";

export const app = express();

app.use(cors());
app.use(express.json());

// Public liveness probe. The dashboard hits this (cross-origin, CORS-open) on
// both the box's IP and hemmaos.local to show a green/red reachability dot per
// access method — so it must answer before the auth middleware.
app.get("/api/health", (_req, res) => {
  res.json({ data: { ok: true } });
});

// Auth routes (check/setup/login are public, middleware handles it)
app.use("/api/auth", authRouter);

// Auth middleware protects everything below
app.use(authMiddleware);

app.use("/api/system", systemRouter);
app.use("/api/apps", appsRouter);
app.use("/api/system/support", supportRouter);
app.use("/api/logs", logsRouter);
app.use("/api/backup", backupRouter);

app.use(errorHandler);
