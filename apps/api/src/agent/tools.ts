/**
 * The agent's tools. This is how it reaches the knowledge and the catalog.
 *
 * The brief requires you to DEMONSTRATE that the agent consults the knowledge
 * base, so make the tool calls observable: log every call with its input and
 * the size of what it returned, and keep the trace on the request row so the
 * detail screen can show it.
 */
import { tool } from "ai";
import { z } from "zod";

/**
 * Tools are built per-request, closing over the PINNED document id. That is
 * deliberate: a tool that looks up "the current SOP" on its own would let a
 * fresh upload change the answer mid-run.
 */
export function buildAgentTools(_options: { documentId: string }) {
  return {
    // TODO(6.6a): `readSop` — return the extracted text of the pinned document.
    //   The brief says documents are small enough to pass whole: no embeddings,
    //   no vector store. Still, return it in a predictable envelope
    //   ({ title, text }) so the model can cite it, and consider truncating
    //   with an explicit marker rather than silently cutting the text.
    readSop: tool({
      description: "TODO(6.6a)",
      inputSchema: z.object({}),
      execute: async (): Promise<{ title: string; text: string }> => {
        throw new Error("readSop not implemented — see TODO(6.6a)");
      },
    }),

    // TODO(6.6b): `searchCatalog` — look items up by free text and/or category.
    //   Return sku, name, category and unit price. Returning the price is fine
    //   (the model needs to reason about thresholds) but the number the ORDER
    //   uses is re-read from the catalog by `domain/pricing.ts`. Never trust
    //   the price that comes back inside the proposal.
    searchCatalog: tool({
      description: "TODO(6.6b)",
      inputSchema: z.object({
        query: z.string().describe("Free-text description of the product wanted."),
      }),
      execute: async (): Promise<
        Array<{ sku: string; name: string; category: string; unitPriceCents: number }>
      > => {
        throw new Error("searchCatalog not implemented — see TODO(6.6b)");
      },
    }),
  };
}

export type AgentTools = ReturnType<typeof buildAgentTools>;
