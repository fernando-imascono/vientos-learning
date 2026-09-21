/**
 * Disallow exporting arrow functions or function expressions. Exported
 * functions must use the `function` keyword so they have named stack traces,
 * are hoisted, and can be located by grep as `function <name>`.
 */

import { defineRule } from "@oxlint/plugins";

function isFunctionExpressionNode(node) {
  return node && (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression");
}

function getDeclaratorName(declarator) {
  return declarator.id && declarator.id.type === "Identifier" ? declarator.id.name : "<anon>";
}

function reportDeclaratorIfFunctionExpression(context, declarator) {
  if (!isFunctionExpressionNode(declarator.init)) return;
  context.report({
    node: declarator.id,
    messageId: "useFunctionDeclaration",
    data: { name: getDeclaratorName(declarator) },
  });
}

export const noExportedFunctionExpressions = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require exported functions to be function declarations (not arrow functions or function expressions).",
    },
    messages: {
      useFunctionDeclaration:
        "Exported function expressions are not allowed. Use `export function {{name}}(...)` instead of `export const {{name}} = (...) => ...`.",
    },
    schema: [],
  },

  createOnce(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== "VariableDeclaration") return;
        for (const declarator of node.declaration.declarations) {
          reportDeclaratorIfFunctionExpression(context, declarator);
        }
      },

      ExportDefaultDeclaration(node) {
        if (!isFunctionExpressionNode(node.declaration)) return;
        context.report({
          node: node.declaration,
          messageId: "useFunctionDeclaration",
          data: { name: "default" },
        });
      },
    };
  },
});
