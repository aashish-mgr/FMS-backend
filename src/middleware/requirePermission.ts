import type { Request, Response, NextFunction } from "express";
import { hasEveryPermission, type Permission } from "../config/permissions";
import type { AuthRequest } from "../types/authTypes";

/**
 * Requires the authenticated user to have every listed permission. Auth guards
 * should run before this middleware so `req.roles` is populated.
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = (req as AuthRequest).roles ?? [];

    if (!hasEveryPermission(roles, permissions)) {
      return res.status(403).json({
        success: false,
        message: "you do not have permission to perform this action",
      });
    }

    return next();
  };
};

export default requirePermission;
