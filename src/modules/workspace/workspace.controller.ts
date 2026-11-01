import type { Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { writeLog } from "../../services/audit.service";
import type { AuthRequest } from "../../types/authTypes";
import workspaceService from "./workspace.service";
import { updateWorkspaceSchema } from "./workspace.validation";

function getTenantId(req: AuthRequest) {
  return req.tenantId ?? req.user?.tenantId ?? null;
}

class WorkspaceController {
  async getCurrentWorkspace(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const workspace = await workspaceService.getWorkspace(tenantId);
    return sendSuccess(res, "workspace fetched successfully", workspace);
  }

  async updateCurrentWorkspace(req: AuthRequest, res: Response) {
    const tenantId = getTenantId(req);
    if (!tenantId) {
      return sendError(res, "User authentication required", 401);
    }

    const parsed = updateWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const previous = await workspaceService.getWorkspace(tenantId);
    const workspace = await workspaceService.updateWorkspace(tenantId, parsed.data);

    await writeLog({
      tenantId,
      userId: req.user?.id ?? null,
      action: "WORKSPACE_UPDATED",
      entityType: "tenant",
      entityId: workspace.id,
      oldValues: { name: previous.name, settings: previous.settings },
      newValues: { name: workspace.name, settings: workspace.settings },
    });

    return sendSuccess(res, "workspace updated successfully", workspace);
  }
}

export default new WorkspaceController();
