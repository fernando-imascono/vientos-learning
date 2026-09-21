# Vientos · Purchase Requests

Learning project: a web app where you upload a company purchasing procedure
(a SOP, as a PDF) and then write purchase requests in plain language. An agent
reads the SOP and the catalog, chooses a route — continue, require approval, or
block — and explains which rules it applied.

The full brief is `proyecto-aprendizaje-vientos.pdf`, condensed in
[`docs/01-brief.md`](docs/01-brief.md).

> **This repository is a scaffold.** The plumbing is wired; everything worth
> learning is a `TODO(n.m)` waiting for you. Run `rg "TODO\(" -n` to see them
> all, and work through [`docs/03-learning-path.md`](docs/03-learning-path.md)
> in order.

## Getting started

```bash
corepack enable pnpm     # pnpm is not installed on this machine yet
pnpm install

cp .env.example .env     # then fill it in — see below
pnpm infra:up            # PostgreSQL 17 in Docker, on 5432

pnpm dev                 # API on :3001, web on :5173
pnpm inngest:dev         # second terminal — Inngest dev server on :8288
```

Open http://localhost:5173. Both sections render their TODO panels; nothing is
implemented yet, and that is the starting line.

Once you reach step 1 of the learning path:

```bash
pnpm db:generate   # Drizzle writes the SQL from src/db/schema.ts
pnpm db:migrate    # apply it
pnpm db:seed       # load fixtures/catalog.json
pnpm db:studio     # browse the data
```

## Keys

Copy `.env.example` to `.env` and fill in:

| Variable             | Where it comes from                                 |
| -------------------- | --------------------------------------------------- |
| `OPENROUTER_API_KEY` | Imascono provides it. It spends Imascono's account. |
| `REDUCTO_API_KEY`    | Your own free starter credits.                      |
| `INNGEST_*`          | Not needed while you use the local dev server.      |

Use free tiers only. **Do not buy a plan or enable auto-recharge**; if a limit
blocks you, ask first.

Every key lives on the backend. `.env` is gitignored and `.env.example` holds
placeholders only — no real value ever goes into the repository, a commit, a
log or an issue. If one leaks, revoke and rotate it, then strip it from the
history.

## Layout

| Path                         | What it is                                                       |
| ---------------------------- | ---------------------------------------------------------------- |
| `apps/api`                   | Hono API, Drizzle schema, Inngest functions, the agent           |
| `apps/web`                   | React + Vite + TanStack Query                                    |
| `packages/shared`            | Zod contracts and the fixed vocabulary, shared by both           |
| `packages/typescript-config` | Base tsconfigs                                                   |
| `fixtures/`                  | Catalog, SOP source, sample requests                             |
| `docs/`                      | Brief, architecture, learning path, demo checklist, decision log |
| `storage/documents/`         | Uploaded PDFs — persists across restarts, gitignored             |

[`docs/02-architecture.md`](docs/02-architecture.md) has the full tree and,
more usefully, a table of **who decides what**: the agent interprets the SOP,
the code validates the data and executes the route.

## The one rule that defines the exercise

Purchasing rules come from the uploaded SOP — never from the prompt, never from
the code. The test: edit a threshold in `fixtures/sop/purchasing-sop.md`,
re-export it to PDF, upload it, resend the same request text as a new request.
The decision must change with no edit to any prompt or any line of code.

## Scripts

| Command                        | What it does                           |
| ------------------------------ | -------------------------------------- |
| `pnpm dev`                     | API + web, in watch mode               |
| `pnpm build`                   | Build everything through Turborepo     |
| `pnpm typecheck`               | Type-check every workspace             |
| `pnpm infra:up` / `infra:down` | PostgreSQL in Docker                   |
| `pnpm inngest:dev`             | Inngest dev server, pointed at the API |
| `pnpm db:*`                    | generate · migrate · seed · studio     |

## Quality tooling

Same setup as the other Imascono repos (`template-frontend-backend`), minus
anything that deploys: **no CI workflows, no Dockerfile, no Helm, no deploy
config.** Everything below runs on your machine.

- **oxlint** with the shared rule set plus the local plugins in
  `linter-plugins/` — `no-hono-raw-request-access` (read request input through
  `zValidator` + `c.req.valid()`, never `c.req.json()`),
  `no-exported-function-expressions`, `match-component-filename`,
  `test-file-location`, `no-lint-disable`. `no-raw-html-elements` ships with the
  plugin but is **off**: it routes elements through shadcn/ui, and this project
  has no design system to route them to.
- **oxfmt** with import sorting. **knip** for dead code. **jscpd** for
  copy-paste. **vitest** for unit tests. **Playwright** for e2e.
- **lefthook** installs a local pre-commit hook on `pnpm install`: format →
  lint → knip → jscpd → typecheck → test. Local only; it pushes nothing
  anywhere. Remove it with `pnpm exec lefthook uninstall` if you would rather
  run the chain by hand.
- **`minimumReleaseAge: 2880`** in `pnpm-workspace.yaml` quarantines packages
  published in the last two days, which is the cheap defence against a
  compromised release. If it blocks an install, pin the previous version rather
  than disabling it.

`knip.jsonc` is worth reading: its `ignore` list is a to-do list, one line per
module that is scaffolded but not wired up yet. Delete each line as you
implement it. When the file has no ignores left, the project is done.

## End-to-end tests

Scenarios 1 to 5 of the brief are already written as Playwright specs in
`packages/e2e/tests/`, marked `test.fixme` so they do not run yet. Each names
the step that unblocks it.

```bash
pnpm exec playwright install chromium   # once
pnpm test:e2e
```

`shell.spec.ts` and `a11y.spec.ts` pass on a fresh clone — they cover the shell
the scaffold ships and run axe against both screens. The other specs are
contracts for the UI you are about to build; adjust the selectors, keep them
role-based.

Scenarios 6 and 7 (restart mid-wait, duplicated approval, concurrency) are not
browser journeys. Drive them from `docs/04-demo-scenarios.md`.

## Notes on the scaffold

- **Node 24, pnpm 10, TypeScript 5.9.** TypeScript 7 is out; 5.9 is pinned
  because the Drizzle and Vite toolchains are still tested against it. Bump it
  once you are past step 1 if you want to.
- **react-router 7.** v8 is current; v7 is pinned only because the routing is
  incidental to what this project is teaching. Swap it if you prefer.
- **Unit tests:** vitest is wired through `pnpm test` but only
  `linter-plugins/` has any. Add yours when you reach step 7 — citation
  verification and pricing are pure functions and the most worthwhile things
  here to test. Colocate them (`decision.test.ts` next to `decision.ts`); the
  `test-file-location` rule enforces it.
- **Nothing deploys.** No CI, no Dockerfile, no remote. `docker-compose.yml`
  runs one thing: PostgreSQL. `INNGEST_DEV=1` keeps the SDK on the local dev
  server, so your functions never register with Inngest Cloud.
- **No auth, no S3, no multitenancy, no vector store.** All explicitly out of
  scope; the SOPs are small enough to pass whole to the model.
