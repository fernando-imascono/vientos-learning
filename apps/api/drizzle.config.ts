import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Must match the `casing` passed to drizzle() in src/db/client.ts, or the
  // generated SQL and the runtime queries will disagree about column names.
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://vientos:vientos@localhost:5432/vientos",
  },
  verbose: true,
  strict: true,
});
