/**
 * Environment configuration. Parsed once, at boot, so a missing key fails
 * loudly on startup instead of halfway through an Inngest run.
 *
 * Every secret lives here and only here. Nothing in this object may ever be
 * sent to the browser — the web app talks to this API, never to OpenRouter,
 * Reducto or Inngest directly.
 */
import { resolve } from "node:path";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.url().default("http://localhost:5173"),

  DATABASE_URL: z.url(),

  STORAGE_DIR: z.string().default("./storage/documents"),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024),

  INNGEST_DEV: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_MODEL: z.string().default("deepseek/deepseek-v4.1-flash"),

  REDUCTO_API_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment. Copy .env.example to .env and fill it in.");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = {
  ...parsed.data,
  /** Absolute path, resolved from the repo root, so the API can be started from anywhere. */
  storageDir: resolve(process.cwd(), parsed.data.STORAGE_DIR),
  isDev: parsed.data.NODE_ENV === "development",
};
