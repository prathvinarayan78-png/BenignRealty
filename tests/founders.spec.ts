import { test, expect } from "@playwright/test";

test("founders have reserved portraits and an original thought about home", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "The founders" })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "The founders" })
      .click();
  }
  const section = page.locator("#founders");
  await expect(
    section.getByRole("heading", { name: "The Founders. A shared vision." }),
  ).toBeInViewport();
  await expect(
    section.getByRole("heading", { name: "Talib Khan", exact: true }),
  ).toBeVisible();
  await expect(
    section.getByRole("heading", { name: "Prathvi Narayan", exact: true }),
  ).toBeVisible();
  await expect(section.getByText("Co-founder", { exact: true })).toHaveCount(2);
  // Each founder card shows their own supplied photograph, or the reserved
  // frame while that file is still missing. Never a broken image.
  for (const [slot, name] of [
    [section.locator(".founder-portrait").nth(0), "Talib Khan"],
    [section.locator(".founder-portrait").nth(1), "Prathvi Narayan"],
  ] as const) {
    await expect
      .poll(async () => {
        if (await slot.locator("img").count()) return "photo";
        if (await slot.locator(".founder-photo-placeholder").count())
          return "reserved";
        return "pending";
      })
      .not.toBe("pending");
    if (await slot.locator("img").count()) {
      await expect(slot.locator("img")).toHaveAttribute("alt", name);
      await expect(slot).toHaveAttribute("data-photo", "true");
      await expect
        .poll(() =>
          slot.locator("img").evaluate((node) => (node as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    } else {
      await expect(
        slot.getByRole("img", { name: `Photo space reserved for ${name}` }),
      ).toBeVisible();
      await expect(slot).toHaveAttribute("data-photo", "false");
    }
  }
  await expect(section.locator(".founder-thought")).toHaveCount(2);
  await expect(section).toContainText("where life begins to feel like our own");
  await expect(section).toContainText("room to grow, a place to pause");
});

test("portrait spaces stack on phones and sit side by side on larger screens", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator("#founders").scrollIntoViewIfNeeded();
    const first = await page.locator(".founder-portrait").nth(0).boundingBox();
    const second = await page.locator(".founder-portrait").nth(1).boundingBox();
    expect(first!.width).toBeGreaterThan(200);
    expect(first!.height).toBeGreaterThan(250);
    expect(second!.x + second!.width).toBeLessThanOrEqual(width);
    if (width <= 560) {
      expect(Math.round(second!.x)).toBe(Math.round(first!.x));
      expect(second!.y).toBeGreaterThan(first!.y + first!.height);
    } else {
      expect(Math.round(second!.y)).toBe(Math.round(first!.y));
      expect(second!.x).toBeGreaterThan(first!.x + first!.width);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});
