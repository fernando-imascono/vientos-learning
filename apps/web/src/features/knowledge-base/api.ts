/**
 * TanStack Query hooks for the Knowledge Base.
 */

/** The endpoints this feature talks to. Keep the paths here, not inline in hooks. */
export const knowledgeBaseEndpoints = {
  list: "/documents",
  upload: "/documents",
  detail: (id: string) => `/documents/${id}`,
} as const;

// TODO(4.1): `useDocuments()` — `useQuery` over `GET /documents`.
//   While any document is `processing`, this list has to keep refreshing.
//   Look at `refetchInterval` as a function of the query data: return 2000
//   when something is processing and `false` when nothing is. Polling
//   forever is the lazy version and it will show up in review.

// TODO(4.2): `useUploadDocument()` — `useMutation` posting a `FormData`.
//   On success, invalidate `queryKeys.documents`. Surface the server's error
//   message (413, wrong type) in the UI verbatim; the demo has to show a
//   readable failure for the illegible PDF.

// TODO(4.3): `useDocument(id)` — the detail, including the extracted text.
