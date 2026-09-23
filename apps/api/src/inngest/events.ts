import { events } from "@vientos/shared";
/**
 * Event definitions.
 *
 * In Inngest v4 an event is declared once with `eventType()` and that same
 * object is used as the function's trigger, as the argument to `send()`, and
 * as the thing `step.waitForEvent()` waits for — so a producer and a consumer
 * cannot drift apart. The Zod schema is a Standard Schema, validated at runtime.
 */
import { eventType } from "inngest";
import { z } from "zod";

// TODO(3.1): Fill in each payload.
//   Keep payloads SMALL — ids, not blobs. The function re-reads the row from
//   PostgreSQL; an event carrying the whole extracted SOP will bite you.
//   Also decide the idempotency story now: `create(data, { id })` sets the
//   event id, and an event sent twice with the same id only runs once. That is
//   the cheapest answer to "the Pipedream connector delivered this 3 times"
//   and to a double-clicked submit button.

export const documentUploaded = eventType(events.documentUploaded, {
  schema: z.object({
    documentId: z.uuid(),
  }),
});

export const requestSubmitted = eventType(events.requestSubmitted, {
  schema: z.object({
    // requestId: z.uuid(),
  }),
});

/**
 * @scaffold Sent by TODO(8.4) and awaited by TODO(8.1).
 *   Drop the `@scaffold` tag once both exist.
 */
export const approvalDecided = eventType(events.approvalDecided, {
  schema: z.object({
    // requestId: z.uuid(),
    // approved: z.boolean(),
  }),
});
