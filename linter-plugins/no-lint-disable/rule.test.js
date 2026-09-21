import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: "module" },
});

const rule = plugin.rules["no-lint-disable"];

describe("no-lint-disable", () => {
  test("accepts code without disable comments", () => {
    expect(() =>
      ruleTester.run("no-lint-disable", rule, {
        valid: [
          { code: "const x = 1;", filename: "src/foo.ts" },
          { code: "// this is a normal comment\nconst x = 1;", filename: "src/foo.ts" },
          { code: "/* block comment */\nconst x = 1;", filename: "src/foo.ts" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("rejects eslint-disable comments", () => {
    expect(() =>
      ruleTester.run("no-lint-disable", rule, {
        valid: [],
        invalid: [
          {
            code: "// eslint-disable-next-line no-unused-vars\nconst x = 1;",
            filename: "src/foo.ts",
            errors: [{ messageId: "noDisable" }],
          },
          {
            code: "/* eslint-disable no-console */\nconsole.log('hi');",
            filename: "src/foo.ts",
            errors: [{ messageId: "noDisable" }],
          },
          {
            code: "const x = 1; // eslint-disable-line no-unused-vars",
            filename: "src/foo.ts",
            errors: [{ messageId: "noDisable" }],
          },
        ],
      }),
    ).not.toThrow();
  });

  test("rejects oxlint-disable comments", () => {
    expect(() =>
      ruleTester.run("no-lint-disable", rule, {
        valid: [],
        invalid: [
          {
            code: "// oxlint-disable-next-line no-unused-vars\nconst x = 1;",
            filename: "src/foo.ts",
            errors: [{ messageId: "noDisable" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});
