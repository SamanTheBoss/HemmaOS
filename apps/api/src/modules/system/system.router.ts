import { Router } from "express";
import * as systemController from "./system.controller.js";

export const systemRouter = Router();

systemRouter.get("/status", systemController.getStatus);
systemRouter.post("/reboot", systemController.reboot);

// Software updates (GitHub Releases)
systemRouter.get("/update/check", systemController.checkUpdate);
systemRouter.post("/update/apply", systemController.applyUpdate);

// Local box backup — download config/keys archive
systemRouter.get("/backup/config", systemController.backupConfig);

// Hardware disk health (S.M.A.R.T.) — manual check
systemRouter.get("/disk-health", systemController.getDiskHealth);

// Tailscale
systemRouter.get("/tailscale/status", systemController.getTailscaleStatus);
systemRouter.post("/tailscale/auth", systemController.startTailscaleAuth);
systemRouter.post("/tailscale/stop", systemController.stopTailscale);
