import User from "../models/userModel";
import bcrypt from "bcrypt";

const adminSeeder = async () => {
    const existingUser = await User.findOne({where: {
        userEmail: process.env.ADMIN_EMAIL
    } })
    if(existingUser) {
        return;
    }
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        throw new Error("ADMIN_PASSWORD env var is required");
    }

    await User.create({
        userName: "admin",
        userEmail: "admin@gmail.com",
        userPassword: bcrypt.hashSync(adminPassword, 10),
    } as any);
}