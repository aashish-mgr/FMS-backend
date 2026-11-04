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

  // Used for invitation accept links and CORS. Keep it as the public origin of
  // the frontend, for example https://fms.example.com.
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Optional SMTP delivery. When SMTP_HOST is omitted, invitations are still
  // created and the API returns the accept link for manual sharing.
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform(
      (value) => value === true || String(value).toLowerCase() === 'true',
    ),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().trim().min(1).default('FMS <no-reply@fms.local>'),
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
  LOCAL_UPLOAD_PATH: parsed.data.LOCAL_UPLOAD_PATH,
  frontendUrl: parsed.data.FRONTEND_URL.replace(/\/+$/, ''),
  smtpHost: parsed.data.SMTP_HOST,
  smtpPort: parsed.data.SMTP_PORT,
  smtpSecure: parsed.data.SMTP_SECURE,
  smtpUser: parsed.data.SMTP_USER,
  smtpPass: parsed.data.SMTP_PASS,
  mailFrom: parsed.data.MAIL_FROM,
};

