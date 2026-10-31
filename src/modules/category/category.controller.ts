import { sendError, sendSuccess } from "../../utils/response";
import categoryService from "./category.service";
import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";

class CategoryController {
    async getIncomeCategories(req: AuthRequest,res:Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const data = await categoryService.getIncomeCategory(tenantId);
        if(!data) {
            return sendError(res,"Categories not found");
        }
        return sendSuccess(res,"Income category fetched successfully",data);

    }

    async getExpenseCategories(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const data = await categoryService.getExpenseCategory(tenantId);
        if(!data) {
            return sendError(res,"Categories not found");
        }
        return sendSuccess(res,"Expense category fetched successfully",data);
    }
 }

 export default new CategoryController();
