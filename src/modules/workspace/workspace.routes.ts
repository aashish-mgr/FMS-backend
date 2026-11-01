import express from "express";
import workspaceController from "./workspace.controller";
import authGuard from "../../middleware/authGuard";
import requireRole from "../../middleware/requireRole";
import { handleError } from "../../middleware/errorHandler";

const router = express.Router();

router
  .route("/")
  .get(authGuard.isAuthenticated, handleError(workspaceController.getCurrentWorkspace))
  .patch(
    authGuard.isAuthenticated,
    requireRole("admin", "superAdmin"),
    handleError(workspaceController.updateCurrentWorkspace),
  );

export default router;
