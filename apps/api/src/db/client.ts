/**
 * One PostgreSQL pool for the whole process, wrapped by Drizzle.
 *
 * Import `db` everywhere; do not create a second pool inside an Inngest
 * function — concurrent runs share this one.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "../config/env.ts";
import * as schema from "./schema.ts";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema, casing: "snake_case" });

/**
 * @scaffold Hand this to a service so it can be called with a transaction.
 *   Used from TODO(1.x) onward; drop the `@scaffold` tag once it is.
 */
export type Database = typeof db;
