import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { ASSIGNABLE_ROLES, type AssignableRole } from "../../config/constants";
import { httpError } from "../../utils/httpError";

const memberSelect = {
  id: true,
  userName: true,
  userEmail: true,
  createdAt: true,
  userRoles: {
    select: {
      roles: {
        select: { roleName: true },
      },
    },
  },
} satisfies Prisma.UserSelect;

type MemberRecord = Prisma.UserGetPayload<{ select: typeof memberSelect }>;

export interface SerializedMember {
  id: string;
  userName: string;
  userEmail: string;
  roles: string[];
  createdAt: Date;
}

function serializeMember(member: MemberRecord): SerializedMember {
  return {
    id: member.id,
    userName: member.userName,
    userEmail: member.userEmail,
    roles: member.userRoles.map((userRole) => userRole.roles.roleName),
    createdAt: member.createdAt,
  };
}

function isAssignableRole(roleName: string): roleName is AssignableRole {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(roleName);
}

class MemberService {
  async listMembers(tenantId: string): Promise<SerializedMember[]> {
    const members = await prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: memberSelect,
      orderBy: { createdAt: "asc" },
    });

    return members.map(serializeMember);
  }

  async getMember(tenantId: string, userId: string): Promise<SerializedMember> {
    const member = await prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: memberSelect,
    });

    if (!member) {
      throw httpError("member not found", 404);
    }

    return serializeMember(member);
  }

  async updateMemberRole(
    tenantId: string,
    actorId: string,
    targetUserId: string,
    roleName: string,
  ) {
    if (!isAssignableRole(roleName)) {
      throw httpError("role must be either admin or accountant", 400);
    }

    if (targetUserId === actorId) {
      throw httpError("you cannot change your own role", 400);
    }

    const target = await this.getMember(tenantId, targetUserId);

    if (target.roles.includes("superAdmin")) {
      throw httpError("super admin roles cannot be changed from a workspace", 403);
    }

    const role = await prisma.role.findFirst({
      where: { roleName },
      select: { id: true },
    });

    if (!role) {
      throw httpError("role not found", 400);
    }

    if (target.roles.includes("admin") && roleName !== "admin") {
      await this.assertNotLastAdmin(tenantId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: targetUserId } });
      await tx.userRole.create({
        data: { userId: targetUserId, roleId: role.id },
      });
    });

    return {
      member: await this.getMember(tenantId, targetUserId),
      previousRoles: target.roles,
      newRole: roleName,
    };
  }

  async removeMember(tenantId: string, actorId: string, targetUserId: string) {
    if (targetUserId === actorId) {
      throw httpError("you cannot remove yourself from the workspace", 400);
    }

    const target = await this.getMember(tenantId, targetUserId);

    if (target.roles.includes("superAdmin")) {
      throw httpError("super admin accounts cannot be removed from a workspace", 403);
    }

    if (target.roles.includes("admin")) {
      await this.assertNotLastAdmin(tenantId);
    }

    // Users cannot be hard-deleted because their created financial records use
    // an onDelete: Cascade relation. Soft-delete instead and release the email
    // so the person can be invited again later.
    const removedEmail = `removed-${targetUserId}@removed.invalid`;

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: targetUserId } });
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          deletedAt: new Date(),
          userEmail: removedEmail,
        },
      });
    });

    return {
      member: target,
      removedEmail,
    };
  }

  private async assertNotLastAdmin(tenantId: string) {
    const adminCount = await prisma.user.count({
      where: {
        tenantId,
        deletedAt: null,
        userRoles: {
          some: { roles: { roleName: "admin" } },
        },
      },
    });

    if (adminCount <= 1) {
      throw httpError("workspace must have at least one admin", 400);
    }
  }
}

export default new MemberService();
