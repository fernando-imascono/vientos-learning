import { expect, test } from "@playwright/test";

/**
 * Demo scenarios 2 to 5 of the brief, as executable contracts.
 *
 * Same convention as `knowledge-base.spec.ts`: every test is `test.fixme` until
 * you implement the step it covers. Each one assumes the valid SOP from
 * `fixtures/sop/purchasing-sop.md` is already available in the Knowledge Base;
 * the amounts come from `fixtures/catalog.json` and the 500 EUR threshold in
 * SOP section 4.
 *
 * Two of the brief's scenarios are deliberately NOT here:
 *
 *   6 · restart the backend mid-wait, and
 *   7 · duplicated approval, transient failure, two requests at once
 *
 * Neither is a browser journey — they are about what survives a process dying
 * and what a retry does. Drive them from `docs/04-demo-scenarios.md` with curl
 * and the Inngest dev UI, and write down what you saw.
 */

async function submitRequest(page: import("@playwright/test").Page, text: string) {
  await page.goto("/requests");
  await page.getByLabel("What do you need?").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page).toHaveURL(/\/requests\/[0-9a-f-]+$/);
}

test.describe("purchase requests", () => {
  // Unblocks at step 9. The core of the exercise: a decision you can audit.
  test.fixme("a permitted purchase continues and cites the SOP", async ({ page }) => {
    await submitRequest(page, "Necesito comprar dos monitores 4K de 27 pulgadas para diseño");

    await expect(page.getByTestId("route")).toHaveText("continue", { timeout: 120_000 });
    await expect(page.getByTestId("total")).toHaveText("458,00 €");
    // The justification has to quote the document, not paraphrase it.
    await expect(page.getByTestId("citations")).toContainText("500 EUR or less");
    await expect(page.getByTestId("sop-used")).toContainText("purchasing-sop.pdf");
  });

  // Unblocks at step 8. Rejecting must leave no order behind.
  test.fixme("a purchase over the threshold waits, and rejecting stops it", async ({ page }) => {
    await submitRequest(page, "Necesito tres monitores 4K de 27 pulgadas para los nuevos");

    await expect(page.getByTestId("route")).toHaveText("require_approval", { timeout: 120_000 });
    await expect(page.getByTestId("status")).toHaveText("awaiting_approval");

    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByTestId("status")).toHaveText("rejected");
    await expect(page.getByTestId("order-reference")).toHaveCount(0);
  });

  // Unblocks at step 8. The happy path through a human.
  test.fixme("approving an over-threshold purchase creates the order", async ({ page }) => {
    await submitRequest(page, "Quiero una mesa elevable para mi puesto");

    await expect(page.getByTestId("status")).toHaveText("awaiting_approval", { timeout: 120_000 });
    await page.getByRole("button", { name: "Approve" }).click();

    await expect(page.getByTestId("status")).toHaveText("ordered");
    await expect(page.getByTestId("order-reference")).toBeVisible();
  });

  // Unblocks at step 7. A prohibited category is blocked whatever the amount.
  test.fixme("a prohibited category is blocked regardless of amount", async ({ page }) => {
    await submitRequest(page, "Compra dos tarjetas regalo de 50 euros para el sorteo");

    await expect(page.getByTestId("route")).toHaveText("block", { timeout: 120_000 });
    await expect(page.getByTestId("citations")).toContainText(/gift cards/i);
    await expect(page.getByTestId("order-reference")).toHaveCount(0);
  });

  // Unblocks at step 7. No invented data, no assumed authorisation.
  test.fixme("an unidentifiable request is blocked with an explanation", async ({ page }) => {
    await submitRequest(page, "Necesito material para la oficina");

    await expect(page.getByTestId("route")).toHaveText("block", { timeout: 120_000 });
    await expect(page.getByTestId("explanation")).not.toBeEmpty();
    await expect(page.getByTestId("order-reference")).toHaveCount(0);
  });
});
