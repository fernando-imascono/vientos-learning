import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020, sourceType: "module" },
});

const rule = plugin.rules["test-file-location"];

describe("test-file-location", () => {
  test("accepts colocated test files", () => {
    expect(() =>
      ruleTester.run("test-file-location", rule, {
        valid: [
          { code: "test('works', () => {});", filename: "src/module/foo.test.ts" },
          { code: "test('works', () => {});", filename: "src/module/foo.test.tsx" },
          { code: "test('works', () => {});", filename: "src/module/foo.test.js" },
          { code: "const x = 1;", filename: "src/module/foo.ts" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("rejects test files in test or __tests__ directories", () => {
    expect(() =>
      ruleTester.run("test-file-location", rule, {
        valid: [],
        invalid: [
          {
            code: "test('x', () => {});",
            filename: "src/test/unit/foo.test.ts",
            errors: [{ messageId: "testFileInWrongLocation" }],
          },
          {
            code: "test('x', () => {});",
            filename: "src/module/__tests__/foo.test.ts",
            errors: [{ messageId: "testFileInWrongLocation" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});
