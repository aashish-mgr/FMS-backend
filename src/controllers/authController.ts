import User from "../models/auth/userModel";
import { Request,Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { envConfig } from "../config/envConfig";
class authController {
     async login(req: Request, res: Response) {
         const { userEmail, userPassword } = req.body;
         const user = await User.findOne({ where: { userEmail } });

         if (!user) {
            return res.status(400).json({
                message: "user not found"
            });
         }
         const isPasswordValid = await bcrypt.compare(userPassword,user?.userPassword as string);
        if(!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign({id: user.id},envConfig.jwtSecret, {
            expiresIn: "15d"
        })

        return res.status(200).json({
            message: "Login successful",
            token
        })
         
       
    }
}

export default new  authController();