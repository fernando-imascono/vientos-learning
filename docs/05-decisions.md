# Decisions and limits

The brief asks for a short record of what you decided and what you left out,
and — because AI is allowed — **who decided each thing**. Fill this in as you
go; reconstructing it at the end is how it turns into fiction.

Suggested entry:

```
## D-001 · <the decision>
Date:      2026-__-__
Decided by: me / me after an AI suggestion / AI, reviewed by me
Options:   <what else you considered>
Chose:     <what you did>
Because:   <the reason, in one or two sentences>
Revisit if: <what would change your mind>
```

---

## D-000 · Scaffold generated with Claude Code

Date: 2026-09-21
Decided by: AI, reviewed by me
Options: start from an empty folder; start from an Imascono template; generate a scaffold from the brief.
Chose: a generated monorepo scaffold with the plumbing complete and every learning-relevant module left as a `TODO(n.m)`.
Because: the point of the project is to write the agent, the durable workflow and the data model — not the tsconfigs.
Revisit if: a scaffolded choice (the folder layout, the router, the query-key helper) starts fighting what I am trying to learn.

---

## Decisions the brief explicitly leaves to you

Write an entry for each of these before the review — they are what you will be
asked about.

- [ ] The data schema
- [ ] The endpoints
- [ ] The agent's tools, and how much you give it per call
- [ ] The recovery strategy: retries, concurrency, idempotency
- [ ] How "the active SOP" is represented, and how a request pins it
- [ ] The approval timeout, and what expiry means
- [ ] What the agent is allowed to return, and what the code recomputes

## Limits I accepted

- [ ] ...

## Things I would do differently with more time

- [ ] ...
