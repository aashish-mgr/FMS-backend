import User from "../models/auth/userModel";
import { Request,Response } from "express";
class authController {
    public static async login(req: Request, res: Response) {
         const {userEmail,userPassword} = req.body;
         const user =await User.findOne({where: userEmail});
         
         if(!user) {
            return res.status(200).json({
                message: "user logged in successfully"
            })
         }
    }
}

export default authController;