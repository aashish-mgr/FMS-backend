import { sendError, sendSuccess } from "../../utils/response";
import dashboardService from "./dashboard.service";
import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";

const Period = ["daily","weekly","monthly","yearly"];
class DashboardController {
    async getKpis(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const data = await dashboardService.getAllKpis(tenantId);
        if(!data) {
            return sendError(res,"Kpi not fetched");
        }
        return sendSuccess(res,"Kpi fetched successfully", data);
    }

    async getIncomeExpenseChart(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const period = req.query?.period;
        if(!Period.includes(period as string)) { 
           return sendError(res,"Invalid Period");
        }
        const data = await dashboardService.getIncomeExpenseChart(tenantId, period as any);
        if(!data) {
            return sendError(res,"data not fetched");
        }
        return sendSuccess(res,"Chart data fetched successfully",data);
    }

    async getIncomeByCategory(req: AuthRequest,res: Response) {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return sendError(res, "User authentication required", 401);
      }

      const { from, to } = req.params as unknown as { from: string; to: string };
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const data = await dashboardService.getIncomeByCategory(tenantId, fromDate, toDate);
      if (!data) {
        return sendError(res, "Income by category data not fetched");
      }
      return sendSuccess(res, "Income by category fetched successfully", data);
    }

     async getExpenseByCategory(req: AuthRequest,res: Response) {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return sendError(res, "User authentication required", 401);
      }

      const { from, to } = req.params as unknown as { from: string; to: string };
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const data = await dashboardService.getExpenseByCategory(tenantId, fromDate, toDate);
      if (!data) {
        return sendError(res, "Expense by category data not fetched");
      }
      return sendSuccess(res, "Expense by category fetched successfully", data);
    }

    async getMonthlyCashFlow(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const {year} = req.params as unknown as {year: number}
        if(!year) {
            return sendError(res,"year is required");
        }
        const data = await dashboardService.getMonthlyCashFlow(tenantId, year);
        if (!data) {
        return sendError(res, "cash flow data not fetched");
      }
      return sendSuccess(res, "cash flow fetched successfully", data);
    }

     async getRecentTransactions(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const data = await dashboardService.getRecentTransactions(tenantId);
        if (!data) {
        return sendError(res, "recent transactions data not fetched");
      }
      return sendSuccess(res, "recent transactions fetched successfully", data);
    }

    async getUpcomingRemainders(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const data = await dashboardService.getUpcomingReminders(tenantId);
        if (!data) {
        return sendError(res, "reminders data not fetched");
      }
      return sendSuccess(res, "reminders fetched successfully", data);
    }
    
     
    }

    export default new DashboardController();
