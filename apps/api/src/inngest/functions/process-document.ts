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
import { and, eq } from "drizzle-orm";

import { db } from "../../db/client.ts";
import { knowledgeDocuments } from "../../db/schema.ts";
import { readStoredFile } from "../../services/file-storage.ts";
import { ExtractionFailedError, extractDocument } from "../../services/reducto.ts";
import { inngest } from "../client.ts";
import { documentUploaded } from "../events.ts";

export const processDocument = inngest.createFunction(
  {
    // TODO(3.3): Give this a retry policy and a concurrency limit you can
    //   defend. Reducto has free starter credits — a runaway retry loop spends
    //   them. `retries: 2` plus a small `concurrency` is a sane starting point.
    id: "process-document",
    triggers: [documentUploaded],
    retries: 2,
    concurrency: 2,
    // Only reached when retries run out: a network error, a 5xx, or a bad
    // Reducto API key. None of them is the PDF's fault, so the reason stays
    // generic and the real error goes to the log and the failed run.
    onFailure: async ({ event, error, logger }) => {
      const { documentId } = event.data.event.data;
      logger.error("process-document: retries exhausted", { documentId, error: error.message });
      await markFailed(documentId, "Extraction failed on our side. Try uploading the PDF again.");
    },
  },
  async ({ event, step, logger }) => {
    // TODO(3.4): Load the document row. If it is not in `processing`, return
    //   early — this run is a duplicate and there is nothing to do.
    //   Read outside a step on purpose: Inngest replays the handler after every
    //   step, so this sees the row as it is now, not as it was on the first pass.
    //   Once store-extraction has flipped it to `available`, the replay stops here.
    const { documentId } = event.data;
    const document = await db.query.knowledgeDocuments.findFirst({
      columns: { status: true, pathFile: true, filename: true },
      where: eq(knowledgeDocuments.id, documentId),
    });

    if (!document) {
      // The upload route commits the row before sending the event, so this
      // should not happen. It is worth a warning, not a retry.
      logger.warn("process-document: document not found", { documentId });
      return;
    }
    if (document.status !== "processing") {
      logger.info("process-document: document is not processing, nothing to do", {
        documentId,
        status: document.status,
      });
      return;
    }

    // TODO(3.5): `step.run('extract-with-reducto', ...)` — call the Reducto
    //   client from `services/reducto.ts` and return the extracted text.
    //   Wrapping it in a step is the whole point of Inngest: the call is paid
    //   for once, and a crash after it does not repeat it.
    //   Remember Reducto is asynchronous for larger documents — if you use its
    //   job API, poll inside a step rather than sleeping inside your handler.
    //   The file is read inside the step, so the PDF's bytes never end up in
    //   Inngest's step state; only the result does. Upload and parse happen in
    //   this one step, which is why a 404 from Reducto is safe to retry.
    //   A permanent failure is returned, not thrown. Thrown out of the step it
    //   would reach the handler as a StepError, with the ExtractionFailedError
    //   class lost to serialisation, and the run would still end as failed.
    const extraction = await step.run("extract-with-reducto", async () => {
      const bytes = await readStoredFile(document.pathFile);
      try {
        const result = await extractDocument({ bytes, filename: document.filename });
        logger.info("process-document: extracted", { documentId, ...result.metadata });
        return { ok: true as const, text: result.text, metadata: result.metadata };
      } catch (error) {
        if (error instanceof ExtractionFailedError && error.permanent) {
          logger.warn("process-document: permanent extraction failure", {
            documentId,
            reason: error.message,
          });
          return { ok: false as const, reason: error.message };
        }
        throw error;
      }
    });

    // TODO(3.6): `step.run('store-extraction', ...)` — save the text and flip
    //   the status to `available`.
    //   Setting activated_at is what makes this the active SOP: the active one
    //   is the available document with the highest activated_at.
    if (extraction.ok) {
      await step.run("store-extraction", async () => {
        await db
          .update(knowledgeDocuments)
          .set({
            status: "available",
            extractedText: extraction.text,
            failureReason: null,
            activatedAt: new Date(),
          })
          .where(stillProcessing(documentId));
      });
      return;
    }

    // TODO(3.7): On failure, flip the status to `failed` with a human-readable
    //   reason ("the PDF has no extractable text"), and do NOT rethrow if the
    //   failure is permanent — a scanned/illegible PDF is an expected outcome
    //   of the demo, not an incident. Inngest's `NonRetriableError` is how you
    //   say that.
    //   We return the failure from the step instead (see above): the run ends
    //   as completed, which is what an expected outcome should look like, and
    //   `onFailure` is left for the failures that really are incidents.
    await step.run("mark-failed", () => markFailed(documentId, extraction.reason));
  },
);

/**
 * Only a document still in `processing` can change state. A late onFailure or
 * a duplicate run must not overwrite a document that already became available.
 */
function stillProcessing(documentId: string) {
  return and(eq(knowledgeDocuments.id, documentId), eq(knowledgeDocuments.status, "processing"));
}

async function markFailed(documentId: string, failureReason: string): Promise<void> {
  await db
    .update(knowledgeDocuments)
    .set({ status: "failed", failureReason })
    .where(stillProcessing(documentId));
}
