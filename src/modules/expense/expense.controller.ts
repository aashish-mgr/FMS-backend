import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";
import { sendSuccess,sendError } from "../../utils/response";
import expenseService from "./expense.service";
import { writeLog } from "../../services/audit.service";

class ExpenseController {
  async createExpense(req: AuthRequest, res: Response) {
    const parsed = createExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Please provide all the details")
    }

    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) {
      return sendError(res, "User authentication required", 401)
    }

    parsed.data.createdBy = userId;

    const data = await expenseService.create(parsed.data, tenantId)
    await writeLog({
      tenantId,
      userId,
      action: "EXPENSE_CREATED",
      entityType: "expense",
      entityId: data.id,
      newValues: { data },
    });

    return sendSuccess(res, "Expense created successfully", data);
  }

  async getExpense(req: AuthRequest, res: Response) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return sendError(res, "User authentication required", 401)
    }

    const data = await expenseService.findAll(tenantId);
    if (!data) {
      return sendError(res, "expense records not found")
    }

    return sendSuccess(res, "fetched expense records", data);
  }

  async getSingleExpense(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401)
    }

    const data = await expenseService.findById(id as string, tenantId);
    if (!data) {
      return sendError(res, "record not found");
    }

    return sendSuccess(res, "record fetched successfully", data);
  }

  async updateExpense(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401)
    }

    const data = await expenseService.findById(id, tenantId);
    if(!data) {
      return sendError(res, "Record doesnot exist")
    }

    const parsed = updateExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Invalid input");
    }

    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "User authentication required")
    }
    parsed.data.updatedBy = userId;

    const updatedData = await expenseService.update(id, tenantId, parsed.data);
    if (!updatedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId,
      action: "EXPENSE_UPDATED",
      entityType: "expense",
      entityId: updatedData.id,
      newValues: { updatedData },
      oldValues: { data },
    });
    return sendSuccess(res, "record updated successfully", updatedData);
  }

  async deleteExpense(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401)
    }

    const deletedData = await expenseService.softDelete(id as string, tenantId);
    if (!deletedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId: req.user?.id ?? null,
      action: "EXPENSE_DELETED",
      entityType: "expense",
      entityId: deletedData.id,
    });
    return sendSuccess(res, "record deleted successfully", deletedData)
  }
}

export default new ExpenseController()
