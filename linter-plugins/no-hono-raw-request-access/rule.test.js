import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const rule = plugin.rules["no-hono-raw-request-access"];

describe("no-hono-raw-request-access", () => {
  test("accepts zValidator-sanctioned and non-input reads", () => {
    expect(() =>
      ruleTester.run("no-hono-raw-request-access", rule, {
        valid: [
          // The allowed way to read validated input
          { code: "app.get('/', (c) => c.req.valid('query'));", filename: "src/routes/x.ts" },
          { code: "app.get('/', (c) => c.req.valid('json'));", filename: "src/routes/x.ts" },
          // Metadata-style reads are allowed (not input)
          { code: "app.get('/', (c) => c.req.url);", filename: "src/routes/x.ts" },
          { code: "app.get('/', (c) => c.req.method);", filename: "src/routes/x.ts" },
          { code: "app.get('/', (c) => c.req.path);", filename: "src/routes/x.ts" },
          { code: "app.get('/', (c) => c.req.raw);", filename: "src/routes/x.ts" },
          // Body reads that zValidator does not cover remain allowed
          { code: "app.get('/', async (c) => c.req.text());", filename: "src/routes/x.ts" },
          { code: "app.get('/', async (c) => c.req.arrayBuffer());", filename: "src/routes/x.ts" },
          { code: "app.get('/', async (c) => c.req.blob());", filename: "src/routes/x.ts" },
          // Calls on unrelated objects that happen to share a method name
          { code: "const q = someObj.other.query('foo');", filename: "src/lib/x.ts" },
          { code: "const j = JSON.parse('{}');", filename: "src/lib/x.ts" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("rejects direct reads of query, queries, param", () => {
    expect(() =>
      ruleTester.run("no-hono-raw-request-access", rule, {
        valid: [],
        invalid: [
          {
            code: "app.get('/', (c) => c.req.query('is_daily'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.get('/', (c) => c.req.queries('tags'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.get('/:id', (c) => c.req.param('id'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
        ],
      }),
    ).not.toThrow();
  });

  test("rejects direct reads of json, form, header", () => {
    expect(() =>
      ruleTester.run("no-hono-raw-request-access", rule, {
        valid: [],
        invalid: [
          {
            code: "app.post('/', async (c) => await c.req.json());",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.post('/', async (c) => await c.req.parseBody());",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.post('/', async (c) => await c.req.formData());",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.get('/', (c) => c.req.header('authorization'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
        ],
      }),
    ).not.toThrow();
  });

  test("matches regardless of the context identifier name", () => {
    expect(() =>
      ruleTester.run("no-hono-raw-request-access", rule, {
        valid: [],
        invalid: [
          {
            code: "app.get('/', (ctx) => ctx.req.query('x'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
          {
            code: "app.get('/', (context) => context.req.param('id'));",
            filename: "src/routes/notes.ts",
            errors: [{ messageId: "rawRequestAccess" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});
