/**
 * Reducto client — extracts the content of a SOP PDF for the Knowledge Base.
 *
 * Docs: https://docs.reducto.ai
 * Use the free starter credits. Do not enable auto-recharge; if a limit blocks
 * you, ask before changing the plan.
 */
import { env } from "../config/env.ts";

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
export async function extractDocument(_input: {
  bytes: Uint8Array;
  filename: string;
}): Promise<ExtractionResult> {
  void env.REDUCTO_API_KEY;
  throw new Error("extractDocument not implemented — see TODO(3.2)");
}
