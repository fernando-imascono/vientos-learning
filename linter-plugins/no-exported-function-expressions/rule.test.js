import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const rule = plugin.rules["no-exported-function-expressions"];

describe("no-exported-function-expressions", () => {
  test("accepts function declarations and non-function exports", () => {
    expect(() =>
      ruleTester.run("no-exported-function-expressions", rule, {
        valid: [
          { code: "export function foo() { return 1; }" },
          { code: "export default function foo() { return 1; }" },
          { code: "export async function foo() { return 1; }" },
          { code: "export const CONFIG = { retries: 3 };" },
          { code: "export const api = createClient();" },
          { code: "export class Thing {}" },
          // Non-exported arrow functions are allowed
          { code: "const foo = () => 1;" },
          { code: "function bar() { const baz = () => 1; return baz; }" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("rejects exported arrow functions and function expressions", () => {
    expect(() =>
      ruleTester.run("no-exported-function-expressions", rule, {
        valid: [],
        invalid: [
          {
            code: "export const foo = () => 1;",
            errors: [{ messageId: "useFunctionDeclaration" }],
          },
          {
            code: "export const foo = async () => 1;",
            errors: [{ messageId: "useFunctionDeclaration" }],
          },
          {
            code: "export const foo = function () { return 1; };",
            errors: [{ messageId: "useFunctionDeclaration" }],
          },
          {
            code: "export default () => 1;",
            errors: [{ messageId: "useFunctionDeclaration" }],
          },
        ],
      }),
    ).not.toThrow();
  });

  test("reports every offending declarator in a multi-declaration export", () => {
    expect(() =>
      ruleTester.run("no-exported-function-expressions", rule, {
        valid: [],
        invalid: [
          {
            code: "export const foo = () => 1, bar = () => 2;",
            errors: [
              { messageId: "useFunctionDeclaration" },
              { messageId: "useFunctionDeclaration" },
            ],
          },
        ],
      }),
    ).not.toThrow();
  });
});
