import type { Response } from "express";
import { writeLog } from "../../services/audit.service";
import type { AuthRequest } from "../../types/authTypes";
import { sendError, sendSuccess } from "../../utils/response";
import invitationService from "./invitation.service";
import { inviteMemberSchema } from "./workspace.validation";

function getTenantId(req: AuthRequest) {
  return req.tenantId ?? req.user?.tenantId ?? null;
}

class InvitationController {
  async createInvitation(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    const inviterId = req.user?.id;

    if (!tenantId || !inviterId) {
      return sendError(res, "User authentication required", 401);
    }

    const parsed = inviteMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await invitationService.createInvitation(
      tenantId,
      inviterId,
      parsed.data,
    );

    await writeLog({
      tenantId,
      userId: inviterId,
      action: "MEMBER_INVITED",
      entityType: "invitation",
      entityId: result.invitation.id,
      newValues: {
        email: result.invitation.email,
        role: result.invitation.role,
      },
    });

    return sendSuccess(
      res,
      "invitation created successfully",
      { ...result.invitation, token: result.token },
      201,
    );
  }

  async listInvitations(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const invitations = await invitationService.listInvitations(tenantId);
    return sendSuccess(res, "invitations fetched successfully", invitations);
  }

  async revokeInvitation(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    const invitationId = req.params.invitationId;

    if (!tenantId || !userId) {
      return sendError(res, "User authentication required", 401);
    }

    if (!invitationId || Array.isArray(invitationId)) {
      return sendError(res, "invitationId is required");
    }

    const invitation = await invitationService.revokeInvitation(
      tenantId,
      invitationId,
    );

    await writeLog({
      tenantId,
      userId,
      action: "MEMBER_INVITATION_REVOKED",
      entityType: "invitation",
      entityId: invitation.id,
      oldValues: {
        email: invitation.email,
        role: invitation.role,
      },
    });

    return sendSuccess(res, "invitation revoked successfully", invitation);
  }
}

export default new InvitationController();
