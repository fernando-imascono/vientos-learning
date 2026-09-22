/**
 * The catalog. Read-only for this exercise — it is seeded, not managed.
 */
import { asc } from "drizzle-orm";
import { Hono } from "hono";

import { db } from "../db/client.ts";
import { catalogItems } from "../db/schema.ts";

export const catalogRoutes = new Hono();

// TODO(1.8): GET / — list the catalog items.
//   The web app uses it to show what exists and to make the demo legible.
catalogRoutes.get("/", async (c) => {
  const allItems = await db.query.catalogItems.findMany({
    columns: {
      sku: true,
      name: true,
      category: true,
      unitPriceCents: true,
    },
    orderBy: [asc(catalogItems.category), asc(catalogItems.name)],
  });
  return c.json(allItems);
});
