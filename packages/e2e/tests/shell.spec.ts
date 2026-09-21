import { expect, test } from "@playwright/test";

/**
 * The only specs in this package that pass on a fresh clone. They cover the
 * shell the scaffold already ships, so a red run here means something in the
 * app's frame broke — not that a feature is still unimplemented.
 */
test.describe("app shell", () => {
  test("opens on the Knowledge Base section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/knowledge-base$/);
    await expect(page.getByRole("heading", { level: 1, name: "Knowledge Base" })).toBeVisible();
  });

  test("navigates between the two sections", async ({ page }) => {
    await page.goto("/knowledge-base");
    await page.getByRole("link", { name: "Requests" }).click();
    await expect(page).toHaveURL(/\/requests$/);
    await expect(page.getByRole("heading", { level: 1, name: "Requests" })).toBeVisible();
  });
});
