import incomeController from "./income.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";

const router = express.Router();

router
  .route("/")
  .post(handleError(incomeController.createIncome))
  .get(handleError(incomeController.getIncome));
router
  .route("/:id")
  .get(handleError(incomeController.getSingleIncome))
  .patch(handleError(incomeController.updateIncome))
  .delete(handleError(incomeController.deleteIncome));

export default router;
