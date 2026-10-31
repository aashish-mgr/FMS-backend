import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createRemainderSchema, updateRemainderSchema } from "./remainder.validation";
import { sendError, sendSuccess } from "../../utils/response";
import remainderServices from "./remainder.services";
import { writeLog } from "../../services/audit.service";

class remainderController {
    async createRemainder(req: AuthRequest, res: Response) {
       const parsed = createRemainderSchema.safeParse(req.body);
       if(!parsed.success) {
        return sendError(res,"Please provide valid input");
       }
       const userId = req.user?.id;
       const tenantId = req.user?.tenantId;
       if (!userId || !tenantId) {
         return sendError(res, "User authentication required", 401);
       }
       parsed.data.createdBy = userId;

       const data = await remainderServices.create(parsed.data, tenantId);
       await writeLog({
         tenantId,
         userId,
         action: "REMINDER_CREATED",
         entityType: "reminder",
         entityId: data.id,
         newValues: {data},
       });
       return sendSuccess(res,"remainder created successfully",data);
    }

    async getRemainders(req: AuthRequest, res: Response) {
       const tenantId = req.user?.tenantId;
       if (!tenantId) {
         return sendError(res, "User authentication required", 401);
       }

       const data = await remainderServices.findAll(tenantId);

       return sendSuccess(res,"remainders fetched successfully",data);
    }

    async getSingleRemainder (req: AuthRequest, res: Response) {
        const {id} = req.params;
        const tenantId = req.user?.tenantId;
        if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const data = await remainderServices.findById(id as string, tenantId);

        if(!data) {
            return sendError(res,"data not found")
        }
         return sendSuccess(res,"remainder fetched successfully",data);
    }

    async updateRemainder(req: AuthRequest, res: Response) {
        const {id} = req.params;
        const tenantId = req.user?.tenantId;
         if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const parsed = updateRemainderSchema.safeParse(req.body);
        if(!parsed.success) {
            return sendError(res,"please enter valid input")
        }
        const updatedData = await remainderServices.update(id as string, tenantId, parsed.data);
        if(!updatedData) {
            return sendError(res, "remainder not found");
        }
        await writeLog({
          tenantId,
          userId: req.user?.id ?? null,
          action: "REMINDER_UPDATED",
          entityType: "reminder",
          entityId: updatedData.id,
          newValues: {updatedData},
        });
        return sendSuccess(res,"remainder updated successfully",updatedData);
    }

    async deleteRemainder(req: AuthRequest,res: Response) {
        const {id} = req.params
        const tenantId = req.user?.tenantId;
        if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const deletedData = await remainderServices.delete(id as string, tenantId);
        if (!deletedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId: req.user?.id ?? null,
      action: "REMINDER_DELETED",
      entityType: "reminder",
      entityId:deletedData.id,
    });
        return sendSuccess(res,"remainder deleted successfully", deletedData);
    }

    async markCompleteHandler(req: AuthRequest,res: Response) {
        const {id} = req.params;
        const tenantId = req.user?.tenantId;
       if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }

        const data = await remainderServices.markComplete(id as string, tenantId);
        if(!data) {
             return sendError(res, "record not found");
        }
        await writeLog({
          tenantId,
          userId: req.user?.id ?? null,
          action: "REMINDER_COMPLETED",
          entityType: "reminder",
          entityId: data.id,
          oldValues: {data},
        });
        return sendSuccess(res,"successfully updated status",data);
    }
}

export default new remainderController();
