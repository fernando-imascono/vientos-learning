import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

const rule = plugin.rules["match-component-filename"];
const ruleName = "match-component-filename";

describe("match-component-filename: valid", () => {
  test("accepts matching React components", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "export function Button() { return null; }",
            filename: "src/components/Button.tsx",
          },
          {
            code: "export const Button = () => null;",
            filename: "src/components/Button.tsx",
          },
          {
            code: "function Button() { return null; } export default Button;",
            filename: "src/components/Button.tsx",
          },
          {
            code: "export default function Button() { return null; }",
            filename: "src/components/Button.tsx",
          },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("accepts multi-component files where one matches the filename", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "export function Button() { return null; } export function ButtonGroup() { return null; }",
            filename: "src/components/Button.tsx",
          },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });
});

describe("match-component-filename: skipped files and non-components", () => {
  test("skips index, test, and stories files", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "export function NotMatching() { return null; }",
            filename: "src/components/index.ts",
          },
          {
            code: "export function NotMatching() { return null; }",
            filename: "src/components/Button.test.tsx",
          },
          {
            code: "export function NotMatching() { return null; }",
            filename: "src/components/Button.stories.tsx",
          },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("ignores non-component exports (hooks, utilities, factories)", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "export function useDebouncedSearch() { return null; }",
            filename: "src/hooks/use-debounced-search.ts",
          },
          {
            code: "export const useTabStore = create(() => ({}));",
            filename: "src/stores/tab-store.ts",
          },
          {
            code: "export function cn(...classes) { return classes.join(' '); }",
            filename: "src/lib/utils.ts",
          },
          {
            code: "export const api = createClient();",
            filename: "src/api.ts",
          },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("ignores upper-cased non-function exports", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [
          {
            code: "export const Callout = createExtension();",
            filename: "src/extensions/callout.ts",
          },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });
});

describe("match-component-filename: invalid", () => {
  test("rejects filename/component mismatch", () => {
    expect(() =>
      ruleTester.run(ruleName, rule, {
        valid: [],
        invalid: [
          {
            code: "export function PrimaryButton() { return null; }",
            filename: "src/components/Button.tsx",
            errors: [{ messageId: "filenameMismatch" }],
          },
          {
            code: "export const Sidebar = () => null;",
            filename: "src/components/LeftSidebar.tsx",
            errors: [{ messageId: "filenameMismatch" }],
          },
          {
            code: "function Home() { return null; } export default Home;",
            filename: "src/pages/Landing.tsx",
            errors: [{ messageId: "filenameMismatch" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});
