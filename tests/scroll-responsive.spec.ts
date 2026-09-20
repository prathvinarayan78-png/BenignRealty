import { test, expect, type Page } from "@playwright/test";

async function scrollScene(page: Page, selector: string, progress: number) {
  await page.evaluate(
    ({ selector, progress }) => {
      const element = document.querySelector(selector)!;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const travel = element.clientHeight - window.innerHeight + 86;
      window.scrollTo(0, top - 86 + progress * travel);
    },
    { selector, progress },
  );
}

async function scrollAt(page: Page, selector: string, screenFraction: number) {
  await page.evaluate(
    ({ selector, screenFraction }) => {
      const top =
        document.querySelector(selector)!.getBoundingClientRect().top +
        window.scrollY;
      window.scrollTo(0, top - window.innerHeight * screenFraction);
    },
    { selector, screenFraction },
  );
}

const propertyValue = (page: Page, selector: string, property: string) =>
  page
    .locator(selector)
    .evaluate(
      (element, name) =>
        Number.parseFloat(getComputedStyle(element).getPropertyValue(name)),
      property,
    );

test("statement and Delhi depth track scrolling in both directions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await scrollAt(page, "#about", 0.8);
  await expect
    .poll(() => propertyValue(page, "#about", "--reveal-progress"))
    .toBeLessThan(0.3);
  await scrollAt(page, "#about", 0.12);
  await expect
    .poll(() => propertyValue(page, "#about", "--reveal-progress"))
    .toBeGreaterThan(0.9);
  await scrollAt(page, "#about", 0.8);
  await expect
    .poll(() => propertyValue(page, "#about", "--reveal-progress"))
    .toBeLessThan(0.3);
  await scrollAt(page, "#delhi", 0.6);
  await expect
    .poll(() => propertyValue(page, "#delhi", "--scene-progress"))
    .toBeGreaterThan(0.05);
  const before = await propertyValue(page, "#delhi", "--scene-progress");
  await scrollAt(page, "#delhi", -0.2);
  await expect
    .poll(() => propertyValue(page, "#delhi", "--scene-progress"))
    .toBeGreaterThan(before + 0.2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => propertyValue(page, "#about", "--reveal-progress"))
    .toBe(1);
  await expect(page.locator(".delhi-image > img")).toHaveCSS(
    "transform",
    "none",
  );
});

test("journey follows scroll, reverses, and supports chapter navigation", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const journey = page.locator("#journey");
  if (testInfo.project.name === "mobile") {
    await expect(journey).toHaveAttribute("data-pinned", "false");
    await expect(page.locator(".journey-navigation")).toHaveCount(0);
    await expect(
      page.locator(".journey-chapter[aria-hidden=true]"),
    ).toHaveCount(0);
    await scrollAt(page, ".journey-chapter", 0.7);
    const before = await propertyValue(
      page,
      ".journey-chapter:first-child",
      "--chapter-progress",
    );
    await scrollAt(page, ".journey-chapter", 0.1);
    await expect
      .poll(() =>
        propertyValue(
          page,
          ".journey-chapter:first-child",
          "--chapter-progress",
        ),
      )
      .toBeGreaterThan(before);
  } else {
    await expect(journey).toHaveAttribute("data-pinned", "true");
    for (const [position, title] of [
      [0.12, "First, we listen."],
      [0.5, "Then, we look closer."],
      [0.86, "A place to make yours."],
      [0.12, "First, we listen."],
    ] as const) {
      await scrollScene(page, "#journey", position);
      await expect(page.locator(".journey-chapter.is-current h3")).toHaveText(
        title,
      );
      await expect
        .poll(() =>
          page
            .locator(".journey-stage")
            .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
        )
        .toBe(86);
    }
    await page.getByRole("button", { name: "03 The belonging" }).click();
    await expect(page.locator(".journey-chapter.is-current h3")).toHaveText(
      "A place to make yours.",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(journey).toHaveAttribute("data-pinned", "false");
    await expect(
      page.locator(".journey-chapter[aria-hidden=true]"),
    ).toHaveCount(0);
  }
});

test("narrow screens, tablets and landscape have no clipped layouts", async ({
  page,
}) => {
  await page.goto("/");
  for (const [width, height] of [
    [320, 740],
    [360, 800],
    [390, 844],
    [560, 900],
    [768, 1024],
    [844, 390],
    [1024, 768],
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const heading = await page.locator("h1").evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().right;
    });
    expect(heading).toBeLessThanOrEqual(width);
    const save = await page.locator(".save-button").first().boundingBox();
    expect(save!.width).toBeGreaterThanOrEqual(44);
    expect(save!.height).toBeGreaterThanOrEqual(44);
    if (width <= 800) {
      expect(
        await page
          .getByLabel("Preferred location")
          .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
    }
  }
});

