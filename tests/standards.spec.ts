import { test, expect, type Page } from "@playwright/test";

/** Park an element so its top sits `fraction` of a viewport below the fold. */
async function scrollAt(page: Page, selector: string, fraction: number) {
  await page.evaluate(
    ({ selector, fraction }) => {
      const el = document.querySelector(selector)!;
      window.scrollTo(
        0,
        el.getBoundingClientRect().top +
          window.scrollY -
          window.innerHeight * fraction,
      );
    },
    { selector, fraction },
  );
}

/** Scroll until the element has travelled fully past the top of the viewport. */
async function scrollPast(page: Page, selector: string) {
  await page.evaluate((selector) => {
    const el = document.querySelector(selector)!;
    window.scrollTo(0, el.offsetTop + el.offsetHeight);
  }, selector);
}

const railFill = (page: Page) =>
  page
    .locator(".standards-rail > span")
    .evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);

test("the founders section is gone and the standard section stands in its place", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#founders")).toHaveCount(0);
  await expect(page.getByText("Talib Khan")).toHaveCount(0);
  await expect(page.getByText("Prathvi Narayan")).toHaveCount(0);
  await expect(
    page.locator("#standards").getByRole("heading", {
      name: "The Benign standard. Three promises we keep.",
    }),
  ).toBeAttached();
  await expect(page.locator(".standard-item")).toHaveCount(3);
});

test("each promise is a real option that starts an enquiry on that topic", async ({
  page,
}) => {
  await page.goto("/");
  const second = page.locator(".standard-option").nth(1);
  await second.scrollIntoViewIfNeeded();
  await second.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", { name: "Let’s find your kind of space." }),
  ).toBeVisible();
  await expect(dialog.getByLabel(/interested in/)).toHaveValue(
    "Illustrative, and honest about it.",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("the promise lines scrub with the page on desktop and hold still without motion", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop pinning only");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  await scrollAt(page, ".standards-section", 1.5);
  await expect.poll(() => railFill(page)).toBeLessThan(0.2);

  await scrollPast(page, ".standards-section");
  await expect.poll(() => railFill(page)).toBeGreaterThan(0.9);

  // The promise text itself never depends on scroll to be readable.
  for (const item of await page.locator(".standard-item").all()) {
    await expect(item).toHaveCSS("opacity", "1");
  }
  await expect(page.locator(".standard-copy").first()).toBeVisible();

  // The intro holds while the promises travel past it.
  await expect(page.locator(".standards-intro")).toHaveCSS("position", "sticky");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".standards-intro")).toHaveCSS(
    "position",
    "static",
  );
  await expect(page.locator(".standards-rail > span")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
});

test("option rows answer the pointer with motion, and the press on touch", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  if (testInfo.project.name === "mobile") {
    // Touch devices get the same affordances, carried by the press.
    await page.goto("/");
    await expect(page.locator(".standard-heading > svg").first()).toHaveCSS(
      "opacity",
      "1",
    );
    // No pointer, so nothing is displaced: touch gets press, not hover.
    await expect(page.locator(".service-toggle").first()).toHaveCSS(
      "transform",
      "none",
    );
    const journeySteps = page.locator(".journey-mobile-progress button");
    await expect(journeySteps).toHaveCount(5);
    for (const step of await journeySteps.all()) {
      await expect(step).toBeVisible();
    }
    return;
  }

  await page.goto("/");

  // Standard rows: the arrow arrives and the title steps aside.
  const option = page.locator(".standard-option").first();
  await option.scrollIntoViewIfNeeded();
  await expect(page.locator(".standard-heading > svg").first()).toHaveCSS(
    "opacity",
    "0",
  );
  await option.hover();
  await expect(page.locator(".standard-heading > svg").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect
    .poll(() =>
      page
        .locator(".standard-title")
        .first()
        .evaluate((el) =>
          new DOMMatrixReadOnly(getComputedStyle(el).transform).e,
        ),
    )
    .toBeGreaterThan(4);

  // Expertise rows indent and rotate their toggle.
  const service = page.locator(".service-toggle").first();
  await service.scrollIntoViewIfNeeded();
  const restingPad = await service.evaluate(
    (el) => getComputedStyle(el).paddingLeft,
  );
  await service.hover();
  await expect
    .poll(() => service.evaluate((el) => getComputedStyle(el).paddingLeft))
    .not.toBe(restingPad);
  await expect(service.locator("svg")).toHaveCSS(
    "transform",
    "matrix(0, 1, -1, 0, 0, 0)",
  );

  // Tabs lift, neighbourhoods underline, footer links slide.
  const tab = page.locator(".property-tabs button").first();
  await tab.scrollIntoViewIfNeeded();
  await tab.hover();
  await expect
    .poll(() =>
      tab.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).f),
    )
    .toBeLessThan(-1);

  const hood = page.locator(".neighbourhoods > button").first();
  await hood.scrollIntoViewIfNeeded();
  await hood.hover();
  await expect
    .poll(() =>
      hood
        .evaluate((el) =>
          new DOMMatrixReadOnly(
            getComputedStyle(el, "::after").transform,
          ).a,
        ),
    )
    .toBeGreaterThan(0.9);
});

test("the journey is five chapters long and its guide matches", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".journey-chapter")).toHaveCount(5);
  await expect(page.locator("#journey")).toHaveCSS(
    "--journey-steps",
    "5",
  );
  await expect(page.locator(".journey-image").nth(3)).toBeAttached();
  await expect(page.locator(".journey-chapter-label").nth(4)).toHaveText(
    "05 / The belonging",
  );
});
