import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { requireParent } from "../../shared/middleware/auth.js";
import { supportToggleRequestSchema } from "@hemmaos/shared";
import * as supportController from "./support.controller.js";

export const supportRouter = Router();

supportRouter.get("/status", supportController.status);

supportRouter.post(
  "/toggle",
  requireParent,
  validate(supportToggleRequestSchema),
  supportController.toggle,
);
