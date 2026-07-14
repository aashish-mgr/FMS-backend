import { Request, Response } from "express";
import authService from "./auth.service";
import { loginSchema } from "./auth.validation";
import { REFRESH_TOKEN_COOKIE_MAX_AGE_MS } from "../../config/constants";

class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      });
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

    return res.status(200).json({
      message: "Login successful",
      accessToken,
    });
  }
}

export default new AuthController();
