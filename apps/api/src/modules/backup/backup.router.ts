import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { createBackupJobRequestSchema } from "@home-os/shared";
import * as backupController from "./backup.controller.js";

export const backupRouter = Router();

backupRouter.get("/jobs", backupController.getJobs);
backupRouter.post(
  "/jobs",
  validate(createBackupJobRequestSchema),
  backupController.createJob,
);
backupRouter.delete("/jobs/:jobId", backupController.deleteJob);
backupRouter.post("/jobs/:jobId/run", backupController.runJob);
backupRouter.get("/usb-devices", backupController.getUsbDevices);

// Cloud provider OAuth flow (gdrive, dropbox, onedrive, box, pcloud)
backupRouter.get("/cloud/providers", backupController.getCloudProviders);
backupRouter.post("/cloud/auth/:provider", backupController.startCloudAuth);
backupRouter.get("/cloud/auth/status", backupController.getCloudAuthStatus);
backupRouter.post("/cloud/auth/:provider/token", backupController.saveCloudToken);
backupRouter.delete("/cloud/auth", backupController.cancelCloudAuth);
