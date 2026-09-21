# Extra B — React Flow

Visualise the workflow, the route that was chosen, and the state of each step.
Read-only; no editor required. The brief puts the extras after the required
journey, so do not start here.

```bash
pnpm --filter @vientos/web add @xyflow/react
```

Docs: https://reactflow.dev

**TODO(Extra B.1)** — derive the nodes from the request's real state, not from a
hardcoded diagram. Nodes: `received → analyzing → decision → (approval) →
ordered / blocked / rejected / expired`. Colour the path that was taken and grey
out the branches that were not.

The component goes in `WorkflowGraph.tsx` next to this file — the
`local/match-component-filename` rule expects the filename and the exported
component to agree.
