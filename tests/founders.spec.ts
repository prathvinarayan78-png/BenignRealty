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
  await expect(
    section.getByRole("img", { name: "Photo space reserved for Talib Khan" }),
  ).toBeVisible();
  await expect(
    section.getByRole("img", {
      name: "Photo space reserved for Prathvi Narayan",
    }),
  ).toBeVisible();
  await expect(section.locator("img")).toHaveCount(0);
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
