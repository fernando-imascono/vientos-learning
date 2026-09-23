/**
 * Drizzle schema — THE central design decision of this project.
 *
 * The brief deliberately leaves the data model to you. Before writing a single
 * column, re-read "Reglas y datos de partida" and "Qué debe verse funcionando"
 * and make sure your tables can answer these questions:
 *
 *   - Which SOP was used by request #42, even after someone uploads a new one?
 *     ("Cambiar el documento no debe alterar una compra que ya está esperando
 *      aprobación.")
 *   - What exactly did the agent propose, and which SOP fragments justified it?
 *   - What did the CODE compute (prices, totals, final route) as opposed to
 *     what the model claimed?
 *   - Was this request already turned into an order? (Asked twice, by a retry.)
 *
 * Tip: `pnpm db:generate` writes the SQL, `pnpm db:migrate` applies it. Never
 * hand-edit a generated migration that has already run.
 */
import type { AgentProposal } from "@vientos/shared";
import { documentStatuses, requestStatuses } from "@vientos/shared";
import { pgTable, pgEnum, integer, varchar, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

// TODO(1.1): `catalogItems` — the local product catalog.
//   Small and synthetic: a handful of rows across 3-4 categories, one of which
//   the SOP forbids. Price in integer cents; the brief says euros, whole
//   quantities, no tax and no discounts, so a numeric/decimal type buys you
//   nothing but rounding bugs.
export const catalogItems = pgTable("catalog_items", {
  sku: varchar().primaryKey(),
  name: varchar().notNull(),
  category: varchar().notNull(),
  unitPriceCents: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO(1.2): `knowledgeDocuments` — one row per uploaded SOP PDF.
//   Needs at least: id, original filename, byte size, the path/key of the
//   stored file, status (processing | available | failed), the extracted text
//   once Reducto returns it, a failure reason, timestamps.
//   Decide now how "the one active SOP" is represented — a boolean, a
//   timestamp, or simply "the most recent available document". Whichever you
//   pick, a request must pin the concrete document id, not the rule.

export const documentStatusEnum = pgEnum("document_status", documentStatuses);
export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid().primaryKey().defaultRandom(),
  filename: varchar().notNull(),
  byteSize: integer().notNull(),
  pathFile: varchar().notNull(),
  status: documentStatusEnum().notNull().default("processing"),
  extractedText: varchar(),
  failureReason: varchar(),
  activatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO(1.3): `purchaseRequests` — one row per submitted request.
//   Needs at least: id, the raw text the user typed, status, the id of the
//   knowledge document it was resolved against (nullable until resolved, then
//   frozen), the agent's proposal, the code's validated decision, the computed
//   total, timestamps.
//   Think about where the Inngest run id goes — you will want it when a run
//   fails and you are staring at a stuck row.
export const requestStatusesEnum = pgEnum("request_status", requestStatuses);
export const purchaseRequests = pgTable("purchase_requests", {
  id: uuid().primaryKey().defaultRandom(),
  requestText: varchar().notNull(),
  status: requestStatusesEnum().notNull().default("received"),
  knowledgeDocumentId: uuid().references(() => knowledgeDocuments.id),
  proposal: jsonb().$type<AgentProposal>(),
  decision: jsonb(),
  totalCents: integer(),
  inngestRunId: varchar(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO(1.4): `purchaseRequestItems` — the priced line items.
//   Store the unit price AS IT WAS at decision time, not a join to the catalog:
//   the catalog can change, a decided request cannot.
export const purchaseRequestItems = pgTable("purchase_request_items", {
  id: uuid().primaryKey().defaultRandom(),
  purchaseRequestId: uuid()
    .references(() => purchaseRequests.id)
    .notNull(),
  sku: varchar()
    .references(() => catalogItems.sku)
    .notNull(),
  quantity: integer().notNull(),
  unitPriceCents: integer().notNull(),
  lineTotalCents: integer().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO(1.5): `orders` — the record created when a request is allowed to continue.
//   Not a purchase and not a payment: a row that proves the route was executed.
//   Give it a UNIQUE constraint on the request id. That single constraint is
//   what makes "recovery without duplicate orders" true even if an Inngest step
//   runs twice — see docs/03-learning-path.md, step 10.
export const orders = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  purchaseRequestId: uuid()
    .references(() => purchaseRequests.id)
    .unique()
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// TODO(1.6 — optional, do it once step 8 is working): `approvalDecisions`
//   An audit row per approve/reject, so a late or duplicated decision is
//   visible instead of silently ignored.
