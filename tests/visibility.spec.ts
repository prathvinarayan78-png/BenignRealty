import { test, expect, type Page } from "@playwright/test";

// Playwright's toBeVisible accepts opacity: 0; explicitly check paint styles
// so an invisible section with a valid layout box cannot pass this regression.
async function expectReadableSections(page: Page) {
  expect(
    await page.locator("[data-reveal]").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.opacity !== "1" ||
            style.visibility !== "visible" ||
            style.display === "none"
          );
        })
        .map((element) => element.className),
    ),
  ).toEqual([]);
}

async function inspectBelowStory(page: Page) {
  for (const selector of [
    "#about",
    "#properties",
    "#journey",
    "#expertise",
    "#delhi",
    "#founders",
    "#contact",
    ".site-footer",
  ]) {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector)!;
      window.scrollTo(
        0,
        element.getBoundingClientRect().top + window.scrollY - 100,
      );
    }, selector);
    await expectReadableSections(page);
    await expect(page.locator(selector)).toBeInViewport();
  }
}

test("sections remain painted from Our Story through the footer with motion enabled", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expectReadableSections(page);
  await inspectBelowStory(page);
  await page.reload();
  await expectReadableSections(page);
});

for (const mode of ["silent", "unavailable"] as const) {
  test(`content stays visible when the reveal observer is ${mode}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript((mode) => {
      Object.defineProperty(window, "IntersectionObserver", {
        configurable: true,
        value:
          mode === "unavailable"
            ? undefined
            : class {
                observe() {}
                unobserve() {}
                disconnect() {}
                takeRecords() {
                  return [];
                }
              },
      });
    }, mode);
    await page.goto("/");
    await expect(page.locator("[data-reveal].is-visible")).toHaveCount(0);
    await expectReadableSections(page);
    await inspectBelowStory(page);
    await expect(page.locator("#founders")).toContainText("Talib Khan");
    await expect(page.locator("#founders")).toContainText("Prathvi Narayan");
    await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
