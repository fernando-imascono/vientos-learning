import { QueryClient } from "@tanstack/react-query";

/**
 * One client for the app.
 *
 * Note the defaults you will want to revisit once the backend is real: this
 * app watches work that happens elsewhere (Inngest), so a request row changes
 * without the browser doing anything. Either poll with `refetchInterval` on
 * the queries that track a running job, or add SSE later — see
 * docs/03-learning-path.md, step 9.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * Query keys in one place, so invalidation after a mutation is not guesswork.
 *
 * @scaffold Consumed by the hooks at TODO(4.1) and TODO(5.4).
 *   Drop the `@scaffold` tag once they exist.
 */
export const queryKeys = {
  catalog: ["catalog"] as const,
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  requests: ["requests"] as const,
  request: (id: string) => ["requests", id] as const,
};
