import { catalogItemSchema } from "@vientos/shared";
import { sql } from "drizzle-orm";
import { z } from "zod";

import data from "../../../../fixtures/catalog.json";
import { logger } from "../lib/logger.ts";
/**
 * Seeds the local catalog from `fixtures/catalog.json`.
 * Run with `pnpm db:seed`.
 */
import { db, pool } from "./client.ts";
import { catalogItems } from "./schema.ts";

// TODO(1.7): Read `fixtures/catalog.json`, validate it with `catalogItemSchema`
//   from `@vientos/shared`, and upsert the rows into `catalogItems`.
//   Make it idempotent (`onConflictDoUpdate` on the sku) so you can re-run it
//   after every schema change without wiping the database.
const catalogInfoSchema = z.array(catalogItemSchema);
const catalog = catalogInfoSchema.parse(data);

await db
  .insert(catalogItems)
  .values(catalog)
  .onConflictDoUpdate({
    target: catalogItems.sku,
    set: {
      name: sql`excluded.name`,
      category: sql`excluded.category`,
      unitPriceCents: sql`excluded.unit_price_cents`,
    },
  });

logger.info("catalog seeded", { count: catalog.length });
//logger.warn("seed not implemented yet — see TODO(1.7)");
await pool.end();
