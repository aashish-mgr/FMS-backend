import { Request,Response } from "express";
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
       parsed.data.createdBy = userId as string;

       const data = await noteServices.create(parsed.data);
       await writeLog({ userId: req.user?.id ?? null, action: "NOTE_CREATED", entityType: "note",entityId: data.id, newValues: {data}});
       return sendSuccess(res,"Note created successfully",data);
    }

      async getNotes(req: Request, res: Response) {
      

       const data = await noteServices.findAll();

       return sendSuccess(res,"Notes fetched successfully",data);
    }

    async getSingleNote (req: Request, res: Response) {
        const {id} = req.params;
        if(!id) {
            return sendError(res,"id is required")
        }
        const data = await noteServices.findById(id as string);

        if(!data) {
            return sendError(res,"data not found")
        }
         return sendSuccess(res,"Note fetched successfully",data);
    }

    async updateNote(req: AuthRequest, res: Response) {
        const {id} = req.params;
         if(!id) {
            return sendError(res,"id is required")
        }
        const parsed = updateNoteSchema.safeParse(req.body);
        if(!parsed.success) {
            return sendError(res,"please enter valid input")
        }
        const updatedData = await noteServices.update(id as string, parsed.data);
        if(!updatedData) {
            return sendError(res, "note not found");
        }
        await writeLog({ userId: req.user?.id ?? null, action: "NOTE_UPDATED", entityType: "note",entityId: updatedData.id, newValues: {updatedData}});
        return sendSuccess(res,"Note updated successfully",updatedData);      
    }
    
    async deleteNote(req: AuthRequest,res: Response) {
        const {id} = req.params
        if(!id) {
            return sendError(res,"id is required")
        }
        const deletedData = await noteServices.delete(id as string);
        if (!deletedData) {
      return sendError(res, "record not found");
    }
    await writeLog({ userId: req.user?.id ?? null, action: "NOTE_DELETED", entityType: "note",entityId: deletedData.id});
        return sendSuccess(res,"Note deleted successfully", deletedData);
    }

    async togglePin(req: Request, res: Response) {
        const {id} = req.params;
        const {isPinned} = req.body;
        if(!id || (isPinned === null)) {
            return sendError(res,"provide all detail");
        }
        
        const data = await noteServices.togglePin(id as string, isPinned);
        return sendSuccess(res,"successfully toggled isPinned",data);
    }
    
      async toggleArchive(req: Request, res: Response) {
        const {id} = req.params;
        const {isArchived} = req.body;
        if(!id || (isArchived === null)) {
            return sendError(res,"provide all detail");
        }
        
        const data = await noteServices.toggleArchive(id as string, isArchived);
        return sendSuccess(res,"successfully toggled isArchived",data);
    }
}

export default new NoteController();