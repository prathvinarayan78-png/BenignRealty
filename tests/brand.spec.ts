import { test, expect } from "@playwright/test";

test("the refined brand is legible, accessible and fits narrow headers", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Benign Realty home" }),
  ).toHaveCount(2);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check('500 24px "Manrope"')),
  ).toBe(true);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const logo = await page.locator(".site-header .brand").boundingBox();
    const actions = await page.locator(".header-actions").boundingBox();
    expect(logo!.x + logo!.width).toBeLessThanOrEqual(actions!.x);
    expect(actions!.x + actions!.width).toBeLessThanOrEqual(width - 15);
    await expect(page.locator(".site-header .brand-name")).toHaveText("BENIGN");
    await expect(page.locator(".site-header .brand-descriptor")).toHaveText(
      "REALTY",
    );
  }
  expect((await page.request.get("/favicon.svg")).ok()).toBe(true);
  expect((await page.request.get("/brand/benign-monogram.svg")).ok()).toBe(
    true,
  );
});
