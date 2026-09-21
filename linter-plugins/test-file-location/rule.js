import path from "node:path";

import { defineRule } from "@oxlint/plugins";

export const testFileLocation = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce test file colocation",
    },
    messages: {
      testFileInWrongLocation:
        "Test files should be in the same directory as the file they test, not in a 'test' or '__tests__' directory.",
    },
    schema: [],
  },

  createOnce(context) {
    return {
      Program(node) {
        const filename = context.filename;
        if (!filename.includes(".test.")) return;

        const dirSegments = path.normalize(path.dirname(filename)).split(path.sep);
        if (dirSegments.some((s) => s === "test" || s === "__tests__")) {
          context.report({ node, messageId: "testFileInWrongLocation" });
        }
      },
    };
  },
});
