import express from 'express'
import reportController from './report.controller';
import authGuard from "../../middleware/authGuard";
import { handleError } from '../../middleware/errorHandler';
const router = express.Router();


// const router = Router();
// router.use(authGuard);

// router.get("/income", incomeReportHandler);
// router.get("/expense", expenseReportHandler);
// router.get("/profit-loss", profitLossReportHandler);
router.route("/income").get(authGuard.isAuthenticated,handleError(reportController.incomeReport));
router.route("/expense").get(authGuard.isAuthenticated,handleError(reportController.expenseReport));
router.route("/profit-loss").get(authGuard.isAuthenticated,handleError(reportController.profitLossReport));

export default router;