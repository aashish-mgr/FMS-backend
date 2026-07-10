import User from "../models/userModel";
import bcrypt from "bcrypt";
import {envConfig} from "../config/envConfig";

const adminSeeder = async () => {
    try {
    const existingUser = await User.findOne({where: {
        userEmail: envConfig.adminEmail
    } })
    if(existingUser) {
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
    console.log("Admin user seeded successfully");
    }
    catch (error) {
        console.error("Error seeding admin user:", error);
    }
}

export {adminSeeder};