/**
 * API contracts shared by `apps/api` and `apps/web`.
 *
 * Define each shape ONCE here as a Zod schema, infer the TypeScript type from
 * it, and use the same schema to validate on the server and to type the
 * TanStack Query hooks on the client. That is the whole reason this package
 * exists — if you end up with two copies of a shape, delete one.
 */
import { z } from "zod";

import { documentStatusSchema, purchaseRouteSchema, requestStatusSchema } from "./vocabulary.js";

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

// TODO(1.3): Model a catalog item.
//   Minimum the brief needs: a stable id/sku, a name, a category (one of which
//   the SOP will forbid) and a unit price in whole euro cents.
//   Prices come from the catalog, never from the agent — keep the field name
//   explicit (`unitPriceCents`) so nobody mistakes euros for cents.
export const catalogItemSchema = z.object({
  sku: z.string().nonempty(),
  name: z.string().nonempty(),
  category: z.string().min(1),
  unitPriceCents: z.int().nonnegative(),
});
export type CatalogItem = z.infer<typeof catalogItemSchema>;

// ---------------------------------------------------------------------------
// Knowledge Base documents
// ---------------------------------------------------------------------------

// TODO(2.4): Model the document as the web app sees it.
//   The Knowledge Base screen has to show: filename, status
//   (processing / available / failed), when it was uploaded, the failure
//   reason when it failed, and it must let you review the extracted text.
//   Decide whether the extracted text ships with the list item or only with
//   the detail response — the list will be much lighter if it does not.
export const knowledgeDocumentSchema = z.object({
  id: z.uuid(),
  filename: z.string().nonempty(),
  status: documentStatusSchema,
  failureReason: z.string().nullable(),
  byteSize: z.int().positive(),
  activatedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
});
export type KnowledgeDocument = z.infer<typeof knowledgeDocumentSchema>;

export const knowledgeDocumentDetailSchema = knowledgeDocumentSchema.extend({
  extractedText: z.string().nullable(),
});
export type KnowledgeDocumentDetail = z.infer<typeof knowledgeDocumentDetailSchema>;

// ---------------------------------------------------------------------------
// Purchase requests
// ---------------------------------------------------------------------------

// TODO(5.2): Model the request-intake payload. It is one free-text field in
//   the UI; keep a sane max length and reject empty/whitespace input here
//   rather than in the route handler.
export const createRequestInputSchema = z.object({
  // ...
});
export type CreateRequestInput = z.infer<typeof createRequestInputSchema>;

/**
 * What the AGENT is allowed to return. This is the contract between the LLM
 * and your code, so it is also your safety boundary.
 *
 * Read the brief carefully before writing it: the agent proposes products,
 * quantities, a route and a justification grounded in real SOP fragments. It
 * does NOT get to state prices, totals, or whether an approval was granted —
 * the code computes those. If you put `totalCents` in here you have handed the
 * model a decision that the exercise explicitly assigns to the backend.
 */
// TODO(6.4): Define the agent's structured output.
//   Suggested shape:
//     - items: [{ sku, quantity }]            <- quantity positive integer
//     - route: 'continue' | 'require_approval' | 'block'
//     - reasoning: short explanation in the user's language
//     - citations: [{ quote, where }]         <- literal fragments of the SOP
//     - missingInformation: string[]          <- why it cannot decide, if so
//   Keep every field required; optional fields let the model stay silent.
export const agentProposalSchema = z.object({
  route: purchaseRouteSchema,
  // ...
});
export type AgentProposal = z.infer<typeof agentProposalSchema>;

// TODO(9.2): Model the request as the detail screen sees it.
//   The screen must show: the original text, the status, the route the agent
//   chose, the SOP fragments that justify it, the priced line items and total,
//   the id (and version) of the SOP that was used, and the approve/reject
//   controls while it is waiting.
export const purchaseRequestSchema = z.object({
  status: requestStatusSchema,
  // ...
});
export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

// TODO(8.5): Model the approval decision sent from the detail screen.
//   Think about idempotency here, not only shape: this payload is what a
//   double-clicked "Approve" button sends twice.
export const approvalDecisionSchema = z.object({
  // ...
});
export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;
