import express from 'express'
import dashboardController from './dashboard.controller'
import authGuard from '../../middleware/authGuard';
import { handleError } from '../../middleware/errorHandler';

const router = express.Router();


router.route("/kpis").get(authGuard.isAuthenticated,handleError(dashboardController.getKpis));
router.route("/income-expense-chart").get(authGuard.isAuthenticated,handleError(dashboardController.getIncomeExpenseChart));
router.route("/income-by-category/:from/:to").get(authGuard.isAuthenticated,handleError(dashboardController.getIncomeByCategory));
router.route("/expense-by-category/:from/:to").get(authGuard.isAuthenticated,handleError(dashboardController.getExpenseByCategory));
router.route("/cash-flow/:year").get(authGuard.isAuthenticated,handleError(dashboardController.getMonthlyCashFlow));
router.route("/recent-transactions").get(authGuard.isAuthenticated,handleError(dashboardController.getRecentTransactions));
router.route("/upcoming-reminders").get(authGuard.isAuthenticated,handleError(dashboardController.getUpcomingRemainders));


export default router;