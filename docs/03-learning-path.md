# Learning path

Every `TODO(n.m)` in the codebase maps to a step below. Work in order — each
step leaves the app in a state you can actually run and look at.

`rg "TODO\(" -n` lists them all. Suggested pacing for a week and a half is in
the right-hand column; it is a guide, not a deadline.

---

## Step 0 — Get it running · _half a day_

Nothing to implement. Confirm the machinery works before you build on it.

- [ ] `corepack enable pnpm && pnpm install` (installs the git hooks too)
- [ ] `cp .env.example .env` and fill in the keys (OpenRouter from Imascono, Reducto from your free credits)
- [ ] `pnpm infra:up` — PostgreSQL on 5432
- [ ] `pnpm dev` — API on 3001, web on 5173
- [ ] `pnpm inngest:dev` in a second terminal — the dev server at 8288 should discover zero functions and not error
- [ ] Open http://localhost:5173 and see the two sections with their TODO panels
- [ ] `pnpm lint && pnpm typecheck && pnpm knip` — all green on a fresh clone

**What to understand:** what each process does and how they find each other.
The Inngest dev server polls your API at `/api/inngest`; that is the whole
integration.

---

## Step 1 — The data model · _1 day_ · `TODO(1.1)`–`TODO(1.8)`

`apps/api/src/db/schema.ts`, `db/seed.ts`, `routes/catalog.ts`, and the catalog
contract in `packages/shared/src/contracts.ts`.

- [ ] Design the five tables. Read the TODOs in `schema.ts` first — they are
      phrased as questions your schema has to answer.
- [ ] `pnpm db:generate && pnpm db:migrate`
- [ ] Seed the catalog from `fixtures/catalog.json`, idempotently
- [ ] `GET /api/catalog` returns it

**Where people go wrong:** storing prices as floats; joining line items to the
catalog instead of copying the price; forgetting the unique constraint on
`orders.request_id` and then discovering the duplicate-order problem on the
last day.

---

## Step 2 — Upload a SOP · _half a day_ · `TODO(2.1)`–`TODO(2.6)`

`routes/documents.ts`, `services/file-storage.ts`.

- [ ] Multipart upload, validated: PDF magic bytes, size limit, generated filename
- [ ] Row inserted as `processing`, file written to `storage/documents/`
- [ ] List and detail endpoints

**Try to break it yourself:** upload a `.png` renamed to `.pdf`; upload a 50 MB
file; upload a file called `../../../etc/passwd.pdf`.

---

## Step 3 — Extraction with Inngest + Reducto · _1 day_ · `TODO(3.1)`–`TODO(3.7)`

`inngest/client.ts`, `inngest/functions/process-document.ts`, `services/reducto.ts`.

- [ ] Declare the event payloads
- [ ] The upload route sends the event **after** the transaction commits
- [ ] The function extracts inside a `step.run` and flips the status
- [ ] A permanent failure (illegible PDF, empty extraction) becomes `failed` with
      a readable reason and is **not** retried

**What to understand:** what a step buys you. Kill the API process midway
through a run and restart it — the extraction must not be paid for twice. This
is the first time Inngest earns its place, so spend the time here.

---

## Step 4 — The Knowledge Base screen · _half a day_ · `TODO(4.1)`–`TODO(4.5)`

`features/knowledge-base/`.

- [ ] Upload form with a real error state
- [ ] List that refreshes while something is processing, and stops when nothing is
- [ ] Review the extracted text

**What to understand:** `refetchInterval` as a function of the data. The status
comes from work happening in another process; this is the pattern you will use
again for requests.

---

## Step 5 — Submit a request · _half a day_ · `TODO(5.1)`–`TODO(5.7)`

`routes/requests.ts`, `features/requests/`.

- [ ] Intake endpoint: validate, insert as `received`, commit, send the event
- [ ] List and a form; submitting navigates to the detail screen

At this point the request just sits there. That is correct — the agent is next.

---

## Step 6 — The agent · _1.5 days_ · `TODO(6.1)`–`TODO(6.7)`

