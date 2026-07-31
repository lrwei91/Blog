import { expect, test } from "@playwright/test";

test("深色墨玉令牌层在切换 data-color-scheme 后生效", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const site = page.locator(".public-site");
  await expect(site).toBeVisible();
  await expect(site).toHaveAttribute("data-color-scheme", "light");

  const lightContract = await site.evaluate((element) => ({
    siteBackground: getComputedStyle(element).getPropertyValue("--site-bg").trim().toLowerCase()
  }));
  expect(lightContract.siteBackground).toBe("#fafafa");

  await site.evaluate((element) => element.setAttribute("data-color-scheme", "dark"));

  const darkContract = await site.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      bodyBackground: getComputedStyle(document.body).backgroundColor
    };
  });

  expect(darkContract.background).toBe("rgb(14, 14, 17)");
  expect(darkContract.color).toBe("rgb(236, 233, 226)");
  expect(darkContract.bodyBackground).toBe("rgb(14, 14, 17)");
});
