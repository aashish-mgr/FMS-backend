import express, { NextFunction,Request,Response } from "express";
import expenseController from "./expense.controller";
import { handleError } from "../../middleware/errorHandler";
import attachmentRoutes from '../attachment/attachment.routes';
import { withEntityType } from "../../middleware/upload.middleware";
const router = express.Router();



router
  .route("/")
  .post(handleError(expenseController.createExpense))
  .get(handleError(expenseController.getExpense));
router
  .route("/:id")
  .get(handleError(expenseController.getSingleExpense))
  .patch(handleError(expenseController.updateExpense))
  .delete(handleError(expenseController.deleteExpense));
  // in income.routes.ts, expense.routes.ts, reminder.routes.ts respectively:



router.use('/:entityId/attachments', withEntityType('expense'), attachmentRoutes);

  export default router;