`agent/prompt.ts`, `agent/tools.ts`, `agent/purchase-agent.ts`, and the first
half of `process-request.ts`.

- [ ] Resolve and **pin** the active SOP before anything else runs
- [ ] `readSop` and `searchCatalog` tools
- [ ] A system prompt with no purchasing rule in it
- [ ] `ToolLoopAgent` with `Output.object(agentProposalSchema)` and a `stopWhen`
      that leaves room for the tool calls _and_ the final structured answer
- [ ] Capture the tool trace; refuse a proposal produced without calling `readSop`

**The test that matters:** grep `prompt.ts` for a euro amount or a category
name. If you find one, the rules are not coming from the SOP.

**Where people go wrong:** letting the agent return prices or totals; passing
"the current SOP" into the tools instead of a pinned id; a `stopWhen` so tight
the model never reaches the structured output.

---

## Step 7 — Validation and pricing · _1 day_ · `TODO(7.1)`–`TODO(7.4)`

`domain/decision.ts`, `domain/pricing.ts`.

- [ ] Parse the proposal; a parse failure is a block, not a crash
- [ ] Unknown SKU, non-positive quantity → block with a reason
- [ ] Prices and totals from the catalog
- [ ] **Verify every citation actually appears in the pinned SOP text**

**What to understand:** citation verification is the most transferable thing in
this project. A model that quotes a rule which is not in the document is the
failure mode you will meet again in every RAG-ish system you build.

---

## Step 8 — Routes and waiting for a human · _1 day_ · `TODO(8.1)`–`TODO(8.8)`

`process-request.ts`, `routes/requests.ts`, `features/requests/`.

- [ ] Branch on the three routes, and only the three
- [ ] `step.waitForEvent` with a timeout, filtered to this request id
- [ ] Decision endpoint that 409s when the request is no longer waiting
- [ ] Approve / reject UI that cannot fire twice

**Try to break it yourself:** approve after the timeout; click approve twice;
approve a request that was already blocked.

---

## Step 9 — Orders and the detail screen · _half a day_ · `TODO(9.1)`–`TODO(9.5)`

- [ ] Create the order, relying on the unique constraint
- [ ] The detail screen shows the route, the quoted SOP fragments, the priced
      items, the total, and which SOP was used

This is the screen you will demo from. Make it readable.

---

## Step 10 — Durability, idempotency, concurrency · _1 day_ · `TODO(10.1)`

Now go back and make the claims in the brief true.

- [ ] Restart the backend while a request is awaiting approval; it completes afterwards
- [ ] Two requests in flight at once do not mix data
- [ ] The same request cannot run twice concurrently
- [ ] A duplicated approval creates one outcome
- [ ] A transient failure recovers without a duplicate order

**What to understand:** `concurrency`, `idempotency` and the database's own
unique constraints solve different problems. Be able to say which does what —
you will be asked.

---

## Step 11 — Fixtures, demo and README · _half a day_ · `TODO(11.4)`, `TODO(11.5)`

- [ ] Export the SOP to PDF; produce the illegible one as `fixtures/sop/illegible.pdf`
- [ ] Turn the `test.fixme` specs in `packages/e2e/tests/` into real tests
      (`pnpm exec playwright install chromium`, then `pnpm test:e2e`)
- [ ] Walk every scenario in `04-demo-scenarios.md` and note what you saw
- [ ] Storage cleanup and size limits
- [ ] README: how to run it, what you decided, what you left out and why
- [ ] Fill in `05-decisions.md` — including which decisions you made and which
      an AI made for you. The brief asks for exactly that.

---

## Extra A — Pipedream Connect · _only after step 11_ · `TODO(Extra A.3)`

- [ ] Subscribe to a real connector event in development mode
- [ ] Turn it into a request that starts the **same** Inngest process
- [ ] Deduplicate on the connector's event id, so a redelivery does not create a second request

A notification on its own does not complete this extra.

## Extra B — React Flow · `TODO(Extra B.1)`

- [ ] Visualise the workflow, the chosen route, and each step's state, from real data
