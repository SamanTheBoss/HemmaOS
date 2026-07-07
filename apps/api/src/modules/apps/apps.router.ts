import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { requireParent } from "../../shared/middleware/auth.js";
import {
  appInstallRequestSchema,
  appControlRequestSchema,
} from "@hemmaos/shared";
import * as appsController from "./apps.controller.js";

export const appsRouter = Router();

// Anyone signed in can see the catalog + install progress…
appsRouter.get("/", appsController.list);
appsRouter.get("/install/progress", appsController.installProgress);

// …but installing, controlling and uninstalling are parent-only.
appsRouter.post(
  "/install",
  requireParent,
  validate(appInstallRequestSchema),
  appsController.install,
);

appsRouter.post(
  "/control",
  requireParent,
  validate(appControlRequestSchema),
  appsController.control,
);

appsRouter.post("/uninstall", requireParent, appsController.uninstall);
