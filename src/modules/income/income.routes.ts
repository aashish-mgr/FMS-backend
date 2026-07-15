import incomeController from "./income.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import { withEntityType } from "../../middleware/upload.middleware";
import attachmentRoutes from "../attachment/attachment.routes"

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

  router.use('/:entityId/attachments', withEntityType('income'), attachmentRoutes);

export default router;
