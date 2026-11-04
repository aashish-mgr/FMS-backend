import type { Response } from "express";
import { writeLog } from "../../services/audit.service";
import { sendInvitationEmail } from "../../services/email.service";
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

    const emailSent = await sendInvitationEmail({
      to: result.invitation.email,
      workspaceName: result.workspaceName,
      inviterName: result.invitation.invitedBy?.userName ?? "A workspace admin",
      role: result.invitation.role,
      expiresAt: result.invitation.expiresAt,
      acceptUrl: result.acceptUrl,
    });

    await writeLog({
      tenantId,
      userId: inviterId,
      action: "MEMBER_INVITED",
      entityType: "invitation",
      entityId: result.invitation.id,
      newValues: {
        email: result.invitation.email,
        role: result.invitation.role,
        emailSent,
      },
    });

    return sendSuccess(
      res,
      "invitation created successfully",
      {
        ...result.invitation,
        token: result.token,
        acceptUrl: result.acceptUrl,
        emailSent,
      },
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

  async resendInvitation(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    const invitationId = req.params.invitationId;

    if (!tenantId || !userId) {
      return sendError(res, "User authentication required", 401);
    }

    if (!invitationId || Array.isArray(invitationId)) {
      return sendError(res, "invitationId is required");
    }

    const result = await invitationService.resendInvitation(
      tenantId,
      invitationId,
    );

    const emailSent = await sendInvitationEmail({
      to: result.invitation.email,
      workspaceName: result.workspaceName,
      inviterName: result.invitation.invitedBy?.userName ?? "A workspace admin",
      role: result.invitation.role,
      expiresAt: result.invitation.expiresAt,
      acceptUrl: result.acceptUrl,
    });

    await writeLog({
      tenantId,
      userId,
      action: "MEMBER_INVITATION_RESENT",
      entityType: "invitation",
      entityId: result.invitation.id,
      newValues: {
        email: result.invitation.email,
        role: result.invitation.role,
        expiresAt: result.invitation.expiresAt,
        emailSent,
      },
    });

    return sendSuccess(res, "invitation refreshed successfully", {
      ...result.invitation,
      token: result.token,
      acceptUrl: result.acceptUrl,
      emailSent,
    });
  }
}

export default new InvitationController();
