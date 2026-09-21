import { definePlugin } from "@oxlint/plugins";

import { matchComponentFilename } from "./match-component-filename/rule.js";
import { noExportedFunctionExpressions } from "./no-exported-function-expressions/rule.js";
import { noHonoRawRequestAccess } from "./no-hono-raw-request-access/rule.js";
import { noLintDisable } from "./no-lint-disable/rule.js";
import { noRawHtmlElements } from "./no-raw-html-elements/rule.js";
import { testFileLocation } from "./test-file-location/rule.js";

export default definePlugin({
  meta: { name: "local" },
  rules: {
    "match-component-filename": matchComponentFilename,
    "no-exported-function-expressions": noExportedFunctionExpressions,
    "no-hono-raw-request-access": noHonoRawRequestAccess,
    "no-lint-disable": noLintDisable,
    "no-raw-html-elements": noRawHtmlElements,
    "test-file-location": testFileLocation,
  },
});
