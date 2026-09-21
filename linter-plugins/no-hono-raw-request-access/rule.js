/**
 * Methods on `c.req` (or any `<ctx>.req`) that read request inputs which
 * must instead be validated through `@hono/zod-validator` and consumed via
 * `c.req.valid(target)`. Each entry maps the raw method name to its
 * corresponding zValidator target, used in the error message.
 */

import { defineRule } from "@oxlint/plugins";

const BLACKLIST = {
  query: "query",
  queries: "query",
  param: "param",
  json: "json",
  header: "header",
  parseBody: "form",
  formData: "form",
};

export const noHonoRawRequestAccess = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow reading Hono request inputs directly; use zValidator + c.req.valid() so the RPC client stays typed.",
    },
    messages: {
      rawRequestAccess:
        'Do not read request inputs via `.req.{{method}}()`. Declare a Zod schema and use `zValidator("{{target}}", schema)` + `c.req.valid("{{target}}")` instead. Direct reads break RPC type inference.',
    },
    schema: [],
  },

  createOnce(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (callee.property.type !== "Identifier") return;

        const methodName = callee.property.name;
        const target = BLACKLIST[methodName];
        if (!target) return;

        // The object must itself be a MemberExpression whose property is `req`,
        // matching `<anything>.req.<blacklistedMethod>(...)`.
        const object = callee.object;
        if (object.type !== "MemberExpression") return;
        if (object.property.type !== "Identifier") return;
        if (object.property.name !== "req") return;

        context.report({
          node,
          messageId: "rawRequestAccess",
          data: { method: methodName, target },
        });
      },
    };
  },
});
