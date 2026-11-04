import crypto from "crypto";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { envConfig } from "../../config/env";
import {
  ASSIGNABLE_ROLES,
  INVITATION_EXPIRED_RETENTION_MS,
  INVITATION_EXPIRES_IN_MS,
  type AssignableRole,
} from "../../config/constants";
import { httpError } from "../../utils/httpError";
import { isTenantActive } from "../../utils/tenant";

const invitationSelect = {
  id: true,
  email: true,
  status: true,
  expiresAt: true,
  acceptedAt: true,
  createdAt: true,
  role: { select: { roleName: true } },
  inviter: { select: { id: true, userName: true } },
  tenant: { select: { name: true } },
} satisfies Prisma.WorkspaceInvitationSelect;

type InvitationRecord = Prisma.WorkspaceInvitationGetPayload<{
  select: typeof invitationSelect;
}>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildAcceptUrl(token: string) {
  return `${envConfig.frontendUrl}/accept-invitation?token=${encodeURIComponent(token)}`;
}

function isAssignableRole(roleName: string): roleName is AssignableRole {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(roleName);
}

function serializeInvitation(invitation: InvitationRecord) {
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role.roleName,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    acceptedAt: invitation.acceptedAt,
    createdAt: invitation.createdAt,
    invitedBy: invitation.inviter,
  };
}

async function expireStaleInvitations(tenantId: string) {
  await prisma.workspaceInvitation.updateMany({
    where: {
      tenantId,
      status: "PENDING",
      expiresAt: { lte: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}

class InvitationService {
  async createInvitation(tenantId: string, inviterId: string, input: {
    userEmail: string;
    roleName: string;
  }) {
    if (!isAssignableRole(input.roleName)) {
      throw httpError("role must be either admin or accountant", 400);
    }

    const email = normalizeEmail(input.userEmail);

    const existingUser = await prisma.user.findFirst({
      where: { userEmail: { equals: email, mode: "insensitive" } },
      select: { id: true, tenantId: true, deletedAt: true },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        throw httpError("this email is not available for an invitation", 409);
      }

      if (existingUser.tenantId === tenantId) {
        throw httpError("this user is already a member of this workspace", 409);
      }

      throw httpError("this email already belongs to another workspace", 409);
    }

    await expireStaleInvitations(tenantId);

    const pendingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        tenantId,
        email: { equals: email, mode: "insensitive" },
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (pendingInvitation) {
      throw httpError("an invitation is already pending for this email", 409);
    }

    const role = await prisma.role.findFirst({
      where: { roleName: input.roleName },
      select: { id: true },
    });

    if (!role) {
      throw httpError("role not found", 400);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        tenantId,
        email,
        roleId: role.id,
        invitedBy: inviterId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + INVITATION_EXPIRES_IN_MS),
      },
      select: invitationSelect,
    });

    return {
      invitation: serializeInvitation(invitation),
      token,
      acceptUrl: buildAcceptUrl(token),
      workspaceName: invitation.tenant.name,
    };
  }

  async listInvitations(tenantId: string) {
    await expireStaleInvitations(tenantId);

    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        tenantId,
        status: { in: ["PENDING", "EXPIRED"] },
        createdAt: {
          gte: new Date(Date.now() - INVITATION_EXPIRED_RETENTION_MS),
        },
      },
      select: invitationSelect,
      orderBy: { createdAt: "desc" },
    });

    return invitations.map(serializeInvitation);
  }

  async revokeInvitation(tenantId: string, invitationId: string) {
    await expireStaleInvitations(tenantId);

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        tenantId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: invitationSelect,
    });

    if (!invitation) {
      throw httpError("invitation not found", 404);
    }

    const revoked = await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "REVOKED" },
      select: invitationSelect,
    });

    return serializeInvitation(revoked);
  }

  async resendInvitation(tenantId: string, invitationId: string) {
    await expireStaleInvitations(tenantId);

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        tenantId,
        status: { in: ["PENDING", "EXPIRED"] },
      },
      select: invitationSelect,
    });

    if (!invitation) {
      throw httpError("invitation not found", 404);
    }

    if (!isAssignableRole(invitation.role.roleName)) {
      throw httpError("invitation role is not valid", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        userEmail: { equals: invitation.email, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw httpError("an account with this email already exists", 409);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resent = await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: {
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + INVITATION_EXPIRES_IN_MS),
        status: "PENDING",
      },
      select: invitationSelect,
    });

    return {
      invitation: serializeInvitation(resent),
      token,
      acceptUrl: buildAcceptUrl(token),
      workspaceName: resent.tenant.name,
    };
  }

  async getInvitationByToken(token: string) {
    const invitation = await prisma.workspaceInvitation.findFirst({
      where: { tokenHash: hashToken(token) },
      select: {
        email: true,
        status: true,
        expiresAt: true,
        role: { select: { roleName: true } },
        tenant: { select: { id: true, name: true } },
      },
    });

    if (!invitation || invitation.status !== "PENDING") {
      throw httpError("invitation is not valid", 400);
    }

    if (invitation.expiresAt <= new Date()) {
      throw httpError("invitation has expired", 400);
    }

    return {
      email: invitation.email,
      workspace: invitation.tenant,
      role: invitation.role.roleName,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(token: string, userName: string, userPassword: string) {
    const invitation = await prisma.workspaceInvitation.findFirst({
      where: { tokenHash: hashToken(token) },
      include: { role: true, tenant: true },
    });

    if (!invitation || invitation.status !== "PENDING") {
      throw httpError("invitation is not valid", 400);
    }

    if (invitation.expiresAt <= new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      throw httpError("invitation has expired", 400);
    }

    if (!isTenantActive(invitation.tenant)) {
      throw httpError("workspace is not active", 403);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        userEmail: { equals: invitation.email, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw httpError("an account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(userPassword, 10);

    try {
      return await prisma.$transaction(async (tx) => {
        const current = await tx.workspaceInvitation.findFirst({
          where: { id: invitation.id, status: "PENDING" },
          include: { role: true, tenant: true },
        });

        if (!current || current.expiresAt <= new Date()) {
          throw httpError("invitation is no longer valid", 400);
        }

        if (!isAssignableRole(current.role.roleName)) {
          throw httpError("invitation role is not valid", 400);
        }

        const user = await tx.user.create({
          data: {
            tenantId: current.tenantId,
            userName,
            userEmail: current.email,
            userPassword: passwordHash,
          },
        });

        await tx.userRole.create({
          data: { userId: user.id, roleId: current.roleId },
        });

        await tx.workspaceInvitation.update({
          where: { id: current.id },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });

        return {
          userId: user.id,
          tenantId: current.tenantId,
          invitationId: current.id,
          email: current.email,
          roleName: current.role.roleName,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw httpError("an account with this email already exists", 409);
      }

      throw error;
    }
  }
}

export default new InvitationService();
