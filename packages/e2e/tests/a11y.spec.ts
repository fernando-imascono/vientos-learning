import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// EN 301 549 (European Accessibility Act) currently requires WCAG 2.1 AA;
// the upcoming revision adopts WCAG 2.2 AA, so we scan against 2.2 already.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

const SCREENS = ["/knowledge-base", "/requests"];

/**
 * Accessibility is cheaper to keep than to retrofit, so this runs from day one
 * against whatever the screens currently are. Add a route here as you build it.
 */
test.describe("accessibility", () => {
  for (const screen of SCREENS) {
    test(`${screen} has no detectable WCAG A/AA violations`, async ({ page }) => {
      await page.goto(screen);
      // An empty or wrong page also reports zero violations, so confirm this
      // is our screen before believing the scan.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
