import incomeController from "./income.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import { withEntityType } from "../../middleware/upload.middleware";
import attachmentRoutes from "../attachment/attachment.routes"
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";

const router = express.Router();

router
  .route("/")
  .post(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INCOME_CREATE),
    handleError(incomeController.createIncome),
  )
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INCOME_READ),
    handleError(incomeController.getIncome),
  );
router
  .route("/:id")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INCOME_READ),
    handleError(incomeController.getSingleIncome),
  )
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INCOME_UPDATE),
    handleError(incomeController.updateIncome),
  )
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INCOME_DELETE),
    handleError(incomeController.deleteIncome),
  );

  router.use('/:entityId/attachments', withEntityType('income'), attachmentRoutes);

export default router;
