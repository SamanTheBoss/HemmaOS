import { Router } from "express";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

// Public routes (no auth required)
authRouter.get("/check", authController.check);
authRouter.post("/setup", authController.setup);
authRouter.post("/login", authController.login);

// Protected route
authRouter.patch("/settings", authController.updateSettings);
