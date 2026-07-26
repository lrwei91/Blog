import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
];

test("欢迎页在禁用 JavaScript 时仍可识别并进入主页", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.locator(".public-intro")).toBeVisible();
  await expect(page.locator(".public-intro__identity")).toContainText("林荣威");
  await expect(page.locator(".public-intro__enter")).toBeVisible();
  await expect(page.locator(".public-share")).toBeHidden();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.locator(".public-intro__enter").click();
  await expect(page).toHaveURL(/#profile$/);
  await expect(page.locator("#profile-name")).toBeVisible();
  await expect(page.getByRole("link", { name: "发送邮件给 林荣威" })).toBeVisible();

  await context.close();
});

test("连续动效只在对应区域可见时运行", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const intro = page.locator(".public-intro");
  const qualityStage = page.locator(".quality-stage");

  await expect(page.locator("html")).toHaveClass(/site-motion-ready/);
  await expect(intro).toHaveClass(/is-motion-active/);
  await page.locator(".public-intro__enter").click();
  await expect(page).toHaveURL(/#profile$/);
  await expect(intro).not.toHaveClass(/is-motion-active/);
  await expect(qualityStage).toHaveClass(/is-motion-active/);
});

test.describe("公开页视觉回归", () => {
  test("章节标题与对应模块共享同一水平边界", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator(".public-intro__enter").click();

    const alignments = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".public-section-heading")).flatMap((heading) => {
        const group = heading.nextElementSibling;
        const content = group?.classList.contains("public-content__block-group")
          ? group.firstElementChild
          : null;
        const title = heading.querySelector("h2");
        if (!(content instanceof HTMLElement) || !(title instanceof HTMLElement)) return [];

        const headingRect = heading.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const titleRect = title.getBoundingClientRect();
        return [{
          title: title.textContent?.trim() || "未命名章节",
          leftDelta: Math.abs(headingRect.left - contentRect.left),
          rightDelta: Math.abs(headingRect.right - contentRect.right),
          titleDelta: Math.abs(titleRect.left - contentRect.left)
        }];
      })
    );

    expect(alignments.length).toBeGreaterThan(0);
    for (const alignment of alignments) {
      expect(alignment.leftDelta, `${alignment.title} 左边界未对齐`).toBeLessThanOrEqual(1);
      expect(alignment.rightDelta, `${alignment.title} 右边界未对齐`).toBeLessThanOrEqual(1);
      expect(alignment.titleDelta, `${alignment.title} 标题文字未对齐`).toBeLessThanOrEqual(1);
    }
  });

  test("标准视口没有横向溢出或宽模块裁切", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.locator(".public-intro__enter").click();
      await page.locator("#profile").waitFor();

      const result = await page.evaluate(() => {
        const selectors = [
          ".experience-timeline",
          ".travel-footprint",
          ".personal-projects",
          ".now-status",
          ".media-shelf",
          ".photo-stories"
        ];
        const clipped = selectors.flatMap((selector) =>
          Array.from(document.querySelectorAll<HTMLElement>(selector)).flatMap((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > window.innerWidth + 1 ? [selector] : [];
          })
        );

        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          clipped
        };
      });

      expect(result.overflow, `${viewport.width}px 出现横向溢出`).toBeLessThanOrEqual(1);
      expect(result.clipped, `${viewport.width}px 出现模块裁切`).toEqual([]);
    }
  });

  test("弱文本满足普通文本对比度基线", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator(".public-intro__enter").click();

    const contrast = await page.locator(".quality-stage__signal b").evaluate((element) => {
      const site = element.closest<HTMLElement>(".public-site");
      if (!site) return 0;
      const foreground = getComputedStyle(element).color;
      const background = getComputedStyle(site).getPropertyValue("--card");
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) return 0;

      const readColor = (value: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value.trim();
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
      };
      const luminance = (rgb: number[]) => {
        const channels = rgb.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const foregroundLuminance = luminance(readColor(foreground));
      const backgroundLuminance = luminance(readColor(background));
      return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
    });

    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  test("详情弹层隔离背景、循环焦点并返回触发控件", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/site-motion-ready/);
    await page.locator(".public-intro__enter").click();
    const triggers = page.locator('[data-action="modal"]');
    expect(await triggers.count()).toBeGreaterThan(0);
    const trigger = triggers.first();

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "关闭详情" })).toBeFocused();

    const backgroundIsInert = await page.locator(".public-site").evaluate((root) => {
      const overlay = root.querySelector(".public-dialog");
      return Array.from(root.children).filter((element) => element !== overlay)
        .every((element) => (element as HTMLElement).inert);
    });
    expect(backgroundIsInert).toBe(true);

    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
