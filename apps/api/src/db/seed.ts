import { logger } from "../lib/logger.ts";
/**
 * Seeds the local catalog from `fixtures/catalog.json`.
 * Run with `pnpm db:seed`.
 */
import { pool } from "./client.ts";

// TODO(1.7): Read `fixtures/catalog.json`, validate it with `catalogItemSchema`
//   from `@vientos/shared`, and upsert the rows into `catalogItems`.
//   Make it idempotent (`onConflictDoUpdate` on the sku) so you can re-run it
//   after every schema change without wiping the database.

logger.warn("seed not implemented yet — see TODO(1.7)");
await pool.end();
