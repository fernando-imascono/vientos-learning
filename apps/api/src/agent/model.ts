/**
 * The language model, configured once.
 *
 * OpenRouter bills Imascono's account, so the key is read from the server
 * environment and never leaves this process. Do not add a route that proxies
 * arbitrary prompts to this model.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { env } from "../config/env.ts";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

export const model = openrouter.chat(env.OPENROUTER_MODEL);
