/**
 * TanStack Query hooks for purchase requests.
 */

/** The endpoints this feature talks to. Keep the paths here, not inline in hooks. */
export const requestEndpoints = {
  list: "/requests",
  create: "/requests",
  detail: (id: string) => `/requests/${id}`,
  decision: (id: string) => `/requests/${id}/decision`,
} as const;

// TODO(5.4): `useCreateRequest()` — `useMutation` posting the free text.
//   On success, invalidate `queryKeys.requests` and navigate to the detail
//   screen; the work continues in the background.

// TODO(5.5): `useRequests()` — the list, with status and total.

// TODO(9.4): `useRequest(id)` — the detail. Poll while the status is one the
//   backend can still move on its own (`received`, `analyzing`); stop polling
//   once it is `awaiting_approval` or terminal. `awaiting_approval` can last
//   three days — polling it every two seconds is pointless.

// TODO(8.7): `useDecideRequest(id)` — `useMutation` posting approve/reject.
//   Handle the 409 from a late or duplicate decision as a normal outcome:
//   refetch and show why it no longer applies, do not throw a red banner.
