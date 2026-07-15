import { Request,Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation";
import { sendSuccess,sendError } from "../../utils/response";
import expenseService from "./expense.service";


class ExpenseController {
    async createExpense (req: AuthRequest,res: Response ) {
      
            const parsed = createExpenseSchema.safeParse(req.body);
            if(!parsed.success) {
               return sendError(res,"Please provide all the details")
            }

            const data = await expenseService.create(parsed.data)
          
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
    
      async updateExpense(req: Request, res: Response) {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
        return  sendError(res,"id is required");
        }
    
        const parsed = updateExpenseSchema.safeParse(req.body);
        if (!parsed.success) {
        return  sendError(res,"Invalid input");
        }
    
        const updatedData = await expenseService.update( parsed.data!,id as string);
        if (!updatedData) {
          return  sendError(res,"record not found");
        }
    
        return sendSuccess(res,"record updated successfully", updatedData);
      }
    
      // Was left as an incomplete stub (`async deleteIncome` with no body) in the
      // original incomeController.ts — implemented here as a soft delete to match
      // the project's paranoid-mode pattern used everywhere else.
      async deleteExpense(req: Request, res: Response) {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
         return  sendError(res,"id is required");
        }
    
        const deletedData = await expenseService.softDelete(id as string);
        if (!deletedData) {
          return sendError(res,"record not found");
        }
    
        return sendSuccess(res, "record deleted successfully", deletedData)
      }
}

export default new ExpenseController()