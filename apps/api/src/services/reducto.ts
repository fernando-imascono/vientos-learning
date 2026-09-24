/**
 * Reducto client — extracts the content of a SOP PDF for the Knowledge Base.
 *
 * Docs: https://docs.reducto.ai
 * Use the free starter credits. Do not enable auto-recharge; if a limit blocks
 * you, ask before changing the plan.
 */
import Reducto, { APIError, toFile } from "reductoai";
import { z } from "zod";

import { env } from "../config/env.ts";

// Retries belong to Inngest alone. The SDK retries timeouts and 5xx on its own
// by default, and every retried parse is paid for again.
const client = new Reducto({ apiKey: env.REDUCTO_API_KEY, maxRetries: 0 });

export interface ExtractionResult {
  /** The SOP as text the agent can read and quote. */
  text: string;
  /** Anything worth showing on the Knowledge Base screen: page count, job id... */
  metadata: Record<string, unknown>;
}

export class ExtractionFailedError extends Error {
  constructor(
    message: string,
    /** True when retrying cannot help — an illegible PDF, not a 503. */
    readonly permanent: boolean,
  ) {
    super(message);
    this.name = "ExtractionFailedError";
  }
}

// TODO(3.2): Implement `extractDocument`.
//   - Upload the PDF, then parse it. Reducto's flow is upload -> parse, and
//     parsing can be asynchronous for bigger files; check whether you get a
//     result inline or a job you have to poll.
//   - Flatten the structured result into plain text. Keep headings and list
//     markers: the agent has to quote fragments back, and "5.2 Purchases above
//     500 EUR require approval" is a far better citation than a naked sentence.
//   - Distinguish the two failure kinds. An illegible PDF raises
//     `ExtractionFailedError(..., permanent: true)` and becomes a `failed`
//     document; a network blip is thrown as-is so Inngest retries it.
//   - Never log the API key. Log the job id.
export async function extractDocument(input: {
  bytes: Uint8Array;
  filename: string;
}): Promise<ExtractionResult> {
  let response: Reducto.ParseRunResponse;
  try {
    const file = await toFile(input.bytes, input.filename);
    const upload = await client.upload({ file });
    response = await client.parse.run({ input: upload.file_id });
  } catch (error) {
    if (error instanceof APIError && PERMANENT_STATUSES.has(error.status ?? 0)) {
      throw new ExtractionFailedError(
        `Reducto rejected the document (${error.status}): ${error.message}`,
        true,
      );
    }
    throw error;
  }

  // Without `async` in the params the parse is synchronous, but the SDK's
  // return type still allows a job id. Retrying would get the same answer.
  if (!("result" in response)) {
    throw new Error(`Reducto answered with an async job (${response.job_id}) to a sync parse`);
  }

  const chunks =
    response.result.type === "full"
      ? response.result.chunks
      : await fetchChunks(response.result.url);

  const text = flatten(chunks);
  if (text.trim() === "") {
    throw new ExtractionFailedError(
      "No text could be extracted from the PDF (is it a scan without OCR?)",
      true,
    );
  }

  return {
    text,
    metadata: {
      jobId: response.job_id,
      pages: response.usage.num_pages,
      durationSeconds: response.duration,
    },
  };
}

/**
 * Status codes where retrying the same call cannot help: the document or the
 * request itself is wrong. 401/403 are left out on purpose — a bad API key is
 * a configuration problem, not the PDF's fault, so it is rethrown and shows up
 * as a failed run in Inngest. 404 is left out because the upload and the parse
 * run in the same step: a retry uploads the file again.
 */
const PERMANENT_STATUSES = new Set([400, 413, 422]);

/** Large results come back as a presigned URL instead of inline chunks. */
async function fetchChunks(url: string): Promise<Chunk[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Downloading the Reducto result failed: ${res.status}`);
  return urlResultSchema.parse(await res.json()).chunks;
}

const urlResultSchema = z.object({
  chunks: z.array(
    z.object({ blocks: z.array(z.object({ type: z.string(), content: z.string() })) }),
  ),
});
type Chunk = z.infer<typeof urlResultSchema>["chunks"][number];

/** Blocks that repeat on every page and would only add noise to a citation. */
const SKIPPED_BLOCKS = new Set(["Header", "Footer", "Page Number"]);

/**
 * One block per paragraph, with Markdown markers on titles and headings so the
 * agent can quote "5.2 Purchases above 500 EUR require approval" with its
 * section. List items keep the numbering Reducto already put in `content`.
 */
function flatten(chunks: Chunk[]): string {
  return chunks
    .flatMap((chunk) => chunk.blocks)
    .filter((block) => !SKIPPED_BLOCKS.has(block.type) && block.content.trim() !== "")
    .map((block) => {
      if (block.type === "Title") return `# ${block.content}`;
      if (block.type === "Section Header") return `## ${block.content}`;
      if (block.type === "List Item" && !/^\s*([-*•]|\d+[.)])\s/.test(block.content)) {
        return `- ${block.content}`;
      }
      return block.content;
    })
    .join("\n\n");
}
