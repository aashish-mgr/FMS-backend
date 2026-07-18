import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { envConfig } from "../../config/env";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../config/constants";
import { httpError } from "../../utils/httpError";
import { AppError } from "../../utils/AppError";
import { User } from "@prisma/client";
import { writeLog } from "../../services/audit.service";

 function generateAccessToken(user: User): string {
  return jwt.sign(
    { sub: user.id },
    envConfig.jwtSecret,
    { expiresIn:'15m' }
  );
}
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
      await writeLog({ userId: user.id ?? null, action: "USER_LOGIN_FAILED", entityType: "user"});
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
  
  async refresh (refreshToken: string) {
      jwt.verify(refreshToken,envConfig.jwtSecret,async (err: jwt.VerifyErrors | null, decoded: any) => {
              if (err) {
                throw new AppError("UNAUTHORIZED", "refresh token is not valid",401)
              }
              const user = await prisma.user.findFirst({where: {id: decoded?.id}});
              if(!user) {
                throw new AppError("UNAUTHORIZED", "user no longer exists")
              }

              const accessToken = generateAccessToken(user);
              return accessToken;
            })
            
  }


}

export default new AuthService();
