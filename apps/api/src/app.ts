/**
 * The Hono application: middleware, error handling and route mounting.
 * Kept separate from `index.ts` so tests can import the app without opening a port.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { serve as serveInngest } from "inngest/hono";
import { ZodError, z } from "zod";

import { env } from "./config/env.ts";
import { inngest } from "./inngest/client.ts";
import { functions } from "./inngest/functions/index.ts";
import { HttpError } from "./lib/http-error.ts";
import { logger } from "./lib/logger.ts";
import { catalogRoutes } from "./routes/catalog.ts";
import { documentRoutes } from "./routes/documents.ts";
import { requestRoutes } from "./routes/requests.ts";

export const app = new Hono();

app.use("*", requestId());
app.use("*", cors({ origin: env.WEB_ORIGIN, credentials: true }));

app.use("*", async (c, next) => {
  const started = Date.now();
  await next();
  logger.info("http", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms: Date.now() - started,
    requestId: c.get("requestId"),
  });
});

app.get("/health", (c) => c.json({ ok: true }));

// Inngest mounts its own handler; the dev server discovers your functions here.
app.on(["GET", "POST", "PUT"], "/api/inngest", serveInngest({ client: inngest, functions }));

app.route("/api/catalog", catalogRoutes);
app.route("/api/documents", documentRoutes);
app.route("/api/requests", requestRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: err.message, details: err.details }, err.status);
  }
  if (err instanceof ZodError) {
    return c.json({ error: "Invalid payload", details: z.treeifyError(err) }, 400);
  }
  logger.error("unhandled error", {
    message: err.message,
    stack: err.stack,
    requestId: c.get("requestId"),
  });
  return c.json({ error: "Internal server error" }, 500);
});
