/**
 * Journey 2 of the brief: "Tramitar una solicitud".
 *
 * This is the durable heart of the project. It runs the agent, validates what
 * the agent returned, executes the route, and — when approval is required —
 * survives a backend restart while it waits for a human.
 *
 * The division of labour the brief insists on:
 *   the AGENT interprets the SOP;
 *   the CODE validates data and executes the route.
 * If you find yourself trusting a number the model produced, you have crossed
 * the line.
 */
import { inngest } from "../client.ts";
import { requestSubmitted } from "../events.ts";

export const processRequest = inngest.createFunction(
  {
    id: "process-request",
    triggers: [requestSubmitted],
    // TODO(10.1): Two requests must be able to run at once without mixing data,
    //   and the SAME request must never run twice concurrently. Look at
    //   `concurrency: { key: 'event.data.requestId', limit: 1 }` and at
    //   `idempotency`. Write down which one solves which problem — you will be
    //   asked to explain it at the review.
  },
  async ({ event, step, logger }) => {
    void step;

    // TODO(6.1): Load the request row and move it to `analyzing`.

    // TODO(6.2): Resolve the active SOP. If there is no `available` document,
    //   block the request with an explanation and stop. Do not ask the agent
    //   to guess. ("Si faltan datos, no hay SOP utilizable o sus reglas son
    //   ambiguas, se bloquea con una explicación.")

    // TODO(6.3): PIN the document id onto the request row now, inside a step.
    //   Everything downstream reads the pinned id, never "the current SOP".
    //   This is what makes the demo scenario "change a SOP rule and resubmit"
    //   leave the older, waiting request untouched.

    // TODO(6.7): `step.run('run-agent', ...)` — call the purchase agent with
    //   the request text and the pinned document. It returns the structured
    //   proposal. Persist the raw proposal even when validation later rejects
    //   it: at the review you will want to show what the model actually said.

    // TODO(7.1): `step.run('validate-and-price', ...)` — hand the proposal to
    //   `domain/decision.ts`. That is where SKUs are checked against the
    //   catalog, quantities are checked for being positive integers, prices are
    //   read from the catalog and the total is computed. A proposal that fails
    //   validation becomes a BLOCK with an explanation, not a 500.

    // TODO(8.1): Branch on the validated route:
    //   - 'block'            -> mark blocked with the explanation, stop.
    //   - 'continue'         -> create the order (step 9).
    //   - 'require_approval' -> mark `awaiting_approval`, then
    //        await step.waitForEvent('await-approval', {
    //          event: approvalDecided,
    //          timeout: '3d',
    //          if: `async.data.requestId == "${requestId}"`,
    //        });
    //     A null result means the timeout expired -> `expired`, no order.
    //     Rejected -> `rejected`, no order.
    //     A decision arriving AFTER the timeout must not revive the request —
    //     the route that accepts approvals has to check the status first.

    // TODO(9.1): `step.run('create-order', ...)` — insert the order row. Rely
    //   on the UNIQUE constraint from TODO(1.5) and treat a conflict as
    //   success: that is what makes a retried step safe.

    logger.warn("process-request not implemented yet", { event: event.name });
  },
);
