import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
    databaseUrl: process.env.DATABASE_URL as string,
}