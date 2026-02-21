import { z } from "zod";

// Environment variable validation schema
const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url().optional(),

  // Optional but recommended for production
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    // In development, log warnings but don't crash
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Environment variable warnings:\n" + errors);
      return process.env as unknown as Env;
    }

    // In production, throw error
    throw new Error(
      `❌ Invalid environment variables:\n${errors}\n\nPlease check your .env file or environment configuration.`
    );
  }

  return parsed.data;
}

// Validate on module load
export const env = validateEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === "production";

// Helper to check if Redis is configured
export const hasRedis = !!(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);

// Helper to check if email is configured
export const hasEmail = !!env.RESEND_API_KEY;
