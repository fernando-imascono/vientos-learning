# Demo scenarios

The brief's acceptance table, turned into a checklist. Walk it end to end
before the cross-review and write down what you actually saw — including how to
reproduce the failures.

| #   | Do this                                                                    | It must do this                                                                                                 | Seen |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | Upload a valid SOP and an illegible PDF                                    | The first becomes consultable; the second shows an error. Neither creates a purchase.                           | ☐    |
| 2   | Submit a manual request                                                    | The agent consults the knowledge and the catalog; the UI shows the route and the SOP fragments that justify it. | ☐    |
| 3   | Submit a permitted, an approval-requiring and a prohibited purchase        | Each follows the route the SOP indicates. Rejection and expiry create no order.                                 | ☐    |
| 4   | Change a SOP rule and resubmit the same text as a **new** request          | The decision changes with no code and no prompt edit. The earlier request keeps the SOP it started with.        | ☐    |
| 5   | Submit an incomplete request, and one with no SOP available                | Blocked with an explanation. No invented data, no assumed authorisation.                                        | ☐    |
| 6   | Close the web app and restart the backend during a wait                    | The process survives; it can be completed on return.                                                            | ☐    |
| 7   | Duplicate an approval, force a transient failure, run two requests at once | Recovery with no duplicate orders and no mixed data or decisions.                                               | ☐    |

`fixtures/requests/sample-requests.json` has the text for scenarios 2–5 with
the amounts worked out.

## Scenarios 1–5 are already written as tests

`packages/e2e/tests/` holds them as Playwright specs, marked `test.fixme` so
they do not run yet. Each one names the step that unblocks it — flip `test.fixme`
to `test` when you get there, and adjust the selectors to whatever you actually
built. They are role-based on purpose, so they and `a11y.spec.ts` stay honest
about the same markup.

```bash
pnpm exec playwright install chromium   # once
pnpm test:e2e                           # starts api + web for you
```

`shell.spec.ts` and `a11y.spec.ts` pass on a fresh clone. If they go red,
something in the app's frame broke, not a feature.

Scenarios 6 and 7 are **not** browser journeys — they are about what survives a
process dying and what a retry does. Drive them by hand with the recipes below
and the Inngest dev UI.

## How to reproduce each failure

Being able to _cause_ the failures on demand is part of the hand-in.

**Illegible PDF** — see `fixtures/sop/illegible-sop.md`. Three recipes; the
blank one is the interesting case.

**No SOP available** — start from an empty database, or mark the only document
`failed`. Do not delete the row: a request submitted with no usable knowledge
must block with an explanation, and you want to see that message.

**Backend restart mid-wait** — submit a request that needs approval, wait for
`awaiting_approval`, then kill and restart the API. Approve from the detail
screen. The Inngest run picks up where it was parked.

**Duplicated approval** — the UI should stop you, so bypass it:

```bash
# twice, quickly
curl -X POST localhost:3001/api/requests/<id>/decision \
  -H 'content-type: application/json' -d '{"approved":true}'
```

One order. The second call gets a 409 or is absorbed by the idempotency key —
know which of the two happened and why.

**Transient failure** — make Reducto or the model fail on purpose (point the
base URL at a dead port, or throw from inside a step on the first attempt only)
and watch Inngest retry. The fix must not produce a second order.

**Two at once** — submit the approval scenario and the blocked one within a
second of each other. Check the two runs in the Inngest dev UI and confirm
nothing crossed over.
