import type { OpenAPIV3 } from "openapi-types";
import {
  conflictError,
  jsonBody,
  permissionDescription,
  protectedErrors,
  schemaRef,
  success,
} from "../helpers";

export const workspacePaths: OpenAPIV3.PathsObject = {
  "/api/workspace": {
    get: {
      tags: ["Workspace"],
      summary: "Get the current workspace",
      operationId: "getCurrentWorkspace",
      description: permissionDescription(
        "Returns the workspace identified by the authenticated user's `tenantId`.",
        "workspace:read",
      ),
      responses: {
        "200": success("workspace fetched successfully", schemaRef("Tenant")),
        ...protectedErrors,
      },
    },
    patch: {
      tags: ["Workspace"],
      summary: "Update the current workspace",
      operationId: "updateCurrentWorkspace",
      description: permissionDescription(
        "Updates the workspace name and/or settings. Settings are merged with the existing values.",
        "workspace:update",
      ),
      requestBody: jsonBody(schemaRef("UpdateWorkspaceRequest")),
      responses: {
        "200": success("workspace updated successfully", schemaRef("Tenant")),
        ...protectedErrors,
      },
    },
  },

  "/api/workspace/members": {
    get: {
      tags: ["Members"],
      summary: "List workspace members",
      operationId: "listWorkspaceMembers",
      description: permissionDescription(
        "Returns active, non-deleted users in the active workspace with their roles.",
        "member:read",
      ),
      responses: {
        "200": success("members fetched successfully", {
          type: "array",
          items: schemaRef("Member"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/workspace/members/{userId}": {
    patch: {
      tags: ["Members"],
      summary: "Change a member role",
      operationId: "updateWorkspaceMemberRole",
      description: permissionDescription(
        [
          "Replaces the member's workspace role. `superAdmin` cannot be assigned.",
          "A member cannot change their own role, and the last admin cannot be demoted.",
        ].join(" "),
        "member:update",
      ),
      parameters: [{ $ref: "#/components/parameters/UserId" }],
      requestBody: jsonBody(schemaRef("UpdateMemberRoleRequest")),
      responses: {
        "200": success("member role updated successfully", schemaRef("Member")),
        ...protectedErrors,
      },
    },
    delete: {
      tags: ["Members"],
      summary: "Remove a member",
      operationId: "removeWorkspaceMember",
      description: permissionDescription(
        [
          "Soft-deletes the member and anonymizes their email so the address can be invited again.",
          "A member cannot remove themselves, `superAdmin` accounts cannot be removed, and the last admin cannot be removed.",
        ].join(" "),
        "member:remove",
      ),
      parameters: [{ $ref: "#/components/parameters/UserId" }],
      responses: {
        "200": success("member removed successfully", schemaRef("RemovedMember")),
        ...protectedErrors,
      },
    },
  },

  "/api/workspace/roles": {
    get: {
      tags: ["Members"],
      summary: "List assignable roles",
      operationId: "listAssignableRoles",
      description: permissionDescription(
        "Returns the roles that workspace admins may assign. `superAdmin` is intentionally excluded.",
        "member:read",
      ),
      responses: {
        "200": success("assignable roles fetched successfully", {
          type: "array",
          items: schemaRef("AssignableRole"),
        }),
        ...protectedErrors,
      },
    },
  },

  "/api/workspace/invitations": {
    get: {
      tags: ["Invitations"],
      summary: "List workspace invitations",
      operationId: "listWorkspaceInvitations",
      description: permissionDescription(
        "Returns pending, accepted, revoked, and recently expired invitations. Expired invitations remain visible for 30 days so they can be resent.",
        "invitation:read",
      ),
      responses: {
        "200": success("invitations fetched successfully", {
          type: "array",
          items: schemaRef("Invitation"),
        }),
        ...protectedErrors,
      },
    },
    post: {
      tags: ["Invitations"],
      summary: "Invite a member",
      operationId: "createWorkspaceInvitation",
      description: permissionDescription(
        [
          "Creates a 7-day invitation, stores only the SHA-256 token hash, and attempts to email the accept link.",
          "The raw `token` and `acceptUrl` are returned only once. If email delivery fails, the invitation is still created and `emailSent` is false.",
        ].join(" "),
        "member:invite",
      ),
      requestBody: jsonBody(schemaRef("CreateInvitationRequest")),
      responses: {
        "201": success(
          "invitation created successfully",
          schemaRef("InvitationCreated"),
        ),
        ...protectedErrors,
        ...conflictError,
      },
    },
  },

  "/api/workspace/invitations/{invitationId}/resend": {
    post: {
      tags: ["Invitations"],
      summary: "Resend an invitation",
      operationId: "resendWorkspaceInvitation",
      description: permissionDescription(
        [
          "Rotates the invitation token, extends expiry by 7 days, and invalidates the previous accept link.",
          "Works for expired invitations. The new raw token and accept URL are returned only in this response.",
        ].join(" "),
        "member:invite",
      ),
      parameters: [{ $ref: "#/components/parameters/InvitationId" }],
      responses: {
        "200": success(
          "invitation refreshed successfully",
          schemaRef("InvitationCreated"),
        ),
        ...protectedErrors,
      },
    },
  },

  "/api/workspace/invitations/{invitationId}": {
    delete: {
      tags: ["Invitations"],
      summary: "Revoke an invitation",
      operationId: "revokeWorkspaceInvitation",
      description: permissionDescription(
        "Marks a pending invitation as revoked so its accept link can no longer be used.",
        "invitation:revoke",
      ),
      parameters: [{ $ref: "#/components/parameters/InvitationId" }],
      responses: {
        "200": success("invitation revoked successfully", schemaRef("Invitation")),
        ...protectedErrors,
      },
    },
  },

  "/api/audit-logs": {
    get: {
      tags: ["Audit Logs"],
      summary: "List audit logs",
      operationId: "listAuditLogs",
      description: permissionDescription(
        "Returns tenant-scoped audit entries, newest first, with pagination and optional action, entity type, and date filters.",
        "audit:read",
      ),
      parameters: [
        { $ref: "#/components/parameters/Page" },
        { $ref: "#/components/parameters/Limit" },
        { $ref: "#/components/parameters/Action" },
        { $ref: "#/components/parameters/EntityType" },
        { $ref: "#/components/parameters/From" },
        { $ref: "#/components/parameters/To" },
      ],
      responses: {
        "200": success("Audit fetched", schemaRef("AuditListData")),
        ...protectedErrors,
      },
    },
  },
};
