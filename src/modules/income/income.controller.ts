import { Response } from "express";
import incomeService from "./income.service";
import { sendError,sendSuccess } from "../../utils/response";
import { createIncomeSchema, updateIncomeSchema } from "./income.validation";
import { AuthRequest } from "../../types/authTypes";
import { writeLog } from "../../services/audit.service";

class IncomeController {
  async createIncome(req: AuthRequest, res: Response) {
    const parsed = createIncomeSchema.safeParse(req.body);
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId;
    if (!userId || !tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    if (!parsed.success) {
      return sendError(res, "Please provide all the details");
    }

    parsed.data.createdBy = userId;

    const data = await incomeService.create(parsed.data, tenantId);

    await writeLog({
      tenantId,
      userId,
      action: "INCOME_CREATED",
      entityType: "income",
      entityId: data.id,
      newValues: { data },
    });

    return sendSuccess(res, "Income created successfully", data);
  }

  async getIncome(req: AuthRequest, res: Response) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const data = await incomeService.findAll(tenantId);
    if (!data) {
      return sendError(res, "income records not found");
    }

    return sendSuccess(res, "fetched income records", data);
  }

  async getSingleIncome(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const data = await incomeService.findById(id as string, tenantId);
    if (!data) {
      return sendError(res, "record not found");
    }

    return sendSuccess(res, "record fetched successfully", data);
  }

  async updateIncome(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const data = await incomeService.findById(id, tenantId);
    if(!data) {
      return sendError(res,"Record doesnot exist")
    }

    const parsed = updateIncomeSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Invalid input");
    }
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "User authentication required")
    }
    parsed.data.updatedBy = userId;

    const updatedData = await incomeService.update(id, tenantId, parsed.data);
    if (!updatedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId,
      action: "INCOME_UPDATED",
      entityType: "income",
      entityId: updatedData.id,
      newValues: { updatedData },
      oldValues: { data },
    });

    return sendSuccess(res, "record updated successfully", updatedData);
  }

  async deleteIncome(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;
    if (!id || Array.isArray(id)) {
      return sendError(res, "id is required");
    }
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const deletedData = await incomeService.softDelete(id as string, tenantId);
    if (!deletedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId: req.user?.id ?? null,
      action: "INCOME_DELETED",
      entityType: "income",
      entityId: deletedData.id,
    });
    return sendSuccess(res, "record deleted successfully", deletedData);
  }
}

export default new IncomeController();
