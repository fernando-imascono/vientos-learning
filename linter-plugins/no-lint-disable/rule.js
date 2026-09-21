/**
 * Disallow `eslint-disable` and `oxlint-disable` inline comments. Lint issues
 * should be fixed at the source, not suppressed.
 *
 * We forbid both prefixes even though the project no longer uses ESLint:
 * oxlint honors `eslint-disable` directives for ESLint-compatibility and
 * offers no way to opt out. Without this check an agent could silently
 * suppress any oxlint finding with `// eslint-disable-next-line`.
 */

import { defineRule } from "@oxlint/plugins";

const pattern = /\b(eslint-disable|oxlint-disable)\b/;

export const noLintDisable = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow eslint-disable and oxlint-disable comments",
    },
    messages: {
      noDisable: "Lint disable comments are not allowed. Fix the underlying issue instead.",
    },
    schema: [],
  },

  createOnce(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (pattern.test(comment.value)) {
            context.report({ node: comment, messageId: "noDisable" });
          }
        }
      },
    };
  },
});
