/**
 * The Inngest client. One per process; import it to send events.
 *
 * Sending looks like this, with the event types from `events.ts`:
 *
 *   await inngest.send(requestSubmitted.create({ requestId }, { id: `req-${requestId}` }));
 */
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "vientos-purchase-requests",
});
