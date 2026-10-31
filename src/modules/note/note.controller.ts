import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createNoteSchema, updateNoteSchema } from "./note.validation";
import { sendError, sendSuccess } from "../../utils/response";
import noteServices from "./note.services";
import { writeLog } from "../../services/audit.service";

class NoteController {
    async createNote(req: AuthRequest, res: Response) {
       const parsed = createNoteSchema.safeParse(req.body);
       if(!parsed.success) {
        return sendError(res,"Please provide valid input");
       }
       const userId = req.user?.id;
       const tenantId = req.user?.tenantId;
       if (!userId || !tenantId) {
         return sendError(res, "User authentication required", 401);
       }
       parsed.data.createdBy = userId;

       const data = await noteServices.create(parsed.data, tenantId);
       await writeLog({
         tenantId,
         userId,
         action: "NOTE_CREATED",
         entityType: "note",
         entityId: data.id,
         newValues: {data},
       });
       return sendSuccess(res,"Note created successfully",data);
    }

    async getNotes(req: AuthRequest, res: Response) {
       const tenantId = req.user?.tenantId;
       if (!tenantId) {
         return sendError(res, "User authentication required", 401);
       }

       const data = await noteServices.findAll(tenantId);

       return sendSuccess(res,"Notes fetched successfully",data);
    }

    async getSingleNote (req: AuthRequest, res: Response) {
        const {id} = req.params;
        const tenantId = req.user?.tenantId;
        if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const data = await noteServices.findById(id as string, tenantId);

        if(!data) {
            return sendError(res,"data not found")
        }
         return sendSuccess(res,"Note fetched successfully",data);
    }

    async updateNote(req: AuthRequest, res: Response) {
        const {id} = req.params;
        const tenantId = req.user?.tenantId;
         if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const parsed = updateNoteSchema.safeParse(req.body);
        if(!parsed.success) {
            return sendError(res,"please enter valid input")
        }
        const updatedData = await noteServices.update(id as string, tenantId, parsed.data);
        if(!updatedData) {
            return sendError(res, "note not found");
        }
        await writeLog({
          tenantId,
          userId: req.user?.id ?? null,
          action: "NOTE_UPDATED",
          entityType: "note",
          entityId: updatedData.id,
          newValues: {updatedData},
        });
        return sendSuccess(res,"Note updated successfully",updatedData);
    }

    async deleteNote(req: AuthRequest,res: Response) {
        const {id} = req.params
        const tenantId = req.user?.tenantId;
        if(!id) {
            return sendError(res,"id is required")
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }
        const deletedData = await noteServices.delete(id as string, tenantId);
        if (!deletedData) {
      return sendError(res, "record not found");
    }
    await writeLog({
      tenantId,
      userId: req.user?.id ?? null,
      action: "NOTE_DELETED",
      entityType: "note",
      entityId: deletedData.id,
    });
        return sendSuccess(res,"Note deleted successfully", deletedData);
    }

    async togglePin(req: AuthRequest, res: Response) {
        const {id} = req.params;
        const {isPinned} = req.body;
        const tenantId = req.user?.tenantId;
        if(!id || (isPinned === null)) {
            return sendError(res,"provide all detail");
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }

        const data = await noteServices.togglePin(id as string, tenantId, isPinned);
        if (!data) {
          return sendError(res, "note not found");
        }
        return sendSuccess(res,"successfully toggled isPinned",data);
    }

      async toggleArchive(req: AuthRequest, res: Response) {
        const {id} = req.params;
        const {isArchived} = req.body;
        const tenantId = req.user?.tenantId;
        if(!id || (isArchived === null)) {
            return sendError(res,"provide all detail");
        }
        if (!tenantId) {
          return sendError(res, "User authentication required", 401);
        }

        const data = await noteServices.toggleArchive(id as string, tenantId, isArchived);
        if (!data) {
          return sendError(res, "note not found");
        }
        return sendSuccess(res,"successfully toggled isArchived",data);
    }
}

export default new NoteController();
