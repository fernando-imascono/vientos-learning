# Fixtures

Synthetic data for local development and for the demo. Nothing here is real.

| File                            | What it is                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `catalog.json`                  | The product catalog. Seeded into PostgreSQL by `pnpm db:seed`.                                   |
| `sop/purchasing-sop.md`         | The source text of the SOP. **Export it to PDF and upload that PDF through the Knowledge Base.** |
| `sop/illegible-sop.md`          | Instructions for producing the deliberately unreadable PDF the demo needs.                       |
| `requests/sample-requests.json` | The request texts that exercise each route.                                                      |

## Turning the SOP into a PDF

The app ingests a PDF, so the markdown has to be exported. Any of these works:

```bash
# with pandoc + a LaTeX engine
pandoc fixtures/sop/purchasing-sop.md -o fixtures/sop/purchasing-sop.pdf

# or: open it in a browser/editor preview and print to PDF
```

Keep the exported PDF out of git (it is derived), or commit it if that makes the
demo easier to reproduce for a reviewer — your call, but say which in the README.

## Why the rules live here and not in the prompt

The whole exercise turns on this: **change a threshold in `purchasing-sop.md`,
re-export, re-upload, resend the same request text, and the decision must
change** — with no edit to any prompt or any line of code. If that does not
happen, the agent is not really reading the document.
