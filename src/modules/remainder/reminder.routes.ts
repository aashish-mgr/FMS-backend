import remainderController from "./remainder.controller";
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
import express from "express";
import { handleError } from "../../middleware/errorHandler";
import { withEntityType } from "../../middleware/upload.middleware";
import attachmentRoutes from "../attachment/attachment.routes"
const router = express.Router();

router
  .route("/")
  .post(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_CREATE),
    handleError(remainderController.createRemainder),
  )
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_READ),
    handleError(remainderController.getRemainders),
  );
router
  .route("/:id")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_READ),
    handleError(remainderController.getSingleRemainder),
  )
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_UPDATE),
    handleError(remainderController.updateRemainder),
  )
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_DELETE),
    handleError(remainderController.deleteRemainder),
  )

router
  .route("/:id/complete")
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.REMINDER_UPDATE),
    handleError(remainderController.markCompleteHandler),
  )


  router.use('/:entityId/attachments', withEntityType('reminder'), attachmentRoutes);
  export default router;