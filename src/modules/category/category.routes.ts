import express from "express"
import categoryController from "./category.controller";
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
import { handleError } from "../../middleware/errorHandler";
const router = express.Router();


router
  .route("/income")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.CATEGORY_READ),
    handleError(categoryController.getIncomeCategories),
  );
router
  .route("/expense")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.CATEGORY_READ),
    handleError(categoryController.getExpenseCategories),
  );

export default router;
