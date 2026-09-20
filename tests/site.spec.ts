import { test, expect } from "@playwright/test";

test("loads imagery and stays within the viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /A better address/ }),
  ).toBeVisible();
  await expect(page.locator(".property-card")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".hero-image")
      .evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Explore the collection", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(6);
  expect(errors).toEqual([]);
});

test("filters by location, category and budget, including no results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Preferred location").selectOption("Aerocity");
  await page
    .getByLabel("Property type", { exact: true })
    .selectOption("Commercial");
  await page.getByLabel("Your budget").selectOption("3to7");
  await page
    .getByRole("button", { name: "Explore properties", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(1);
  await expect(page.locator(".property-card")).toContainText("Aerocity");
  await page.getByRole("button", { name: "Residential", exact: true }).click();
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".property-card")).toHaveCount(6);
});

test("saves properties, persists favourites and opens accessible details", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Save The park-side perspective",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Unsave The park-side perspective",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Saved properties (1)", exact: true })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Explore The park-side perspective",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "not a live or verified listing",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", {
      name: "Unsave The park-side perspective",
      exact: true,
    })
    .click();
  await expect(page.locator(".empty-state")).toContainText(
    "Your collection is waiting",
  );
});

test("service accordions and neighbourhood browsing work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const residential = page.getByRole("button", {
    name: "01 Residential real estate",
  });
  await residential.click();
  await expect(residential).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "02 Commercial spaces" }).click();
  await expect(page.locator("#service-1")).toBeVisible();
  await page
    .locator(".neighbourhoods")
    .getByRole("button", { name: "Dwarka" })
    .click();
  await expect(page.locator(".property-card")).toHaveCount(1);
  await expect(page.locator(".property-card")).toContainText("Dwarka");
  expect(errors).toEqual([]);
});

test("validates and prepares a downloadable enquiry without claiming delivery", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Your name").fill("Delhi Homebuyer");
  await page.getByLabel("Phone number").fill("invalid");
  expect(
    await page
      .getByLabel("Phone number")
      .evaluate((input: HTMLInputElement) => input.checkValidity()),
  ).toBe(false);
  await page.getByLabel("Phone number").fill("+91 9876543210");
  await page.getByLabel("Email address").fill("homebuyer@example.com");
  await page
    .getByLabel("A little about your plans")
    .fill("A 3 bedroom home in South Delhi.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(
    page.getByText("Your enquiry is ready.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "does not send enquiries online",
  );
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download my enquiry" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Benign-Realty-Enquiry.txt");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("mobile menu and privacy dialog are usable", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Properties" })
      .click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).not.toBeVisible();
  }
  await page.getByRole("button", { name: "Privacy & information" }).click();
  await expect(page.getByRole("dialog")).toContainText("Your privacy");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Lenis handles smooth navigation and dialog scroll locking", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page
    .getByRole("link", { name: "Find your space", exact: true })
    .click();
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Math.round(
            document.querySelector("#properties")!.getBoundingClientRect().top,
          ),
        ),
      { timeout: 5000 },
    )
    .toBeLessThan(100);
  await page.getByRole("button", { name: "Let’s talk", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
});
