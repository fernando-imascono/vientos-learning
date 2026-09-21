/**
 * The catalog. Read-only for this exercise — it is seeded, not managed.
 */
import { Hono } from "hono";

export const catalogRoutes = new Hono();

// TODO(1.8): GET / — list the catalog items.
//   The web app uses it to show what exists and to make the demo legible.
catalogRoutes.get("/", (c) => c.json({ error: "not implemented — TODO(1.8)" }, 501));
