import { Request,Response,NextFunction } from "express";
import { envConfig } from "../config/envConfig";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/authTypes";
import User from "../models/auth/userModel";



export class authGuard {
    
 async isAuthenticated(req: AuthRequest,res: Response,next: NextFunction) {
        try {
        const accessToken = req.headers.Authorization;
        if(!accessToken) {
            return res.status(400).json({
                message: "token is required"
            })
        }
        jwt.verify(accessToken as string,envConfig.jwtSecret,async (err: jwt.VerifyErrors | null, decoded: any)  => {
            if(err) {
                return res.status(400).json({
                    message: "token couldn't be verified"
                })
            }

            const userData = await User.findByPk(decoded?.id);
            req.user = userData as User;
            next();
        });
    }
    catch(err) {
        return res.status(400).json({
            message: "something went wrong"
        })
    }
        
    }
}

export default new authGuard();
