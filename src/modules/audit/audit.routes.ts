import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
import { handleError } from "../../middleware/errorHandler";
import auditController from "./audit.controller";
import express from 'express'
const router = express.Router();

router
  .route("/")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.AUDIT_READ),
    handleError(auditController.listAudits),
  );

export default router;