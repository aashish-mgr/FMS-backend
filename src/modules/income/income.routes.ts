import incomeController from "./income.controller";
import { handleError } from "../../middleware/errorHandler";
import express from "express";
import { withEntityType } from "../../middleware/upload.middleware";
import attachmentRoutes from "../attachment/attachment.routes"
import authGuard from "../../middleware/authGuard";

const router = express.Router();

router
  .route("/")
  .post(authGuard.isAuthenticated,handleError(incomeController.createIncome))
  .get(authGuard.isAuthenticated,handleError(incomeController.getIncome));
router
  .route("/:id")
  .get(authGuard.isAuthenticated,handleError(incomeController.getSingleIncome))
  .patch(authGuard.isAuthenticated,handleError(incomeController.updateIncome))
  .delete(authGuard.isAuthenticated,handleError(incomeController.deleteIncome));

  router.use('/:entityId/attachments', withEntityType('income'), attachmentRoutes);

export default router;
