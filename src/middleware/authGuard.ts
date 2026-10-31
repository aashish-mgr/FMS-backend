import { Response, NextFunction } from "express";
import { envConfig } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/authTypes";
import { prisma } from "../config/database";
import { isTenantActive } from "../utils/tenant";

interface AccessTokenPayload extends JwtPayload {
  id?: string;
  tenantId?: string;
  type?: string;
}

export class AuthGuard {
  async isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          message: "token is required",
        });
      }

      const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const decoded = jwt.verify(accessToken, envConfig.jwtSecret) as AccessTokenPayload;

      // Refresh tokens are signed with the same secret, so make sure a
      // long-lived refresh token cannot be used as an access token.
      if (!decoded.id || decoded.type !== "access") {
        return res.status(401).json({
          message: "token couldn't be verified",
        });
      }

      const user = await prisma.user.findFirst({
        where: { id: decoded.id, deletedAt: null },
        include: {
          tenant: true,
          userRoles: { include: { roles: true } },
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "user no longer exists",
        });
      }

      if (decoded.tenantId !== user.tenantId) {
        return res.status(401).json({
          message: "token doesn't match the current workspace",
        });
      }

      if (!isTenantActive(user.tenant)) {
        return res.status(403).json({
          message: "workspace is not active",
        });
      }

      req.user = user;
      req.tenant = user.tenant;
      req.tenantId = user.tenantId;
      req.roles = user.userRoles.map((userRole) => userRole.roles.roleName);
      return next();
    } catch {
      return res.status(401).json({
        message: "token couldn't be verified",
      });
    }
  }
}

export default new AuthGuard();
