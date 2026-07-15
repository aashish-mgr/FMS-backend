import express from "express";
import expenseController from "./expense.controller";
import { handleError } from "../../middleware/errorHandler";
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

  export default router;