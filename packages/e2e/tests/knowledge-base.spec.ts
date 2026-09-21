import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

/**
 * Demo scenario 1 of the brief, as an executable contract.
 *
 * Every test here is `test.fixme` until the step that implements it is done —
 * flip it to `test` as you go. The selectors describe the UI these screens are
 * supposed to expose; adjust them to whatever you actually build, but keep them
 * role-based so the a11y spec and these stay honest about the same markup.
 *
 * Needs `fixtures/sop/purchasing-sop.pdf` and `fixtures/sop/illegible.pdf` to
 * exist — see `fixtures/README.md` for how to produce them.
 */
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const VALID_SOP = `${repoRoot}fixtures/sop/purchasing-sop.pdf`;
const ILLEGIBLE_SOP = `${repoRoot}fixtures/sop/illegible.pdf`;

test.describe("knowledge base", () => {
  // Unblocks at step 4 (upload form + list). Journey 1 of the brief.
  test.fixme("a valid SOP becomes available and its text can be reviewed", async ({ page }) => {
    await page.goto("/knowledge-base");

    await page.getByLabel("SOP document").setInputFiles(VALID_SOP);
    await page.getByRole("button", { name: "Upload" }).click();

    const row = page.getByRole("listitem").filter({ hasText: "purchasing-sop.pdf" });
    await expect(row.getByText("processing")).toBeVisible();
    await expect(row.getByText("available")).toBeVisible({ timeout: 60_000 });

    await row.getByRole("button", { name: "Review extracted text" }).click();
    await expect(page.getByText("Standard Operating Procedure")).toBeVisible();
  });

  // Unblocks at step 3 (permanent extraction failures) + step 4 (the error state).
  test.fixme("an illegible PDF fails with a readable reason", async ({ page }) => {
    await page.goto("/knowledge-base");

    await page.getByLabel("SOP document").setInputFiles(ILLEGIBLE_SOP);
    await page.getByRole("button", { name: "Upload" }).click();

    const row = page.getByRole("listitem").filter({ hasText: "illegible.pdf" });
    await expect(row.getByText("failed")).toBeVisible({ timeout: 60_000 });
    await expect(row).toContainText(/no extractable text/i);
  });

  // Unblocks at step 2 (upload validation).
  test.fixme("a non-PDF upload is rejected before anything is stored", async ({ page }) => {
    await page.goto("/knowledge-base");

    await page.getByLabel("SOP document").setInputFiles({
      name: "not-a-pdf.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("this is plain text pretending to be a PDF"),
    });
    await page.getByRole("button", { name: "Upload" }).click();

    await expect(page.getByRole("alert")).toContainText(/pdf/i);
    await expect(page.getByRole("listitem").filter({ hasText: "not-a-pdf.pdf" })).toHaveCount(0);
  });
});
