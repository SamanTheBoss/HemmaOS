import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { supportToggleRequestSchema } from "@home-os/shared";
import * as supportController from "./support.controller.js";

export const supportRouter = Router();

supportRouter.post(
  "/toggle",
  validate(supportToggleRequestSchema),
  supportController.toggle,
);
