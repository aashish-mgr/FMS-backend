import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
    databaseUrl: process.env.DATABASE_URL as string,
    adminEmail: process.env.ADMIN_EMAIL as string,
    adminPassword: process.env.ADMIN_PASSWORD as string,
}