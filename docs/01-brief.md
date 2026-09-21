# The brief, condensed

The authoritative document is `proyecto-aprendizaje-vientos.pdf`. This page is a
working summary; when the two disagree, the PDF wins.

**Duration:** one and a half weeks · **Mode:** individual, three people building
the same project and sharing what they learn. The goal is familiarity with the
Vientos stack, not competition.

## What gets built

A web app with two sections.

- **Knowledge Base** — upload a company purchasing procedure (a synthetic SOP,
  as a PDF). Uploading prepares knowledge; it does **not** start a purchase.
- **Requests** — write a purchase request in plain language. An agent consults
  the SOP and the catalog, picks a route, and explains which rules it applied.

## The stack, and what each piece is for

| Technology                  | Role here                                                                 |
| --------------------------- | ------------------------------------------------------------------------- |
| TypeScript + Turborepo      | Monorepo: a web app, an API, shared packages where they earn their place. |
| React + TanStack Query      | UI, server state, refreshing while work runs elsewhere.                   |
| Hono + PostgreSQL + Drizzle | API and persistence of knowledge, requests and decisions.                 |
| Inngest                     | Durable orchestration of document processing and of requests.             |
| Vercel AI SDK               | A `ToolLoopAgent` with tools for querying the knowledge and the catalog.  |
| OpenRouter                  | DeepSeek V4.1 Flash, on Imascono's key.                                   |
| Reducto                     | Extracting the SOP's content for the Knowledge Base.                      |
| Pipedream Connect           | Optional extra: start requests from a connector event.                    |

## Accounts and spending

Free tiers only: Inngest free plan, Reducto's initial free credits, Pipedream
Connect development mode. **Do not buy a plan or enable auto-recharge.** If a
limit blocks you, ask.

The LLM spends Imascono's OpenRouter account. Keys are configured on the backend
only — never in the browser, never in the repository.

## The two journeys

**1 · Prepare the knowledge.** Upload the SOP PDF → the backend validates and
stores it and starts Inngest → Reducto extracts the content → the result is
saved so the agent can consult it. The web shows processing / available /
failed, and lets you review the extracted text. Only an _available_ SOP can be
used. One active SOP is enough. The documents are small, so reading the full
text is fine: **no embeddings, no vector database.**

**2 · Process a request.** The user writes, say, _«Necesito comprar dos
monitores para el equipo de diseño»_ and submits → the backend records it and
starts Inngest → the agent runs automatically, consults the SOP and the catalog
through tools, and returns a structured proposal with products, quantities, the
chosen route and a justification backed by **real fragments of the SOP** → the
backend validates the proposal and computes the amount from catalog prices →
the route is one of **continue, require approval, block** → if approval is
needed, Inngest waits for a decision from the detail screen; approving lets it
continue, rejecting or letting it expire prevents the order, and a late answer
does not revive the request → if it continues, an order row is created in
PostgreSQL (a record, not a real purchase or payment).

## The rule that defines the exercise

> Purchasing rules must come from the SOP, not be copied into the prompt or
> fixed in the code.

The code does own the common guarantees: valid products, positive quantities,
catalog prices, permitted routes, and an accepted approval before creating an
order that needs one. When data is missing, there is no usable SOP, or its rules
are ambiguous, the request is **blocked with an explanation** — authorisation is
never assumed.

Euros, whole quantities, no tax, no discounts. No clarification chat: a wrong
request is corrected by submitting a new one. Keep the reference to the SOP that
was used — changing the document must not alter a purchase already awaiting
approval.

## Scope

Local development with synthetic data. PDFs in a directory that survives
restarts, with size limits and cleanup. The same person may both request and
approve. **Not required:** S3, authentication, multitenancy, advanced RAG.

## Extras, after the required journey works

- **Pipedream Connect** — subscribe to a real connector event (a message in a
  test channel, say) and turn it into a request. It must start the _same_
  Inngest process as manual entry and must not duplicate on redelivery.
  Sending a notification does not count.
- **React Flow** — visualise the workflow, the chosen route and the state of
  each step. No editor needed.

## Hand-in

Repository and instructions for bringing up the monorepo, PostgreSQL and
Inngest; `.env.example` with no secrets; catalog, SOP and sample requests; a
short README with decisions and limits. Demonstrate the scenarios and say how to
reproduce the failures. Keep the last days for cross-review.

The data schema, the endpoints, the agent's tools and the recovery strategy are
yours to decide, using official guides. AI is allowed, but you must explain who
made each decision and show that the agent consults the knowledge.
