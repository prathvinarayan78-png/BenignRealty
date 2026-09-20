import { test, expect, type Page } from "@playwright/test";

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

function contrast(foreground: string, background: string) {
  const luminance = (value: string) => {
    const rgb = value
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((c) => {
        const n = c / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("dark is the first-load default for both light and dark device preferences", async ({
  page,
}) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(16, 27, 25)",
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#101b19",
    );
    for (const selector of [
      ".properties-section",
      ".scroll-journey",
      ".delhi-section",
      ".founders-section",
      ".contact-section",
      ".site-footer",
    ]) {
      const style = await page
        .locator(selector)
        .evaluate((el) => ({
          bg: getComputedStyle(el).backgroundColor,
          fg: getComputedStyle(el).color,
        }));
      expect(contrast(style.fg, style.bg)).toBeGreaterThan(4.5);
    }
    const cta = await page
      .locator(".hero .primary-button")
      .evaluate((el) => ({
        bg: getComputedStyle(el).backgroundColor,
        fg: getComputedStyle(el).color,
      }));
    expect(contrast(cta.fg, cta.bg)).toBeGreaterThan(4.5);
  }
});

test("mobile navigation and enquiry controls use readable dark surfaces", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const menu = await page
    .locator(".mobile-nav")
    .evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      fg: getComputedStyle(el).color,
    }));
  expect(contrast(menu.fg, menu.bg)).toBeGreaterThan(4.5);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(23, 38, 32)",
  );
  for (const label of [
    "Your name",
    "Phone number",
    "Email address",
    "I’m interested in",
    "A little about your plans",
  ]) {
    const control = await page
      .getByLabel(label)
      .evaluate((el) => ({
        bg: getComputedStyle(el).backgroundColor,
        fg: getComputedStyle(el).color,
        size: getComputedStyle(el).fontSize,
      }));
    expect(contrast(control.fg, control.bg)).toBeGreaterThan(4.5);
    expect(parseFloat(control.size)).toBeGreaterThanOrEqual(16);
  }
});

test("the mobile chapter guide tracks both scroll directions and its shortcuts work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("#journey")).toHaveAttribute(
    "data-pinned",
    "false",
  );
  const guide = page.getByRole("navigation", {
    name: "Journey chapters",
    exact: true,
  });
  const first = guide.getByRole("button", { name: /01 possibility/i });
  const second = guide.getByRole("button", { name: /02 perspective/i });
  const third = guide.getByRole("button", { name: /03 belonging/i });
  await scrollAt(page, "#journey-chapter-1", 0.3);
  await expect(first).toHaveAttribute("aria-current", "step");
  await scrollAt(page, "#journey-chapter-2", 0.3);
  await expect(second).toHaveAttribute("aria-current", "step");
  await expect(guide).toBeInViewport();
  expect(
    await guide.evaluate((el) => Math.round(el.getBoundingClientRect().top)),
  ).toBe(76);
  const progress = () =>
    page
      .locator("#journey-chapter-2")
      .evaluate((el) =>
        parseFloat(getComputedStyle(el).getPropertyValue("--chapter-read")),
      );
  const before = await progress();
  await scrollAt(page, "#journey-chapter-2", 0.1);
  await expect.poll(progress).toBeGreaterThan(before);
  await scrollAt(page, "#journey-chapter-1", 0.3);
  await expect(first).toHaveAttribute("aria-current", "step");
  await third.click();
  await expect(third).toHaveAttribute("aria-current", "step");
  await expect
    .poll(() =>
      page
        .locator("#journey-chapter-3")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(180);
  await expect(page.locator("#journey-chapter-3 h3")).toBeInViewport();
  await first.click();
  await expect(first).toHaveAttribute("aria-current", "step");
  await expect
    .poll(() =>
      page
        .locator("#journey-chapter-1")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(180);
});

test("additional mobile depth remains subtle and stops for reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => scrollTo(0, 240));
  await expect
    .poll(() =>
      page
        .locator(".hero-scroll")
        .evaluate((el) =>
          parseFloat(
            getComputedStyle(el).getPropertyValue("--mobile-hero-progress"),
          ),
        ),
    )
    .toBeGreaterThan(0.2);
  await expect(page.locator(".hero-scroll")).toHaveAttribute(
    "data-pinned",
    "false",
  );
  await scrollAt(page, ".founder-card", 0.65);
  await expect
    .poll(() =>
      page
        .locator(".founder-card")
        .first()
        .evaluate((el) =>
          parseFloat(getComputedStyle(el).getPropertyValue("--scene-progress")),
        ),
    )
    .toBeGreaterThan(0);
  const before = await page
    .locator(".founder-initials")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  await scrollAt(page, ".founder-card", 0.15);
  await expect
    .poll(() =>
      page
        .locator(".founder-initials")
        .first()
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(before);
  await expect(page.locator(".founder-card").first()).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".founder-initials").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator(".founder-placeholder-frame").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(
    page.locator(".journey-chapter .journey-image img").first(),
  ).toHaveCSS("transform", "none");
  await expect(page.locator(".hero-content")).toHaveCSS("transform", "none");
  await expect(page.locator(".journey-mobile-track").first()).toHaveCSS(
    "display",
    "none",
  );
});
