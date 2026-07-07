import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authMiddleware, requireParent } from "../../shared/middleware/auth.js";

export const authRouter = Router();

// Public routes (no auth required)
authRouter.get("/check", authController.check);
authRouter.post("/setup", authController.setup);
authRouter.post("/login", authController.login);

// Authenticated routes (this router is mounted before the global auth
// middleware, so protect these individually).
authRouter.get("/me", authMiddleware, authController.me);
authRouter.patch("/settings", authMiddleware, authController.updateSettings);

// Family members — viewing is authed, managing is parent-only.
authRouter.get("/users", authMiddleware, authController.listUsers);
authRouter.post("/users", authMiddleware, requireParent, authController.addUser);
authRouter.delete(
  "/users/:id",
  authMiddleware,
  requireParent,
  authController.deleteUser,
);
