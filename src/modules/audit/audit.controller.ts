import { sendError, sendSuccess } from "../../utils/response";
import auditService from "./audit.service";
import { AuditSchema } from "./audit.validation";
import { Request,Response } from "express";

class AuditController {
    async listAudits(req: Request,res: Response) {
        const parsed = AuditSchema.safeParse(req.query);
        if (!parsed.success) {
            return sendError(res,"Invalid query",400,{error: parsed.error.errors})
        }

        const {records, meta} = await auditService.listAudit(parsed.data);
        return sendSuccess(res,"Audit fetched",{records,meta});
    }
}

export default new AuditController();