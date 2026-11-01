import type { Response } from "express";
import { ASSIGNABLE_ROLES } from "../../config/constants";
import { writeLog } from "../../services/audit.service";
import type { AuthRequest } from "../../types/authTypes";
import { sendError, sendSuccess } from "../../utils/response";
import memberService from "./member.service";
import { updateMemberRoleSchema } from "./workspace.validation";

function getTenantId(req: AuthRequest) {
  return req.tenantId ?? req.user?.tenantId ?? null;
}

class MemberController {
  async listMembers(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const members = await memberService.listMembers(tenantId);
    return sendSuccess(res, "members fetched successfully", members);
  }

  async listAssignableRoles(req: AuthRequest, res: Response) {
    if (!getTenantId(req)) {
      return sendError(res, "User authentication required", 401);
    }

    return sendSuccess(res, "assignable roles fetched successfully", ASSIGNABLE_ROLES);
  }

  async updateMemberRole(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    const actorId = req.user?.id;
    const userId = req.params.userId;

    if (!tenantId || !actorId) {
      return sendError(res, "User authentication required", 401);
    }

    if (!userId || Array.isArray(userId)) {
      return sendError(res, "userId is required");
    }

    const parsed = updateMemberRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await memberService.updateMemberRole(
      tenantId,
      actorId,
      userId,
      parsed.data.roleName,
    );

    await writeLog({
      tenantId,
      userId: actorId,
      action: "MEMBER_ROLE_CHANGED",
      entityType: "user",
      entityId: result.member.id,
      oldValues: { roles: result.previousRoles },
      newValues: { roles: result.member.roles },
    });

    return sendSuccess(res, "member role updated successfully", result.member);
  }

  async removeMember(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    const actorId = req.user?.id;
    const userId = req.params.userId;

    if (!tenantId || !actorId) {
      return sendError(res, "User authentication required", 401);
    }

    if (!userId || Array.isArray(userId)) {
      return sendError(res, "userId is required");
    }

    const result = await memberService.removeMember(tenantId, actorId, userId);

    await writeLog({
      tenantId,
      userId: actorId,
      action: "MEMBER_REMOVED",
      entityType: "user",
      entityId: result.member.id,
      oldValues: {
        userName: result.member.userName,
        userEmail: result.member.userEmail,
        roles: result.member.roles,
      },
    });

    return sendSuccess(res, "member removed successfully", {
      id: result.member.id,
    });
  }
}

export default new MemberController();
