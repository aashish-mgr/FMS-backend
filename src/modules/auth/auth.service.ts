import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import type { User } from "@prisma/client";
import { prisma } from "../../config/database";
import { envConfig } from "../../config/env";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/constants";
import { httpError } from "../../utils/httpError";
import { AppError } from "../../utils/AppError";
import { writeLog } from "../../services/audit.service";
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
