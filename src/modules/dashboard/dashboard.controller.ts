import { success } from "zod/v4";
import { sendError, sendSuccess } from "../../utils/response";
import dashboardService from "./dashboard.service";
import { Request,Response } from "express";

const Period = ["daily","weekly","monthly","yearly"];
class DashboardController {
    async getKpis(req: Request,res: Response) {
        const data = await dashboardService.getAllKpis();
        if(!data) {
            return sendError(res,"Kpi not fetched");
        }
        sendSuccess(res,"Kpi fetched successfully", data);
    }

    async getIncomeExpenseChart(req: Request,res: Response) {
        const period = req.query?.period;
        if(!Period.includes(period as string)) { 
           return sendError(res,"Invalid Period");
        }
        const data = await dashboardService.getIncomeExpenseChart(period as any);
        if(!data) {
            return sendError(res,"data not fetched");
        }
        return sendSuccess(res,"Chart data fetched successfully",data);
    }

    async getIncomeByCategory(req: Request,res: Response) {
      const { from, to } = req.params as unknown as { from: string; to: string };
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const data = await dashboardService.getIncomeByCategory(fromDate, toDate);
      if (!data) {
        return sendError(res, "Income by category data not fetched");
      }
      return sendSuccess(res, "Income by category fetched successfully", data);
    }

     async getExpenseByCategory(req: Request,res: Response) {
      const { from, to } = req.params as unknown as { from: string; to: string };
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const data = await dashboardService.getExpenseByCategory(fromDate, toDate);
      if (!data) {
        return sendError(res, "Expense by category data not fetched");
      }
      return sendSuccess(res, "Expense by category fetched successfully", data);
    }

    async getMonthlyCashFlow(req: Request,res: Response) {
        const {year} = req.params as unknown as {year: number}
        if(!year) {
            return sendError(res,"year is required");
        }
        const data = await dashboardService.getMonthlyCashFlow(year);
        if (!data) {
        return sendError(res, "cash flow data not fetched");
      }
      return sendSuccess(res, "cash flow fetched successfully", data);
    }

     async getRecentTransactions(req: Request,res: Response) {
        const data = await dashboardService.getRecentTransactions();
        if (!data) {
        return sendError(res, "recent transactions data not fetched");
      }
      return sendSuccess(res, "recent transactions fetched successfully", data);
    }

    async getUpcomingRemainders(req: Request,res: Response) {
        const data = await dashboardService.getUpcomingReminders();
        if (!data) {
        return sendError(res, "reminders data not fetched");
      }
      return sendSuccess(res, "reminders fetched successfully", data);
    }
    
     
    }

    export default new DashboardController();
