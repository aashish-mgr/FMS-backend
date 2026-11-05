import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import { prisma } from "../../config/database";
import { envConfig } from "../../config/env";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  PASSWORD_RESET_EXPIRES_IN_MS,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../../config/constants";
import { httpError } from "../../utils/httpError";
import { AppError } from "../../utils/AppError";
import { generateAuthToken, hashAuthToken } from "../../utils/authToken";
import { writeLog } from "../../services/audit.service";
import { sendPasswordResetEmail } from "../../services/email.service";
import { isTenantActive } from "../../utils/tenant";

interface RefreshTokenPayload extends JwtPayload {
  id?: string;
  tenantId?: string;
  type?: string;
}

type SessionUser = Prisma.UserGetPayload<{
  include: {
    tenant: true;
    userRoles: { include: { roles: true } };
  };
}>;

function generateAccessToken(user: Pick<User, "id" | "tenantId">): string {
  return jwt.sign(
    { id: user.id, tenantId: user.tenantId, type: "access" },
    envConfig.jwtSecret,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );
}

function generateRefreshToken(user: Pick<User, "id" | "tenantId">): string {
  return jwt.sign(
    { id: user.id, tenantId: user.tenantId, type: "refresh" },
    envConfig.jwtSecret,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );
}

function serializeUser(user: SessionUser) {
  const roleNames = user.userRoles.map((userRole) => userRole.roles.roleName);

  return {
    id: user.id,
    tenantId: user.tenantId,
    userName: user.userName,
    userEmail: user.userEmail,
    roles: roleNames,
    role: roleNames[0] ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function buildSession(user: SessionUser) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    user: serializeUser(user),
    tenant: user.tenant,
  };
}

class AuthService {
  async login(userEmail: string, userPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        userEmail: { equals: userEmail, mode: "insensitive" },
        deletedAt: null,
      },
      include: {
        tenant: true,
        userRoles: { include: { roles: true } },
      },
    });

    if (!user) {
      throw httpError("user not found", 400);
    }

    if (!isTenantActive(user.tenant)) {
      throw httpError("workspace is not active", 403);
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      await writeLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "USER_LOGIN_FAILED",
        entityType: "user",
      });
      throw httpError("Invalid email or password", 400);
    }

    return buildSession(user);
  }

  async issueSession(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        tenant: true,
        userRoles: { include: { roles: true } },
      },
    });

    if (!user) {
      throw new AppError("UNAUTHORIZED", "user no longer exists", 401);
    }

    if (!isTenantActive(user.tenant)) {
      throw new AppError("FORBIDDEN", "workspace is not active", 403);
    }

    return buildSession(user);
  }

  async requestPasswordReset(userEmail: string) {
    const email = userEmail.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        userEmail: { equals: email, mode: "insensitive" },
        deletedAt: null,
      },
      include: { tenant: true },
    });

    // Do not reveal whether an account exists. The controller always returns
    // the same message regardless of this result.
    if (!user || !isTenantActive(user.tenant)) {
      return;
    }

    const token = generateAuthToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN_MS);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashAuthToken(token),
          expiresAt,
        },
      }),
    ]);

    const resetUrl = `${envConfig.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail({
      to: user.userEmail,
      userName: user.userName,
      workspaceName: user.tenant.name,
      resetUrl,
      expiresAt,
    });

    try {
      await writeLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entityType: "user",
        entityId: user.id,
      });
    } catch (error) {
      console.error("Failed to write password reset request audit log:", error);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash: hashAuthToken(token),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { tenant: true } } },
    });

    if (
      !resetToken ||
      resetToken.user.deletedAt ||
      !isTenantActive(resetToken.user.tenant)
    ) {
      throw httpError("reset token is invalid or has expired", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      // updateMany makes the token single-use even if two reset requests race.
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      if (consumed.count !== 1) {
        throw httpError("reset token is invalid or has expired", 400);
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { userPassword: passwordHash },
      });

      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
      });
    });

    try {
      await writeLog({
        tenantId: resetToken.user.tenantId,
        userId: resetToken.userId,
        action: "PASSWORD_RESET_COMPLETED",
        entityType: "user",
        entityId: resetToken.userId,
      });
    } catch (error) {
      console.error("Failed to write password reset audit log:", error);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError("UNAUTHORIZED", "user no longer exists", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.userPassword,
    );

    if (!isPasswordValid) {
      throw httpError("current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw httpError("new password must be different from the current password", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { userPassword: passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      }),
    ]);

    try {
      await writeLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: "PASSWORD_CHANGED",
        entityType: "user",
        entityId: user.id,
      });
    } catch (error) {
      console.error("Failed to write password change audit log:", error);
    }
  }

  async refresh(refreshToken: string) {
    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(refreshToken, envConfig.jwtSecret) as RefreshTokenPayload;
    } catch {
      throw new AppError("UNAUTHORIZED", "refresh token is not valid", 401);
    }

    if (!decoded.id || decoded.type !== "refresh") {
      throw new AppError("UNAUTHORIZED", "refresh token is not valid", 401);
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null },
      include: {
        tenant: true,
        userRoles: { include: { roles: true } },
      },
    });

    if (!user) {
      throw new AppError("UNAUTHORIZED", "user no longer exists", 401);
    }

    if (decoded.tenantId !== user.tenantId) {
      throw new AppError("UNAUTHORIZED", "refresh token doesn't match the current workspace", 401);
    }

    if (!isTenantActive(user.tenant)) {
      throw new AppError("FORBIDDEN", "workspace is not active", 403);
    }

    return {
      accessToken: generateAccessToken(user),
      user: serializeUser(user),
      tenant: user.tenant,
    };
  }
}

export default new AuthService();
