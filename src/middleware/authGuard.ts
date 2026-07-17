import { Response, NextFunction } from "express";
import { envConfig } from "../config/env";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/authTypes";
import { prisma } from "../config/database";

export class AuthGuard {
  async isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // NOTE: fixed from the original `req.headers.Authorization` — Express
      // lower-cases all incoming header names, so that lookup was always
      // `undefined` and this guard never actually worked. Also now accepts
      // the standard `Authorization: Bearer <token>` format instead of a
      // bare token.
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(400).json({
          message: "token is required",
        });
      }

      const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

      jwt.verify(accessToken, envConfig.jwtSecret, async (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          return res.status(401).json({
            message: "token couldn't be verified",
          });
        }

        const userData = await prisma.user.findFirst({
          where: { id: decoded?.id, deletedAt: null },
        });
        if (userData) {
          req.user = userData;
        }
        next();
      });
    } catch (err) {
      return res.status(400).json({
        message: "something went wrong",
      });
    }
  }
}

export default new AuthGuard();
