import { Request,Response } from "express";
import { AuthRequest } from "../../types/authTypes";
import { createNoteSchema, updateNoteSchema } from "./note.validation";
import { sendError, sendSuccess } from "../../utils/response";
import noteServices from "./note.services";


class NoteController {
    async createNote(req: AuthRequest, res: Response) {
       const parsed = createNoteSchema.safeParse(req.body);
       if(!parsed.success) {
        return sendError(res,"Please provide valid input");
       }
       const userId = req.user?.id;
       parsed.data.createdBy = userId as string;

       const data = await noteServices.create(parsed.data);

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
        return sendSuccess(res,"Note updated successfully",updatedData);      
    }
    
    async deleteNote(req: Request,res: Response) {
        const {id} = req.params
        if(!id) {
            return sendError(res,"id is required")
        }
        const deletedData = await noteServices.delete(id as string);
        if (!deletedData) {
      return sendError(res, "record not found");
    }
        return sendSuccess(res,"Note deleted successfully", deletedData);
    }
}

export default new NoteController();