import express, { NextFunction,Request,Response } from "express";
import expenseController from "./expense.controller";
import { handleError } from "../../middleware/errorHandler";
import attachmentRoutes from '../attachment/attachment.routes';
import { withEntityType } from "../../middleware/upload.middleware";
import authGuard from "../../middleware/authGuard";
const router = express.Router();



router
  .route("/")
  .post(authGuard.isAuthenticated,handleError(expenseController.createExpense))
  .get(authGuard.isAuthenticated,handleError(expenseController.getExpense));
router
  .route("/:id")
  .get(authGuard.isAuthenticated,handleError(expenseController.getSingleExpense))
  .patch(authGuard.isAuthenticated,handleError(expenseController.updateExpense))
  .delete(authGuard.isAuthenticated,handleError(expenseController.deleteExpense));
  // in income.routes.ts, expense.routes.ts, reminder.routes.ts respectively:



router.use('/:entityId/attachments', withEntityType('expense'), attachmentRoutes);

  export default router;