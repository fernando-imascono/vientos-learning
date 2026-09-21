/**
 * Knowledge Base endpoints.
 *
 * Uploading a SOP prepares knowledge. It never starts a purchase — no route in
 * this file may emit `purchase/request.submitted`.
 *
 * House rule (enforced by `local/no-hono-raw-request-access`): never read
 * request input with `c.req.parseBody()`, `c.req.json()` or `c.req.param()`.
 * Declare a Zod schema, wrap the handler in `zValidator(target, schema)` and
 * read it back with `c.req.valid(target)` — that is what keeps the RPC types
 * honest and the validation in one place.
 */
import { Hono } from "hono";

export const documentRoutes = new Hono();

// TODO(2.1): POST / — accept a multipart upload.
//   `zValidator('form', z.object({ file: z.instanceof(File) }))`, then
//   `c.req.valid('form')`. Order of operations matters: validate -> store the
//   file -> insert the row as `processing` -> COMMIT -> only then
//   `inngest.send()`. Sending the event before the row is committed is a race
//   you will spend an afternoon on.
//   Respond 202 with the document id; the UI polls (or you add SSE later).
documentRoutes.post("/", (c) => c.json({ error: "not implemented — TODO(2.1)" }, 501));

// TODO(2.5): GET / — list documents with status, newest first.
documentRoutes.get("/", (c) => c.json({ error: "not implemented — TODO(2.5)" }, 501));

// TODO(2.6): GET /:id — one document including the extracted text, so the
//   Knowledge Base screen can let you review what Reducto actually read.
//   Validate the id with `zValidator('param', z.object({ id: z.uuid() }))`.
documentRoutes.get("/:id", (c) => c.json({ error: "not implemented — TODO(2.6)" }, 501));

// TODO(11.5 — optional): DELETE /:id, and decide what it means for a request
//   that pinned this document. (Hint: it must mean nothing. Soft-delete.)
