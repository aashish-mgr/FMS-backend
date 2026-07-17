import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();


const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ADMIN_EMAIL: z.string().min(1, "ADMIN_EMAIL is required"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MAX_ATTACHMENT_SIZE_MB: z.coerce.number().default(10),
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
  LOCAL_UPLOAD_PATH: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const envConfig = {
  databaseUrl: parsed.data.DATABASE_URL,
  adminEmail: parsed.data.ADMIN_EMAIL,
  adminPassword: parsed.data.ADMIN_PASSWORD,
  jwtSecret: parsed.data.JWT_SECRET,
  MAX_ATTACHMENT_SIZE_MB: parsed.data.MAX_ATTACHMENT_SIZE_MB,
  STORAGE_PROVIDER: parsed.data.STORAGE_PROVIDER,
  LOCAL_UPLOAD_PATH: parsed.data.LOCAL_UPLOAD_PATH

};