test("long mobile forms scroll with an accessible close button", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
  await page
    .getByRole("button", { name: "Prepare my enquiry" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Prepare my enquiry" }),
  ).toBeInViewport();
  expect(
    await page
      .getByLabel("Email address")
      .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
  ).toBe(16);
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("mobile menu locks the background, closes with Escape and survives rotation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("#main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await menu.click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("the hero frames on desktop scroll and uses natural flow on phones", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const hero = page.locator(".hero-scroll");
  if (testInfo.project.name === "desktop") {
    await expect(hero).toHaveAttribute("data-pinned", "true");
    await page.evaluate(() => {
      const wrapper = document.querySelector(".hero-scroll")!;
      const stage = document.querySelector(".hero")!;
      scrollTo(0, (wrapper.clientHeight - stage.clientHeight) * 0.7);
    });
    await expect
      .poll(() => propertyValue(page, ".hero-scroll", "--hero-progress"))
      .toBeGreaterThan(0.65);
    await expect
      .poll(() =>
        page
          .locator(".hero")
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
      )
      .toBe(0);
    expect(
      await page
        .locator(".hero-visual")
        .evaluate((el) => getComputedStyle(el).clipPath),
    ).not.toBe("none");
    await page.evaluate(() => scrollTo(0, 0));
    await expect
      .poll(() => propertyValue(page, ".hero-scroll", "--hero-progress"))
      .toBe(0);
  } else {
    await expect(hero).toHaveAttribute("data-pinned", "false");
    expect(
      await hero.evaluate(
        (el) => el.clientHeight === el.querySelector(".hero")!.clientHeight,
      ),
    ).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-pinned", "false");
  await expect(page.locator(".hero-image")).toHaveCSS("transform", "none");
});

test("journey image wipes scrub continuously and reverse without timers", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const second = ".journey-chapter:nth-child(2)";
  if (testInfo.project.name === "desktop") {
    await expect(page.locator("#journey")).toHaveAttribute(
      "data-pinned",
      "true",
    );
    await scrollScene(page, "#journey", 0.3);
    await expect
      .poll(() => propertyValue(page, second, "--chapter-wipe"))
      .toBeGreaterThan(0.2);
    expect(await propertyValue(page, second, "--chapter-wipe")).toBeLessThan(
      0.7,
    );
    await scrollScene(page, "#journey", 0.42);
    await expect
      .poll(() => propertyValue(page, second, "--chapter-wipe"))
      .toBe(1);
    await scrollScene(page, "#journey", 0.22);
    await expect
      .poll(() => propertyValue(page, second, "--chapter-wipe"))
      .toBe(0);
  } else {
    await expect
      .poll(() => propertyValue(page, second, "--chapter-wipe"))
      .toBe(1);
    await expect(page.locator(`${second} .journey-image`)).toHaveCSS(
      "clip-path",
      "none",
    );
  }
});

test("new collection cards and typography respond to scroll without breaking filters", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore the collection", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(6);
  await scrollAt(page, ".property-card:last-child", 0.1);
  await expect
    .poll(() =>
      propertyValue(page, ".property-card:last-child", "--reveal-progress"),
    )
    .toBeGreaterThan(0.9);
  await scrollAt(page, ".perspective-ribbon", 0.75);
  await expect
    .poll(() => propertyValue(page, ".perspective-ribbon", "--scene-progress"))
    .toBeGreaterThan(0);
  const initial = await propertyValue(
    page,
    ".perspective-ribbon",
    "--scene-progress",
  );
  await scrollAt(page, ".perspective-ribbon", 0.1);
  await expect
    .poll(() => propertyValue(page, ".perspective-ribbon", "--scene-progress"))
    .toBeGreaterThan(initial + 0.2);
  await scrollAt(page, ".perspective-ribbon", 0.75);
  await expect
    .poll(() => propertyValue(page, ".perspective-ribbon", "--scene-progress"))
    .toBeLessThan(initial + 0.05);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".ribbon-track")).toHaveCSS("transform", "none");
  await expect(page.locator(".property-image-button").first()).toHaveCSS(
    "clip-path",
    "none",
  );
});
