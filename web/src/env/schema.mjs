// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string().default("."),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL
      ? z.string()
      : z.string().url().default("http://localhost:3000")
  ),
  CUSTOM_AWS_ACCESS_KEY_ID: z.string().optional(),
  CUSTOM_AWS_SECRET_ACCESS_KEY: z.string().optional(),
  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),
  INFERENCE_SERVER_BASE_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.infer<typeof serverSchema>]: z.infer<typeof serverSchema>[k] | undefined }}
 */
export const serverEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  CUSTOM_AWS_ACCESS_KEY_ID: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
  CUSTOM_AWS_SECRET_ACCESS_KEY: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
  INFERENCE_SERVER_BASE_URL: process.env.INFERENCE_SERVER_BASE_URL,
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};
