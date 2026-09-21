# Linter Plugins

Custom lint rules shared across the monorepo. Rules use oxlint's `createOnce` API — the pattern oxlint recommends because it enables future optimizations (static analysis of which AST nodes rules care about, skipping traversal for files without relevant nodes).

## How it works

`index.js` exports a plain plugin object (`{ meta: { name: "local" }, rules }`). The root `.oxlintrc.json` loads it via `jsPlugins: ["./linter-plugins/index.js"]`, and child configs inherit this through `extends` — they only need to list `local/<rule-name>` under `rules` to enable a rule.

## Rules

- **`no-lint-disable`** — Forbids `eslint-disable` and `oxlint-disable` inline comments. The codebase should fix lint issues, not suppress them.
- **`test-file-location`** — Enforces test file colocation: test files must live next to the code they test, not in `test/` or `__tests__/` directories.
- **`no-hono-raw-request-access`** — Forbids reading Hono request inputs directly (`c.req.query/queries/param/json/header/parseBody/formData(...)`). Inputs must go through `zValidator` and `c.req.valid(target)` so the RPC client stays typed. Enabled in the backend package only.
- **`no-exported-function-expressions`** — Forbids exporting arrow functions or function expressions. Exported functions must use `export function foo()` so they are hoisted, produce named stack traces, and are greppable as `function foo`.
- **`no-raw-html-elements`** — Forbids raw HTML elements that have shadcn/ui component replacements (e.g. `<button>` → `<Button>`, `<input>` → `<Input>`, `<table>` → `<Table>`, etc.). Ensures all interactive and form elements go through the design system. Enabled in the frontend package only.
- **`match-component-filename`** — Enforces that files exporting a React component have a filename matching the component name, so components can be located by filename alone. Only applies to upper-cased function/arrow exports; hooks, utilities, factories, and library extensions are out of scope. Ignores `index.*`, `.test.*`, `.spec.*`, and `.stories.*` files. Enabled in the frontend package only.

## Adding a new rule

1. Create a directory: `<rule-name>/rule.js` and `<rule-name>/rule.test.js`.
2. Export the rule from `rule.js` using the `createOnce` pattern (see existing rules for the shape).
3. Register it in `index.js` under `rules`.
4. Write tests with `RuleTester` from `oxlint/plugins-dev` driven by vitest.
5. Enable it under `rules`: if the rule applies to the whole monorepo, add `"local/<rule-name>": "error"` in the root `.oxlintrc.json`; if it's package-specific, add it in the relevant `packages/<pkg>/.oxlintrc.json` instead.

## Testing

Tests use oxlint's native `RuleTester` from `oxlint/plugins-dev`. It accepts `createOnce` rules directly (no compat wrapper needed) and mirrors ESLint's `RuleTester` API, so test authoring is familiar. Run with `npm test` from this directory or `npm test -- --filter=linter-plugins` from the monorepo root.
