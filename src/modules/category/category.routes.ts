import express from "express"
import categoryController from "./category.controller";
import authGuard from "../../middleware/authGuard";
import { handleError } from "../../middleware/errorHandler";
const router = express.Router();


router.route("/income").get(authGuard.isAuthenticated,handleError(categoryController.getIncomeCategories));
router.route("/expense").get(authGuard.isAuthenticated,handleError(categoryController.getExpenseCategories));

export default router;
