/**
 * Journey 1 of the brief: "Preparar el conocimiento".
 *
 * Triggered when a SOP PDF has been uploaded and stored. Extracts its content
 * with Reducto and marks the document available — or failed, with a reason the
 * Knowledge Base screen can show.
 *
 * Uploading a SOP never starts a purchase. Keep this function free of any
 * knowledge of purchase requests.
 */
import { inngest } from "../client.ts";
import { documentUploaded } from "../events.ts";

export const processDocument = inngest.createFunction(
  {
    id: "process-document",
    triggers: [documentUploaded],
    // TODO(3.3): Give this a retry policy and a concurrency limit you can
    //   defend. Reducto has free starter credits — a runaway retry loop spends
    //   them. `retries: 2` plus a small `concurrency` is a sane starting point.
  },
  async ({ event, step, logger }) => {
    void step;

    // TODO(3.4): Load the document row. If it is not in `processing`, return
    //   early — this run is a duplicate and there is nothing to do.

    // TODO(3.5): `step.run('extract-with-reducto', ...)` — call the Reducto
    //   client from `services/reducto.ts` and return the extracted text.
    //   Wrapping it in a step is the whole point of Inngest: the call is paid
    //   for once, and a crash after it does not repeat it.
    //   Remember Reducto is asynchronous for larger documents — if you use its
    //   job API, poll inside a step rather than sleeping inside your handler.

    // TODO(3.6): `step.run('store-extraction', ...)` — save the text and flip
    //   the status to `available`.

    // TODO(3.7): On failure, flip the status to `failed` with a human-readable
    //   reason ("the PDF has no extractable text"), and do NOT rethrow if the
    //   failure is permanent — a scanned/illegible PDF is an expected outcome
    //   of the demo, not an incident. Inngest's `NonRetriableError` is how you
    //   say that.

    logger.warn("process-document not implemented yet", { event: event.name });
  },
);
