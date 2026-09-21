/**
 * Purchase request endpoints.
 *
 * Same house rule as `documents.ts`: request input comes from
 * `zValidator(...)` + `c.req.valid(...)`, never from `c.req.json()` or
 * `c.req.param()` directly.
 */
import { Hono } from "hono";

export const requestRoutes = new Hono();

// TODO(5.1): POST / — accept the free-text request.
//   `zValidator('json', createRequestInputSchema)`, insert the row as
//   `received`, commit, then
//   `inngest.send(requestSubmitted.create({ requestId }))`.
//   Respond 202 with the id; the UI navigates to the detail screen and polls.
requestRoutes.post("/", (c) => c.json({ error: "not implemented — TODO(5.1)" }, 501));

// TODO(5.3): GET / — list requests with status and total, newest first.
requestRoutes.get("/", (c) => c.json({ error: "not implemented — TODO(5.3)" }, 501));

// TODO(9.3): GET /:id — the full detail: original text, status, route, the SOP
//   fragments that justify it, the priced items and total, which SOP was used,
//   and the agent's tool trace.
requestRoutes.get("/:id", (c) => c.json({ error: "not implemented — TODO(9.3)" }, 501));

// TODO(8.4): POST /:id/decision — approve or reject.
//   Check `canAcceptApproval` FIRST and return 409 when the request is no
//   longer waiting (already decided, expired, or ordered). Then send
//   `approvalDecided.create(...)`, which is what wakes the waiting Inngest run.
//   Give that event a deterministic id so a double-clicked button cannot
//   deliver two decisions.
requestRoutes.post("/:id/decision", (c) => c.json({ error: "not implemented — TODO(8.4)" }, 501));

// TODO(Extra A.3): POST /webhooks/pipedream — turn a connector event into a
//   request. It must emit the SAME `purchase/request.submitted` event as the
//   manual path, verify the signature, and deduplicate on the connector's own
//   event id so a redelivery does not create a second request. Sending a
//   notification does not count as completing this extra.
