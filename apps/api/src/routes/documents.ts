/**
 * Knowledge Base endpoints.
 *
 * Uploading a SOP prepares knowledge. It never starts a purchase — no route in
 * this file may emit `purchase/request.submitted`.
 *
 * House rule (enforced by `local/no-hono-raw-request-access`): never read
 * request input with `c.req.parseBody()`, `c.req.json()` or `c.req.param()`.
 * Declare a Zod schema, wrap the handler in `zValidator(target, schema)` and
 * read it back with `c.req.valid(target)` — that is what keeps the RPC types
 * honest and the validation in one place.
 */
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "../db/client.ts";
import { knowledgeDocuments } from "../db/schema.ts";
import { inngest } from "../inngest/client.ts";
import { documentUploaded } from "../inngest/events.ts";
import { HttpError } from "../lib/http-error.ts";
import { storeUpload } from "../services/file-storage.ts";

export const documentRoutes = new Hono();

// TODO(2.1): POST / — accept a multipart upload.
//   `zValidator('form', z.object({ file: z.instanceof(File) }))`, then
//   `c.req.valid('form')`. Order of operations matters: validate -> store the
//   file -> insert the row as `processing` -> COMMIT -> only then
//   `inngest.send()`. Sending the event before the row is committed is a race
//   you will spend an afternoon on.
//   Respond 202 with the document id; the UI polls (or you add SSE later).

const uploadSchema = z.object({
  file: z.instanceof(File),
});

documentRoutes.post(
  "/",
  zValidator("form", uploadSchema, (result) => {
    if (!result.success) throw result.error;
  }),
  async (c) => {
    const { file } = c.req.valid("form");

    const storedDocument = await storeUpload(file);

    const [document] = await db
      .insert(knowledgeDocuments)
      .values({
        filename: file.name,
        byteSize: storedDocument.bytes,
        pathFile: storedDocument.key,
      })
      .returning({ id: knowledgeDocuments.id });

    if (!document) throw new Error("Insert into knowledge_documents returned no row");

    await inngest.send(
      documentUploaded.create(
        { documentId: document.id },
        { id: `document-uploaded-${document.id}` },
      ),
    );
    return c.json({ id: document.id }, 202);
  },
);

/**
 * The columns of `knowledgeDocumentSchema`, and nothing else: `pathFile` is an
 * internal storage key, and `extractedText` can weigh tens of KB per document
 * in a list the UI polls every two seconds — it ships with the detail only.
 */
const documentListColumns = {
  id: true,
  filename: true,
  status: true,
  failureReason: true,
  byteSize: true,
  activatedAt: true,
  createdAt: true,
} as const;

// TODO(2.5): GET / — list documents with status, newest first.
documentRoutes.get("/", async (c) => {
  const documents = await db.query.knowledgeDocuments.findMany({
    columns: documentListColumns,
    orderBy: [desc(knowledgeDocuments.createdAt)],
  });
  return c.json(documents);
});

// TODO(2.6): GET /:id — one document including the extracted text, so the
//   Knowledge Base screen can let you review what Reducto actually read.
//   Validate the id with `zValidator('param', z.object({ id: z.uuid() }))`.
documentRoutes.get(
  "/:id",
  zValidator("param", z.object({ id: z.uuid() }), (result) => {
    if (!result.success) throw result.error;
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const document = await db.query.knowledgeDocuments.findFirst({
      columns: { ...documentListColumns, extractedText: true },
      where: eq(knowledgeDocuments.id, id),
    });
    if (!document) throw HttpError.notFound("Document not found");
    return c.json(document);
  },
);

// TODO(11.5 — optional): DELETE /:id, and decide what it means for a request
//   that pinned this document. (Hint: it must mean nothing. Soft-delete.)
