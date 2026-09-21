/**
 * The ToolLoopAgent that turns free text into a structured purchase proposal.
 *
 * Shape of the call (AI SDK v7):
 *
 *   import { ToolLoopAgent, Output, isStepCount } from 'ai';
 *
 *   const agent = new ToolLoopAgent({
 *     model,
 *     system: SYSTEM_PROMPT,
 *     tools: buildAgentTools({ documentId }),
 *     stopWhen: isStepCount(8),
 *     output: Output.object({ schema: agentProposalSchema }),
 *   });
 *   const { output, steps } = await agent.generate({ prompt: requestText });
 *
 * Note that producing the structured output counts as a step, so `stopWhen`
 * has to leave room for the tool calls AND the final answer.
 */
import { agentProposalSchema } from "@vientos/shared";

import { model } from "./model.ts";
import { SYSTEM_PROMPT } from "./prompt.ts";
import { buildAgentTools } from "./tools.ts";

export interface RunAgentOptions {
  requestText: string;
  documentId: string;
}

export interface AgentRunResult {
  proposal: unknown;
  /** Which tools were called, in order — evidence that the SOP was consulted. */
  toolTrace: Array<{ tool: string; input: unknown }>;
}

// TODO(6.7): Implement `runPurchaseAgent`.
//   1. Build the agent as sketched above.
//   2. Run it and pull the tool calls out of `result.steps` into `toolTrace`.
//   3. Assert that `readSop` was actually called. If the model answered
//      without reading the SOP, that is a blocked request, not a valid
//      proposal — the brief requires the decision to be grounded.
//   4. Return the raw output; DO NOT apply business rules here. Validation
//      lives in `domain/decision.ts`.
export async function runPurchaseAgent(_options: RunAgentOptions): Promise<AgentRunResult> {
  void model;
  void SYSTEM_PROMPT;
  void buildAgentTools;
  void agentProposalSchema;
  throw new Error("runPurchaseAgent not implemented — see TODO(6.7)");
}
