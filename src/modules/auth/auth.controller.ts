import { Request, Response } from "express";
import authService from "./auth.service";
import {
  acceptInvitationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation";
import { REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../../config/constants";
import { sendError, sendSuccess } from "../../utils/response";
import { writeLog } from "../../services/audit.service";
import { AuthRequest } from "../../types/authTypes";
import workspaceService from "../workspace/workspace.service";
import invitationService from "../workspace/invitation.service";

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

    try {
      await authService.sendEmailVerification(user.id);
    } catch (error) {
      // Signup must still succeed when SMTP is unavailable; the user can
      // resend the verification email from the in-app banner.
      console.error("Failed to send email verification:", error);
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

    const { refreshToken: rotatedRefreshToken, ...session } =
      await authService.refresh(token);

    setRefreshTokenCookie(res, rotatedRefreshToken);

    return sendSuccess(res,"token refreshed successfully", session);
  }

  async logout(req: AuthRequest,res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie("refreshToken");
    await writeLog({
      tenantId: req.user?.tenantId ?? null,
      userId: req.user?.id ?? null,
      action: "USER_LOGOUT",
      entityType: "user",
    });
    return sendSuccess(res,"logged out successfully");
  }

  async logoutAll(req: AuthRequest, res: Response) {
    if (!req.user) {
      return sendError(res, "user is required", 401);
    }

    await authService.revokeAllRefreshTokens(req.user.id);
    res.clearCookie("refreshToken");

    await writeLog({
      tenantId: req.user.tenantId,
      userId: req.user.id,
      action: "USER_LOGOUT_ALL",
      entityType: "user",
      entityId: req.user.id,
    });

    return sendSuccess(res, "logged out of all devices successfully");
  }

  async forgotPassword(req: Request, res: Response) {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await authService.requestPasswordReset(parsed.data.userEmail);

    // Deliberately generic so this endpoint cannot be used to enumerate users.
    return sendSuccess(
      res,
      "If an account with that email exists, a password reset link has been sent.",
    );
  }

  async resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await authService.resetPassword(parsed.data.token, parsed.data.userPassword);

    return sendSuccess(res, "password reset successfully");
  }

  async changePassword(req: AuthRequest, res: Response) {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    if (!req.user) {
      return sendError(res, "user is required", 401);
    }

    await authService.changePassword(
      req.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
      req.cookies?.refreshToken,
    );

    return sendSuccess(res, "password changed successfully");
  }

  async verifyEmail(req: Request, res: Response) {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await authService.verifyEmail(parsed.data.token);

    return sendSuccess(res, "email verified successfully", result);
  }

  async resendVerification(req: AuthRequest, res: Response) {
    if (!req.user) {
      return sendError(res, "user is required", 401);
    }

    const result = await authService.sendEmailVerification(req.user.id);

    return sendSuccess(res, "verification email sent", result);
  }

  async getInvitation(req: Request, res: Response) {
    const token = req.params.token;
    if (!token || Array.isArray(token)) {
      return sendError(res, "invitation token is required");
    }

    const invitation = await invitationService.getInvitationByToken(token);
    return sendSuccess(res, "invitation fetched successfully", invitation);
  }

  async acceptInvitation(req: Request, res: Response) {
    const parsed = acceptInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const accepted = await invitationService.acceptInvitation(
      parsed.data.token,
      parsed.data.userName,
      parsed.data.userPassword,
    );

    const { accessToken, refreshToken, user, tenant } = await authService.issueSession(
      accepted.userId,
    );

    setRefreshTokenCookie(res, refreshToken);

    try {
      await writeLog({
        tenantId: tenant.id,
        userId: user.id,
        action: "MEMBER_JOINED",
        entityType: "user",
        entityId: user.id,
        newValues: {
          email: user.userEmail,
          role: accepted.roleName,
          invitationId: accepted.invitationId,
        },
      });
    } catch (error) {
      // The account already exists, so an audit failure must not block the
      // user from receiving a valid session.
      console.error("Failed to write member joined audit log:", error);
    }

    return sendSuccess(
      res,
      "invitation accepted successfully",
      { accessToken, user, tenant },
      201,
    );
  }
}

export default new AuthController();
