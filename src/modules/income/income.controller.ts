import { Request, Response } from "express";
import incomeService from "./income.service";
import { sendError,sendSuccess } from "../../utils/response";
import { createIncomeSchema, updateIncomeSchema } from "./income.validation";

class IncomeController {
  async createIncome(req: Request, res: Response) {
    const parsed = createIncomeSchema.safeParse(req.body);
    if (!parsed.success) {
       return sendError(res,"Please provide all the details")
    }

    const data = await incomeService.create(parsed.data);

  return sendSuccess(res,"Income created successfully", data);
  }

  async getIncome(req: Request, res: Response) {
    const data = await incomeService.findAll();
    if (!data) {
              sendError(res,"income records not found")

    }

    sendSuccess(res,"fetched income records",data);
  }

  async getSingleIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      sendError(res,"id is required");
    }

    const data = await incomeService.findById(id as string);
    if (!data) {
      sendError(res,"record not found");
    }

    sendSuccess(res,"record fetched successfully",data);
  }

  async updateIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      sendError(res,"id is required");
    }

    const parsed = updateIncomeSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res,"Invalid input");
    }

    const updatedData = await incomeService.update(id as string, parsed.data!);
    if (!updatedData) {
       sendError(res,"record not found");
    }

   sendSuccess(res,"record updated successfully", updatedData);
  }

  // Was left as an incomplete stub (`async deleteIncome` with no body) in the
  // original incomeController.ts — implemented here as a soft delete to match
  // the project's paranoid-mode pattern used everywhere else.
  async deleteIncome(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
       sendError(res,"id is required");
    }

    const deletedData = await incomeService.softDelete(id as string);
    if (!deletedData) {
      sendError(res,"record not found");
    }

   sendSuccess(res, "record deleted successfully", deletedData)
  }
}

export default new IncomeController();
