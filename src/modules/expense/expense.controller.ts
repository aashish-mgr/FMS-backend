import { Request,Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";
import { sendSuccess,sendError } from "../../utils/response";
import expenseService from "./expense.service";
import { writeLog } from "../../services/audit.service";


class ExpenseController {
    async createExpense (req: AuthRequest,res: Response ) {
      
            const parsed = createExpenseSchema.safeParse(req.body);
            if(!parsed.success) {
               return sendError(res,"Please provide all the details")
            }
            const userId = req.user?.id;
            if (!userId) {
                return sendError(res, "User authentication required")
            }
            parsed.data.createdBy = userId;

            const data = await expenseService.create(parsed.data)
            await writeLog({ userId: req.user?.id ?? null, action: "EXPENSE_CREATED", entityType: "expense",entityId: data.id,newValues: {data}});
          
            return sendSuccess(res,"Expense created successfully", data);

    }
    async getExpense(req: Request, res: Response) {
        const data = await expenseService.findAll();
        if (!data) {
         return sendError(res,"expense records not found")
        }
    
       return  sendSuccess(res,"fetched expense records",data);
      }
    
      async getSingleExpense(req: Request, res: Response) {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
         return  sendError(res,"id is required");
        }
    
        const data = await expenseService.findById(id as string);
        if (!data) {
        return   sendError(res,"record not found");
        }
    
       return sendSuccess(res,"record fetched successfully",data);
      }
    
      async updateExpense(req: AuthRequest, res: Response) {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
        return  sendError(res,"id is required");
        }

        const data = await expenseService.findById(id);
        if(!data) {
          return sendError(res,"Record doesnot exist")
        }
    
        const parsed = updateExpenseSchema.safeParse(req.body);
        if (!parsed.success) {
        return  sendError(res,"Invalid input");
        }
        const userId = req.user?.id;
         if (!userId) {
                return sendError(res, "User authentication required")
            }
            parsed.data.updatedBy = userId;
    
        const updatedData = await expenseService.update( parsed.data!,id as string);
        if (!updatedData) {
          return  sendError(res,"record not found");
        }
        await writeLog({ userId: req.user?.id ?? null, action: "EXPENSE_UPDATED", entityType: "expense",entityId: updatedData.id,newValues: {updatedData},oldValues: {data}});
        return sendSuccess(res,"record updated successfully", updatedData);
      }
    
      // Was left as an incomplete stub (`async deleteIncome` with no body) in the
      // original incomeController.ts — implemented here as a soft delete to match
      // the project's paranoid-mode pattern used everywhere else.
      async deleteExpense(req: AuthRequest, res: Response) {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
         return  sendError(res,"id is required");
        }
    
        const deletedData = await expenseService.softDelete(id as string);
        if (!deletedData) {
          return sendError(res,"record not found");
        }
       await writeLog({ userId: req.user?.id ?? null, action: "EXPENSE_DELETED", entityType: "expense",entityId: deletedData.id});
        return sendSuccess(res, "record deleted successfully", deletedData)
      }
}

export default new ExpenseController()