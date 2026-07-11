import User from "../models/auth/userModel";
import bcrypt from "bcrypt";
import {envConfig} from "../config/envConfig";
import Role from "../models/auth/roleModel";
import UserRole from "../models/auth/userRole";

const adminSeeder = async () => {
    try {
    const existingUser = await User.findOne({where: {
        userEmail: envConfig.adminEmail
    } })
    if(existingUser) {
         const accountantRole = await Role.findOne({ where: { roleName: "accountant" } });
         await existingUser.$add("roles", accountantRole as any);
         return;
    }
    const adminPassword = envConfig.adminPassword;
    if (!adminPassword) {
        throw new Error("ADMIN_PASSWORD env var is required");
    }

    await User.create({
        userName: "admin",
        userEmail: "admin@gmail.com",
        userPassword: bcrypt.hashSync(adminPassword, 10),
    } as any);
   
   
    
}
    catch (error) {
        console.error("Error seeding admin user:", error);
    }
}

export {adminSeeder};