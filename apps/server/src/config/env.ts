import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(30),
  COOKIE_REFRESH_NAME: z.string().default("refresh_token"),
  FRONTEND_URL: z.string().url(),
  API_PUBLIC_URL: z.string().url(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true"),
  MAGIC_SECRET_KEY: z.string().optional(),
  MAGIC_ENDPOINT: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("muscle-essentials/products"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  cached = parsed.data;
  return parsed.data;
}

export function getCorsOrigins(): string[] {
  return getEnv()
    .CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
