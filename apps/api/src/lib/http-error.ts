import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Throw this from a route or service when the caller is at fault. `app.ts`
 * turns it into a JSON body; anything else becomes a 500 with no detail
 * leaked to the client.
 */
export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string, details?: unknown) {
    return new HttpError(400, message, details);
  }

  static notFound(message = "Not found") {
    return new HttpError(404, message);
  }

  static conflict(message: string, details?: unknown) {
    return new HttpError(409, message, details);
  }

  static payloadTooLarge(message: string) {
    return new HttpError(413, message);
  }

  static unprocessable(message: string, details?: unknown) {
    return new HttpError(422, message, details);
  }
}
