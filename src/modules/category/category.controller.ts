import { sendError, sendSuccess } from "../../utils/response";
import categoryService from "./category.service";
import { Request,Response } from "express";

class CategoryController {
    async getIncomeCategories(req: Request,res:Response) {
        const data = await categoryService.getIncomeCategory();
        if(!data) {
            return sendError(res,"Categories not found");
        }
        return sendSuccess(res,"Income category fetched successfully",data);

    }

    async getExpenseCategories(req: Request,res: Response) {
        const data = await categoryService.getExpenseCategory();
        if(!data) {
            return sendError(res,"Categories not found");
        }
        return sendSuccess(res,"Expense category fetched successfully",data);
    }
 }

 export default new CategoryController();