import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { envConfig } from "../../config/env";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/constants";

interface HttpError extends Error {
  statusCode?: number;
}

const httpError = (message: string, statusCode: number): HttpError => {
  const err: HttpError = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class AuthService {
  async login(userEmail: string, userPassword: string) {
    const user = await prisma.user.findFirst({
      where: { userEmail, deletedAt: null },
    });

    if (!user) {
      throw httpError("user not found", 400);
    }

    const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isPasswordValid) {
      throw httpError("Invalid email or password", 400);
    }

    const accessToken = jwt.sign({ id: user.id }, envConfig.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ id: user.id }, envConfig.jwtSecret, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken, user };
  }
}

export default new AuthService();
