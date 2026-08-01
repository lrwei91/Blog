import { expect, test } from "@playwright/test";

test("系统主题跟随操作系统明暗模式", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  const site = page.locator(".public-site");
  await expect(site).toBeVisible();
  await expect(site).toHaveAttribute("data-color-scheme", "system");

  const lightContract = await site.evaluate((element) => ({
    siteBackground: getComputedStyle(element).getPropertyValue("--site-bg").trim().toLowerCase()
  }));
  expect(lightContract.siteBackground).toBe("#f4f5f6");

  await page.emulateMedia({ colorScheme: "dark" });

  const darkContract = await site.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      bodyBackground: getComputedStyle(document.body).backgroundColor
    };
  });

  expect(darkContract.background).toBe("rgb(14, 15, 18)");
  expect(darkContract.color).toBe("rgb(233, 236, 240)");
  expect(darkContract.bodyBackground).toBe("rgb(14, 15, 18)");
});
