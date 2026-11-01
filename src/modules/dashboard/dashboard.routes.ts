import express from 'express'
import dashboardController from './dashboard.controller'
import authGuard from '../../middleware/authGuard';
import requirePermission from '../../middleware/requirePermission';
import { PERMISSIONS } from '../../config/permissions';
import { handleError } from '../../middleware/errorHandler';

const router = express.Router();


router
  .route("/kpis")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getKpis),
  );
router
  .route("/income-expense-chart")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getIncomeExpenseChart),
  );
router
  .route("/income-by-category/:from/:to")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getIncomeByCategory),
  );
router
  .route("/expense-by-category/:from/:to")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getExpenseByCategory),
  );
router
  .route("/cash-flow/:year")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getMonthlyCashFlow),
  );
router
  .route("/recent-transactions")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getRecentTransactions),
  );
router
  .route("/upcoming-reminders")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.DASHBOARD_READ),
    handleError(dashboardController.getUpcomingRemainders),
  );


export default router;