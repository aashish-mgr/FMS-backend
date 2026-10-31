import { Request, Response, NextFunction } from "express";
import * as reportService from "./report.service";
import { generateIncomeCsv, generateExpenseCsv ,generateProfitLossCsv} from "../../services/export/csv.service";
import { generateIncomeExcel, generateExpenseExcel,generateProfitLossExcel } from "../../services/export/excel.service";
import { generateIncomeExcelPdf, generateExpenseExcelPdf,generateProfitLossPdf } from "../../services/export/pdf.service";
import { writeLog } from "../../services/audit.service";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";
import { AuthRequest } from "../../types/authTypes";

type Format = "json" | "pdf" | "excel" | "csv";

function parseFormat(raw: unknown): Format {
  const format = (raw as string) ?? "json";
  if (!["json", "pdf", "excel", "csv"].includes(format)) {
    throw new AppError( "VALIDATION_ERROR", "format must be one of: json, pdf, excel, csv");
  }
  return format as Format;
}

class reportController {
 async  incomeReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new AppError("UNAUTHORIZED", "User authentication required", 401);

    const { from, to, categoryId, paymentMethod } = req.query as Record<string, string>;
    const format = parseFormat(req.query.format);
    const records = await reportService.getIncomeReport(tenantId, { from, to, categoryId, paymentMethod }  as any);

     await writeLog({ tenantId, userId: req.user?.id ?? null, action: "REPORT_EXPORTED", entityType: "income_report", newValues: { format } });

    if (format === "json") return sendSuccess(res,"report fetched successfully",records);

    if (format === "csv") {
      const csv = generateIncomeCsv(records);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=income-report.csv");
      return res.send(csv);
    }

    if (format === "excel") {
      const buffer = await generateIncomeExcel(records);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=income-report.xlsx");
      return res.send(buffer);
    }

    // pdf
    const buffer = await generateIncomeExcelPdf(records, "Income Report");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=income-report.pdf");
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

   async  expenseReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new AppError("UNAUTHORIZED", "User authentication required", 401);

    const { from, to, categoryId, paymentMethod } = req.query as Record<string, string>;
    const format = parseFormat(req.query.format);
    const records = await reportService.getExpenseReport(tenantId, { from, to, categoryId, paymentMethod } as any);

    await writeLog({ tenantId, userId: req.user?.id ?? null, action: "REPORT_EXPORTED", entityType: "expense_report", newValues: { format } });

    if (format === "json") return sendSuccess(res, "reports fetched successfully",records);

    if (format === "csv") {
      const csv = generateExpenseCsv(records);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=expense-report.csv");
      return res.send(csv);
    }

    if (format === "excel") {
      const buffer = await generateExpenseExcel(records);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=expense-report.xlsx");
      return res.send(buffer);
    }

    // pdf
    const buffer = await generateExpenseExcelPdf(records, "Expense Report");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=expense-report.pdf");
    return res.send(buffer);
  } catch (err) {
    return next(err);
  }
}

  async profitLossReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new AppError("UNAUTHORIZED", "User authentication required", 401);

    const { from, to } = req.query as Record<string, string>;
    const format = parseFormat(req.query.format);
    const result = await reportService.getProfitLossReport(tenantId, { from, to } as any);

     await writeLog({ tenantId, userId: req.user?.id ?? null, action: "REPORT_EXPORTED", entityType: "profit_loss_report"});
     if (format === "json") return sendSuccess(res, "reports fetched successfully",result);

    if (format === "csv") {
      const csv = generateProfitLossCsv(result);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=profit-loss-report.csv");
      return res.send(csv);
    }

    if (format === "excel") {
      const buffer = await generateProfitLossExcel(result);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=profit-loss-report.xlsx");
      return res.send(buffer);
    }
 
      const buffer = await generateProfitLossPdf(result, "Profit Loss Report");
      res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=profit-loss-report.pdf");
    return res.send(buffer);
      
    
    
  } catch (err) {
    return next(err);
  }
}
}

export default new reportController();