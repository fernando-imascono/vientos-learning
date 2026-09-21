/**
 * The agent's system prompt.
 *
 * READ THIS BEFORE YOU WRITE IT: the brief says the purchasing rules must come
 * from the SOP, "no estar copiadas en el prompt ni fijadas en el código".
 * So this prompt may describe the agent's JOB and its LIMITS, but it must not
 * contain a single euro threshold, a forbidden category, or an approval rule.
 * If you can change the outcome of the demo by editing this file, the exercise
 * has failed.
 *
 * A useful test: grep this file for a number. There should not be one that
 * belongs to the purchasing policy.
 */

// TODO(6.5): Write the system prompt. Cover, at minimum:
//   - Role: you turn a free-text purchase request into a structured proposal.
//   - Source of truth: the SOP retrieved with the `readSop` tool. You MUST
//     call it. Nothing you remember about purchasing policy counts.
//   - Products: only SKUs returned by the `searchCatalog` tool exist.
//   - Grounding: every route decision must quote the SOP fragment that
//     supports it, verbatim.
//   - Honest failure: if the request is incomplete, or the SOP is silent or
//     ambiguous, choose `block` and say what is missing. Never assume
//     authorisation.
//   - What is NOT yours: prices, totals and whether an approval was granted.
//   - Language: answer in the language the user wrote in.
export const SYSTEM_PROMPT = `TODO(6.5)`;
