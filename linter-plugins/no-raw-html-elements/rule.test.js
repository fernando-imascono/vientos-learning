import { RuleTester } from "oxlint/plugins-dev";
import { describe, expect, test } from "vitest";

import plugin from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rule = plugin.rules["no-raw-html-elements"];

describe("no-raw-html-elements: allowed elements", () => {
  test("allows unrestricted HTML elements", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [
          { code: "const x = <div>content</div>;", filename: "App.tsx" },
          { code: "const x = <span>text</span>;", filename: "App.tsx" },
          { code: "const x = <p>paragraph</p>;", filename: "App.tsx" },
          { code: "const x = <img src='a.png' />;", filename: "App.tsx" },
          { code: "const x = <a href='/'>link</a>;", filename: "App.tsx" },
          { code: "const x = <h1>heading</h1>;", filename: "App.tsx" },
          { code: "const x = <ul><li>item</li></ul>;", filename: "App.tsx" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("allows React components with the same name uppercased", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [
          { code: "const x = <Button>click</Button>;", filename: "App.tsx" },
          { code: "const x = <Input value='x' />;", filename: "App.tsx" },
          { code: "const x = <Table><TableRow /></Table>;", filename: "App.tsx" },
          { code: "const x = <Dialog open />;", filename: "App.tsx" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });

  test("allows namespaced JSX elements", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [
          { code: "const x = <Form.input />;", filename: "App.tsx" },
          { code: "const x = <UI.button>go</UI.button>;", filename: "App.tsx" },
        ],
        invalid: [],
      }),
    ).not.toThrow();
  });
});

describe("no-raw-html-elements: form controls", () => {
  test("rejects raw form elements", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [],
        invalid: [
          {
            code: "const x = <button>click</button>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <input type='text' />;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <textarea rows={3} />;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <label htmlFor='x'>Name</label>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <select><option>a</option></select>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }, { messageId: "useShadcn" }],
          },
          {
            code: "const x = <fieldset><legend>Group</legend></fieldset>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }, { messageId: "useShadcn" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});

describe("no-raw-html-elements: table and misc", () => {
  test("rejects raw table elements", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [],
        invalid: [
          {
            code: "const x = <table><tr><td>cell</td></tr></table>;",
            filename: "App.tsx",
            errors: [
              { messageId: "useShadcn" },
              { messageId: "useShadcn" },
              { messageId: "useShadcn" },
            ],
          },
          {
            code: "const x = <thead><tr><th>h</th></tr></thead>;",
            filename: "App.tsx",
            errors: [
              { messageId: "useShadcn" },
              { messageId: "useShadcn" },
              { messageId: "useShadcn" },
            ],
          },
        ],
      }),
    ).not.toThrow();
  });

  test("rejects other restricted elements", () => {
    expect(() =>
      ruleTester.run("no-raw-html-elements", rule, {
        valid: [],
        invalid: [
          {
            code: "const x = <kbd>Ctrl</kbd>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          { code: "const x = <hr />;", filename: "App.tsx", errors: [{ messageId: "useShadcn" }] },
          {
            code: "const x = <progress value={50} />;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <dialog open>hi</dialog>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }],
          },
          {
            code: "const x = <details><summary>more</summary>body</details>;",
            filename: "App.tsx",
            errors: [{ messageId: "useShadcn" }, { messageId: "useShadcn" }],
          },
        ],
      }),
    ).not.toThrow();
  });
});
