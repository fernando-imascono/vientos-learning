/**
 * The fixed vocabulary of the exercise, taken straight from the brief.
 *
 * These values are shared by the API, the Inngest functions, the agent's
 * structured output and the web app, so they live in one place. Everything
 * *else* about the data model is yours to design — see `contracts.ts`.
 */
import { z } from "zod";

/** The three routes a purchase request can take. The agent may not invent a fourth. */
export const purchaseRoutes = ["continue", "require_approval", "block"] as const;
export const purchaseRouteSchema = z.enum(purchaseRoutes);
export type PurchaseRoute = z.infer<typeof purchaseRouteSchema>;

/** Lifecycle of an uploaded SOP document. Only `available` documents may be used by the agent. */
export const documentStatuses = ["processing", "available", "failed"] as const;
export const documentStatusSchema = z.enum(documentStatuses);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

/** Lifecycle of a purchase request. */
export const requestStatuses = [
  "received",
  "analyzing",
  "awaiting_approval",
  "approved",
  "rejected",
  "expired",
  "blocked",
  "ordered",
  "failed",
] as const;
export const requestStatusSchema = z.enum(requestStatuses);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

/** Currency and units are fixed by the brief: euros, whole quantities, no tax, no discounts. */
export const CURRENCY = "EUR" as const;

/** Inngest event names. Keep them in one place so producers and consumers cannot drift. */
export const events = {
  documentUploaded: "knowledge/document.uploaded",
  requestSubmitted: "purchase/request.submitted",
  approvalDecided: "purchase/request.approval-decided",
} as const;
