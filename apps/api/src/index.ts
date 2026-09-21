import { mkdir } from "node:fs/promises";

import { serve } from "@hono/node-server";

import { app } from "./app.ts";
import { env } from "./config/env.ts";
import { logger } from "./lib/logger.ts";

// The upload directory has to survive restarts (the brief asks for it),
// so make sure it exists before the first request arrives.
await mkdir(env.storageDir, { recursive: true });

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info("api listening", {
    url: `http://localhost:${info.port}`,
    storageDir: env.storageDir,
    model: env.OPENROUTER_MODEL,
  });
});
