import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  appInstallRequestSchema,
  appControlRequestSchema,
} from "@home-os/shared";
import * as appsController from "./apps.controller.js";

export const appsRouter = Router();

appsRouter.get("/", appsController.list);

appsRouter.post(
  "/install",
  validate(appInstallRequestSchema),
  appsController.install,
);

appsRouter.post(
  "/control",
  validate(appControlRequestSchema),
  appsController.control,
);
