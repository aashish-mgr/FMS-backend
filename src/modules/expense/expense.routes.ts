import express, { NextFunction,Request,Response } from "express";
import expenseController from "./expense.controller";
import { handleError } from "../../middleware/errorHandler";
import attachmentRoutes from '../attachment/attachment.routes';
import { withEntityType } from "../../middleware/upload.middleware";
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
const router = express.Router();



router
  .route("/")
  .post(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.EXPENSE_CREATE),
    handleError(expenseController.createExpense),
  )
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.EXPENSE_READ),
    handleError(expenseController.getExpense),
  );
router
  .route("/:id")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.EXPENSE_READ),
    handleError(expenseController.getSingleExpense),
  )
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.EXPENSE_UPDATE),
    handleError(expenseController.updateExpense),
  )
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.EXPENSE_DELETE),
    handleError(expenseController.deleteExpense),
  );
  // in income.routes.ts, expense.routes.ts, reminder.routes.ts respectively:



router.use('/:entityId/attachments', withEntityType('expense'), attachmentRoutes);

  export default router;