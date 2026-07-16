import { Request, Response } from "express";
import authService from "./auth.service";
import { loginSchema } from "./auth.validation";
import { REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../../config/constants";
import { sendError, sendSuccess } from "../../utils/response";

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
    const { accessToken, refreshToken } = await authService.login(userEmail, userPassword);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
    });

   return sendSuccess(res,"login successful", accessToken);
  }

  async refresh(req: Request, res: Response ) {
    const token = req.cookies?.refreshToken;
    if(!token) {
      return sendError(res, "token is required");
    }

    const accessToken = await authService.refresh(token);
    return sendSuccess(res,"token refreshed successfully", accessToken);
  }

  async logout(req: Request,res: Response) {
    res.clearCookie("refreshToken");
    return sendSuccess(res,"logged out successfully");
  }
}

export default new AuthController();
