# Architecture

## Repository layout

```
.
├── apps/
│   ├── api/                    Hono API, Drizzle, Inngest functions, the agent
│   │   └── src/
│   │       ├── agent/          model, prompt, tools, the ToolLoopAgent
│   │       ├── config/         env parsing (every secret enters here)
│   │       ├── db/             Drizzle schema, client, migrate, seed
│   │       ├── domain/         validation, pricing — the code-side guarantees
│   │       ├── inngest/        client + durable functions
│   │       ├── lib/            logger, HTTP errors
│   │       ├── routes/         HTTP endpoints
│   │       └── services/       Reducto, file storage
│   └── web/                    React + Vite + TanStack Query
│       └── src/
│           ├── components/     shared UI
│           ├── features/       knowledge-base, requests, workflow
│           └── lib/            api client, query client + keys
├── packages/
│   ├── shared/                 Zod contracts and the fixed vocabulary
│   └── typescript-config/      base / node / react tsconfigs
├── docs/                       this folder
├── fixtures/                   catalog, SOP source, sample requests
└── storage/documents/          uploaded PDFs (gitignored, survives restarts)
```

## Where each decision is made

This is the spine of the exercise. Everything else is plumbing.

| Decision                                     | Who makes it | Where                                  |
| -------------------------------------------- | ------------ | -------------------------------------- |
| What the SOP says                            | the SOP      | the uploaded PDF                       |
| Which products and quantities the text means | the agent    | `agent/purchase-agent.ts`              |
| Which route the SOP implies                  | the agent    | same                                   |
| Whether those products exist                 | the code     | `domain/decision.ts`                   |
| Whether quantities are valid                 | the code     | `domain/decision.ts`                   |
| What it costs                                | the code     | `domain/pricing.ts`                    |
| Whether the quoted fragments are real        | the code     | `domain/decision.ts`                   |
| Whether an order may be created              | the code     | `inngest/functions/process-request.ts` |

The agent interprets. The code validates and executes. An agent that returns a
price is proposing something the code will ignore; an agent whose citation is
not in the document has its request blocked.

## Request flow

```
POST /api/requests
  └─ insert request (received) ─ commit ─ inngest.send(purchase/request.submitted)
       │
       └─ Inngest: process-request
            ├─ resolve the active SOP  ──> none available? block, stop
            ├─ PIN the document id onto the request      <-- immutability point
            ├─ step: run the agent (tools: readSop, searchCatalog)
            ├─ step: validate + price the proposal
            └─ route
                 ├─ block             -> blocked, with an explanation
                 ├─ continue          -> step: create order (unique on request id)
                 └─ require_approval  -> awaiting_approval
                                          └─ step.waitForEvent(approval, 3d)
                                               ├─ approved -> create order
                                               ├─ rejected -> rejected
                                               └─ timeout  -> expired
```

`POST /api/requests/:id/decision` does not decide anything itself: it checks the
request is still waiting, then sends the event the run is parked on.

## Document flow

```
POST /api/documents  (multipart)
  └─ validate (PDF magic bytes, size) ─ write to storage/ ─ insert (processing)
       ─ commit ─ inngest.send(knowledge/document.uploaded)
            └─ Inngest: process-document
                 ├─ step: extract with Reducto
                 ├─ success -> save text, status available
                 └─ permanent failure -> status failed + reason (no retry)
```

## Why the boring parts are the way they are

**Insert, commit, _then_ send the event.** Inngest is fast. Send the event
inside the transaction and the function will read a row that does not exist yet.

**The document id is pinned, not looked up.** The agent's tools close over one
document id. "The current SOP" is resolved exactly once per request, and never
again, which is what makes an already-waiting request immune to a new upload.

**Prices are re-read from the catalog.** The agent sees prices so it can reason
about thresholds, but the number stored on the order comes from a fresh query.

**The order table has a unique constraint on the request id.** That single line
is the difference between "recovery without duplicate orders" being a claim and
being true. A retried step hits the constraint and treats it as success.

**Money is integer cents.** Euros, whole quantities, no tax, no discounts — a
float buys nothing here except rounding bugs.
