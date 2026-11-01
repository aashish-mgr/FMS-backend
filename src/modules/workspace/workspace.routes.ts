import express from "express";
import workspaceController from "./workspace.controller";
import memberController from "./member.controller";
import invitationController from "./invitation.controller";
import authGuard from "../../middleware/authGuard";
import requirePermission from "../../middleware/requirePermission";
import { PERMISSIONS } from "../../config/permissions";
import { handleError } from "../../middleware/errorHandler";

const router = express.Router();

router
  .route("/")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.WORKSPACE_READ),
    handleError(workspaceController.getCurrentWorkspace),
  )
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.WORKSPACE_UPDATE),
    handleError(workspaceController.updateCurrentWorkspace),
  );

router
  .route("/members")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.MEMBER_READ),
    handleError(memberController.listMembers),
  );

router
  .route("/members/:userId")
  .patch(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.MEMBER_UPDATE),
    handleError(memberController.updateMemberRole),
  )
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.MEMBER_REMOVE),
    handleError(memberController.removeMember),
  );

router
  .route("/roles")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.MEMBER_READ),
    handleError(memberController.listAssignableRoles),
  );

router
  .route("/invitations")
  .get(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INVITATION_READ),
    handleError(invitationController.listInvitations),
  )
  .post(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.MEMBER_INVITE),
    handleError(invitationController.createInvitation),
  );

router
  .route("/invitations/:invitationId")
  .delete(
    authGuard.isAuthenticated,
    requirePermission(PERMISSIONS.INVITATION_REVOKE),
    handleError(invitationController.revokeInvitation),
  );

export default router;
