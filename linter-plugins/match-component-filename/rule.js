/**
 * Enforce that files exporting a React component have a filename that matches
 * the component name, so agents and humans can locate components by filename
 * alone. Non-component exports (hooks, utilities, factories, library
 * extensions) are intentionally out of scope — they already grep well by
 * identifier and often follow package- or project-level filename conventions
 * (kebab-case, shadcn `utils.ts`, etc.).
 *
 * Logic: if the file declares any React components (upper-cased function /
 * arrow exports), at least one must match the filename stem. Files with no
 * React components are skipped entirely.
 *
 * Ignored files: `index.*`, test files (`.test.` / `.spec.`) and story files
 * (`.stories.`).
 */

import path from "node:path";

import { defineRule } from "@oxlint/plugins";

const IGNORED_BASENAMES = new Set(["index.ts", "index.tsx", "index.js", "index.jsx"]);
const FUNCTION_EXPRESSION_TYPES = new Set(["ArrowFunctionExpression", "FunctionExpression"]);

function isIgnoredFile(basename) {
  if (IGNORED_BASENAMES.has(basename)) return true;
  return (
    basename.includes(".test.") || basename.includes(".spec.") || basename.includes(".stories.")
  );
}

function startsWithUppercase(name) {
  return name.length > 0 && name.charAt(0) === name.charAt(0).toUpperCase();
}

function isComponentVariableDeclarator(declarator) {
  if (!declarator.id || declarator.id.type !== "Identifier") return false;
  if (!startsWithUppercase(declarator.id.name)) return false;
  return declarator.init && FUNCTION_EXPRESSION_TYPES.has(declarator.init.type);
}

function getComponentNameFromDeclaration(declaration) {
  if (!declaration) return null;
  if (declaration.type === "FunctionDeclaration" && declaration.id) {
    return startsWithUppercase(declaration.id.name) ? declaration.id.name : null;
  }
  if (declaration.type === "VariableDeclaration") {
    const match = declaration.declarations.find(isComponentVariableDeclarator);
    return match ? match.id.name : null;
  }
  return null;
}

function getComponentNameFromExport(node) {
  if (node.type === "ExportNamedDeclaration") {
    return getComponentNameFromDeclaration(node.declaration);
  }
  if (node.type === "ExportDefaultDeclaration") {
    const decl = node.declaration;
    if (decl.type === "FunctionDeclaration" && decl.id && startsWithUppercase(decl.id.name)) {
      return decl.id.name;
    }
    if (decl.type === "Identifier" && startsWithUppercase(decl.name)) return decl.name;
  }
  return null;
}

function collectReactComponents(programBody) {
  const reactComponents = [];
  for (const stmt of programBody) {
    const name = getComponentNameFromExport(stmt);
    if (name) reactComponents.push({ name, node: stmt });
  }
  return reactComponents;
}

export const matchComponentFilename = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce that files exporting a React component have a filename matching the component name.",
    },
    messages: {
      filenameMismatch:
        'Filename "{{filename}}" should match the exported React component "{{exportedName}}". Rename the file to "{{expectedFilename}}" or rename the component to "{{expectedExport}}".',
    },
    schema: [],
  },

  createOnce(context) {
    return {
      Program(node) {
        const basename = path.basename(context.filename);
        if (isIgnoredFile(basename)) return;

        const reactComponents = collectReactComponents(node.body);
        if (reactComponents.length === 0) return;

        const ext = path.extname(context.filename);
        const stem = path.basename(context.filename, ext);
        if (reactComponents.some((c) => c.name === stem)) return;

        const first = reactComponents[0];
        context.report({
          node: first.node,
          messageId: "filenameMismatch",
          data: {
            filename: basename,
            exportedName: first.name,
            expectedFilename: `${first.name}${ext}`,
            expectedExport: stem,
          },
        });
      },
    };
  },
});
