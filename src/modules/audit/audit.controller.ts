import { sendError, sendSuccess } from "../../utils/response";
import auditService from "./audit.service";
import { AuditSchema } from "./audit.validation";
import { Response } from "express";
import { AuthRequest } from "../../types/authTypes";

class AuditController {
    async listAudits(req: AuthRequest,res: Response) {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
            return sendError(res, "User authentication required", 401);
        }

        const parsed = AuditSchema.safeParse(req.query);
        if (!parsed.success) {
            return sendError(res,"Invalid query",400,{error: parsed.error.errors})
        }

        const {records, meta} = await auditService.listAudit(parsed.data, tenantId);
        return sendSuccess(res,"Audit fetched",{records,meta});
    }
}

export default new AuditController();
