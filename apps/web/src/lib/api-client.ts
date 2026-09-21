/**
 * Thin fetch wrapper around our own API.
 *
 * The browser only ever talks to this backend — never to OpenRouter, Reducto
 * or Inngest. If you find yourself needing a third-party key in this folder,
 * the call belongs on the server instead.
 */
import type { z } from "zod";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorBody {
  error?: string;
  details?: unknown;
}

/**
 * `HeadersInit` can be an array of tuples or a `Headers`, so it must not be
 * object-spread. Build a real `Headers` and let it do the merging.
 */
function buildHeaders(init: RequestInit | undefined): Headers {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return headers;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  try {
    const parsed: unknown = await response.json();
    return parsed;
  } catch {
    return null;
  }
}

function asErrorBody(payload: unknown): ErrorBody {
  return typeof payload === "object" && payload !== null ? payload : {};
}

/**
 * Every response is parsed with the same Zod schema the server validated it
 * against, so a contract drift shows up here instead of as `undefined` three
 * components deep. Pass a schema from `@vientos/shared`.
 */
async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: RequestInit,
): Promise<z.output<S>> {
  const response = await fetch(`/api${path}`, { ...init, headers: buildHeaders(init) });
  const payload = await readBody(response);

  if (!response.ok) {
    const body = asErrorBody(payload);
    throw new ApiError(
      response.status,
      body.error ?? `Request failed (${response.status})`,
      body.details,
    );
  }

  return schema.parse(payload);
}

export const api = {
  get: <S extends z.ZodType>(path: string, schema: S) => request(path, schema),
  post: <S extends z.ZodType>(path: string, schema: S, body?: unknown) =>
    request(path, schema, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
};
