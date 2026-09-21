/**
 * Money. Euros, integer cents, whole quantities, no tax, no discounts.
 *
 * Every number the user sees must be traceable to a catalog row — never to
 * something the model said.
 */

export interface ProposedItem {
  sku: string;
  quantity: number;
}

export interface PricedLine {
  sku: string;
  name: string;
  quantity: number;
  /** Copied from the catalog at decision time, never joined at read time. */
  unitPriceCents: number;
  lineTotalCents: number;
}

export type PricingResult =
  | { ok: true; lines: PricedLine[]; totalCents: number }
  | { ok: false; reason: string };

// TODO(7.2): Implement `priceLineItems`.
//   Look every sku up in the catalog (one query, not N), reject unknown skus,
//   reject quantities that are not positive integers, multiply by the CATALOG
//   unit price, and return the priced lines plus the total.
//   Return `{ ok: false, reason }` rather than throwing on business failures —
//   the caller turns "unknown sku" into a blocked request with an explanation.
export async function priceLineItems(_items: ProposedItem[]): Promise<PricingResult> {
  throw new Error("priceLineItems not implemented — see TODO(7.2)");
}

// TODO(7.3): Decide where euros get formatted — here for the API responses, or
//   in the web app alone. Pick one and be consistent; the usual bug is
//   formatting in both places and disagreeing.
