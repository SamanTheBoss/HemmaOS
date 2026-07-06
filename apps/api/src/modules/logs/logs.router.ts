import { Router } from "express";
import * as logsController from "./logs.controller.js";

export const logsRouter = Router();

logsRouter.get("/containers", logsController.listContainers);
logsRouter.get("/:container", logsController.getLogs);
logsRouter.get("/:container/stream", logsController.streamLogs);
