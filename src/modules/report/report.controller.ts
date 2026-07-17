import { Request, Response, NextFunction } from "express";
import * as reportService from "./report.service";
import { generateIncomeCsv, generateExpenseCsv } from "../../services/export/csv.service";
import { generateIncomeExcel, generateExpenseExcel } from "../../services/export/excel.service";
import { generateIncomeExcelPdf, generateExpenseExcelPdf } from "../../services/export/pdf.service";

import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

type Format = "json" | "pdf" | "excel" | "csv";

function parseFormat(raw: unknown): Format {
  const format = (raw as string) ?? "json";
  if (!["json", "pdf", "excel", "csv"].includes(format)) {
    throw new AppError( "VALIDATION_ERROR", "format must be one of: json, pdf, excel, csv");
  }
  return format as Format;
}

class reportController {
 async  incomeReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, category_id, payment_method } = req.query as Record<string, string>;
    const format = parseFormat(req.query.format);
    const records = await reportService.getIncomeReport({ from, to, category_id, payment_method }  as any);

  

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

   async  expenseReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to, category_id, payment_method } = req.query as Record<string, string>;
    const format = parseFormat(req.query.format);
    const records = await reportService.getExpenseReport({ from, to, category_id, payment_method } as any);

   

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

  async profitLossReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as Record<string, string>;
    const result = await reportService.getProfitLossReport({ from, to } as any);

    

    return sendSuccess(res, "report fetched successfully",result);
  } catch (err) {
    return next(err);
  }
}
}

export default new reportController();