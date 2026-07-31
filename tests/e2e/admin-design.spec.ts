import { expect, test } from "@playwright/test";

test("测试账号可进入轻纸墨后台且预览沿用公开页主题", async ({ page }) => {
  await page.goto("/admin/login");

  const login = page.locator(".admin-login");
  const loginPanel = page.locator(".admin-login__panel");
  await expect(login).toBeVisible();
  await expect(loginPanel).toBeVisible();

  const loginContract = await login.evaluate((element) => {
    const panel = element.querySelector<HTMLElement>(".admin-login__panel");
    const heading = element.querySelector<HTMLElement>("h1");
    if (!panel || !heading) return null;
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      panelRadius: getComputedStyle(panel).borderRadius,
      headingFont: getComputedStyle(heading).fontFamily
    };
  });

  expect(loginContract?.background).toBe("rgb(250, 250, 250)");
  expect(loginContract?.panelRadius).toBe("12px");
  expect(loginContract?.headingFont.replaceAll("sans-serif", "")).not.toMatch(/songti|stsong|serif/i);

  await page.locator("#admin-password").fill("bio-blocks-e2e-admin");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin$/);

  const studio = page.locator(".admin-studio");
  const canvas = page.locator(".admin-studio__canvas");
  const profileCard = page.locator(".admin-profile-panel__card");
  await expect(studio).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(profileCard).toBeVisible();
  await expect(page.locator(".admin-floating-toolbar")).toBeVisible();

  const editorContract = await studio.evaluate((element) => {
    const canvas = element.querySelector<HTMLElement>(".admin-studio__canvas");
    const card = element.querySelector<HTMLElement>(".admin-profile-panel__card");
    if (!canvas || !card) return null;
    const style = getComputedStyle(element);
    const canvasStyle = getComputedStyle(canvas);
    return {
      background: style.backgroundColor,
      accent: style.getPropertyValue("--seal").trim(),
      canvasThemeBackground: canvasStyle.getPropertyValue("--paper").trim(),
      canvasRadius: canvasStyle.borderRadius,
      cardRadius: getComputedStyle(card).borderRadius
    };
  });

  expect(editorContract?.background).toBe("rgb(250, 250, 250)");
  expect(editorContract?.accent).toBe("#e45435");
  expect(editorContract?.canvasThemeBackground).toContain("#fafafa");
  expect(editorContract?.canvasRadius).toBe("12px");
  expect(editorContract?.cardRadius).toBe("12px");
});
