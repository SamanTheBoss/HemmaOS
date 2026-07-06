import { Router } from "express";
import * as systemController from "./system.controller.js";

export const systemRouter = Router();

systemRouter.get("/status", systemController.getStatus);
systemRouter.post("/reboot", systemController.reboot);

// Tailscale
systemRouter.get("/tailscale/status", systemController.getTailscaleStatus);
systemRouter.post("/tailscale/auth", systemController.startTailscaleAuth);
systemRouter.post("/tailscale/stop", systemController.stopTailscale);
