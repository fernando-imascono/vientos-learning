import { processDocument } from "./process-document.ts";
import { processRequest } from "./process-request.ts";

/** Every function the Inngest dev server should discover. Register new ones here. */
export const functions = [processDocument, processRequest];
