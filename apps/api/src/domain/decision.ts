/**
 * The guard rail between the model and the database.
 *
 * "El agente interpreta el SOP; el código valida datos y ejecuta la ruta, sin
 *  inventar pasos o permisos."
 *
 * Nothing in this file may consult the LLM, and nothing in this file may
 * contain a purchasing rule. It checks that what the agent proposed is
 * well-formed, real and priced correctly; the SOP decides the rest.
 */
import type { PurchaseRoute } from "@vientos/shared";

export type DecisionOutcome =
  | { kind: "ordered"; route: Extract<PurchaseRoute, "continue"> }
  | { kind: "needs-approval"; route: Extract<PurchaseRoute, "require_approval"> }
  | { kind: "blocked"; route: Extract<PurchaseRoute, "block">; reason: string };

// TODO(7.4): Implement `validateProposal(rawProposal, context)`.
//   In order:
//   1. Parse `rawProposal` with `agentProposalSchema`. A parse failure is a
//      BLOCK ("the agent returned something we cannot act on"), never a crash.
//   2. Check the route is one of the three. (The schema does this; the point
//      is that there is no fourth path in your switch either.)
//   3. Price the items with `pricing.ts`. Unknown sku, zero or negative
//      quantity, empty item list on a `continue` route -> BLOCK with a reason.
//   4. Verify the citations are real: every quoted fragment must actually
//      appear in the pinned SOP text. A fabricated quotation is the single
//      most important thing this exercise teaches you to catch — normalise
//      whitespace, then substring-match. If it is not in the document, BLOCK.
//   5. Return a `DecisionOutcome` plus the priced lines and total.
//
//   Note what is NOT here: you do not re-derive the 500 EUR threshold, and you
//   do not second-guess `require_approval`. Those come from the SOP. You only
//   refuse things that are false or impossible.

// TODO(8.6): Implement `canAcceptApproval(request)` — returns whether an
//   incoming approve/reject is still valid. A request that already expired,
//   was rejected, or was ordered must reject the decision with a 409, so a
//   late click cannot revive it.
