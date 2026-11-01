import { Request, Response } from "express";
import authService from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";
import { REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../../config/constants";
import { sendError, sendSuccess } from "../../utils/response";
import { writeLog } from "../../services/audit.service";
import { AuthRequest } from "../../types/authTypes";
import workspaceService from "../workspace/workspace.service";

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  });
}

class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res,parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const { userEmail, userPassword } = parsed.data;

    // authService.login throws an HttpError (with a statusCode) on bad
    // credentials; the route wraps this controller in `handleError`, which
    // forwards it to the global error handler — reproducing the exact same
    // { message } responses the Sequelize version returned inline.
    const { accessToken, refreshToken, user, tenant } = await authService.login(userEmail, userPassword);

    setRefreshTokenCookie(res, refreshToken);

    await writeLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: "USER_LOGIN",
      entityType: "user",
    });

   return sendSuccess(res,"login successful", {accessToken,user,tenant});
  }

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const provisioned = await workspaceService.provisionWorkspace(parsed.data);
    const { accessToken, refreshToken, user, tenant } = await authService.issueSession(
      provisioned.userId,
    );

    setRefreshTokenCookie(res, refreshToken);

    try {
      await writeLog({
        tenantId: tenant.id,
        userId: user.id,
        action: "WORKSPACE_CREATED",
        entityType: "tenant",
        entityId: tenant.id,
        newValues: {
          workspaceName: tenant.name,
          userEmail: user.userEmail,
        },
      });
    } catch (error) {
      // Provisioning already succeeded, so an audit-write failure should not
      // turn a successful signup into an error for the user.
      console.error("Failed to write workspace creation audit log:", error);
    }

    return sendSuccess(
      res,
      "workspace created successfully",
      { accessToken, user, tenant },
      201,
    );
  }

  async refresh(req: Request, res: Response ) {
    const token = req.cookies?.refreshToken;
    if(!token) {
      return sendError(res, "token is required");
    }

    const session = await authService.refresh(token);
    return sendSuccess(res,"token refreshed successfully", session);
  }

  async logout(req: AuthRequest,res: Response) {
    res.clearCookie("refreshToken");
    await writeLog({
      tenantId: req.user?.tenantId ?? null,
      userId: req.user?.id ?? null,
      action: "USER_LOGOUT",
      entityType: "user",
    });
    return sendSuccess(res,"logged out successfully");
  }
}

export default new AuthController();
