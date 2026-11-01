import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../types/authTypes";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const roles = (req as AuthRequest).roles ?? [];

    if (!roles.some((role) => allowedRoles.includes(role))) {
      return res.status(403).json({
        message: "you do not have permission to perform this action",
      });
    }

    return next();
  };
};

export default requireRole;
