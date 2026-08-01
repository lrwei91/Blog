import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
];

async function expectProjectIdentity(page: Page) {
  await expect(page.locator(".public-intro")).toHaveAttribute("aria-label", "欢迎页");
  await expect(page.locator(".public-intro__identity")).toContainText("林荣威");
}

async function enterProfile(page: Page) {
  await page.locator(".public-intro__enter").click();
  await page.waitForURL(/\/profile$/);
  await page.locator("#profile").waitFor();
}

test("欢迎页在禁用 JavaScript 时仍可识别并进入主页", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  await page.goto("/");

  await expectProjectIdentity(page);
  await expect(page.locator(".public-intro")).toBeVisible();
  await expect(page.locator(".public-intro__identity")).toContainText("林荣威");
  await expect(page.locator(".public-intro__enter")).toBeVisible();
  await expect(page.locator(".public-share")).toBeHidden();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await enterProfile(page);
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator(".public-intro")).toHaveCount(0);
  await expect(page.locator("#profile-name")).toBeVisible();
  await expect(page.getByRole("link", { name: "发送邮件给 林荣威" })).toBeVisible();

  await context.close();
});

test("欢迎页标语保持两行且不产生横向溢出", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expectProjectIdentity(page);

    const result = await page.locator(".public-intro").evaluate((intro) => {
      const introRect = intro.getBoundingClientRect();
      const lines = Array.from(intro.querySelectorAll<HTMLElement>(".public-intro__line > span"));
      return {
        lineCount: lines.length,
        overflowingLines: lines.filter((line) => {
          const rect = line.getBoundingClientRect();
          return rect.left < introRect.left - 1 || rect.right > introRect.right + 1;
        }).length,
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });

    expect(result.lineCount).toBe(2);
    expect(result.overflowingLines, `${viewport.width}px 欢迎页标语溢出`).toBe(0);
    expect(result.documentOverflow, `${viewport.width}px 欢迎页横向溢出`).toBeLessThanOrEqual(1);
  }
});

test("欢迎页保持独立，个人项目位于技能之后和经历之前", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expectProjectIdentity(page);

  await expect(page.locator(".public-intro-projects")).toHaveCount(0);
  await expect(page.locator(".personal-projects")).toHaveCount(0);

  await enterProfile(page);
  await expect(page.locator('.public-content__block-group[data-content-group="projects"]')).toBeVisible();
  await expect(page.locator(".personal-projects__card")).toHaveCount(3);
  await expect(page.locator('.public-nav__links [data-section-link][href="#section-projects"]')).toHaveCount(1);

  const sectionOrder = await page.evaluate(() => {
    const skills = document.querySelector("#section-skills");
    const projects = document.querySelector("#section-projects");
    const experience = document.querySelector("#section-experience");
    if (!skills || !projects || !experience) return null;
    return {
      projectsAfterSkills: Boolean(skills.compareDocumentPosition(projects) & Node.DOCUMENT_POSITION_FOLLOWING),
      experienceAfterProjects: Boolean(projects.compareDocumentPosition(experience) & Node.DOCUMENT_POSITION_FOLLOWING)
    };
  });
  expect(sectionOrder).toEqual({ projectsAfterSkills: true, experienceAfterProjects: true });

  const projectComposition = await page.locator(".personal-projects__card").evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { width: rect.width, top: rect.top };
    })
  );
  expect(projectComposition[0].width).toBeGreaterThan(projectComposition[1].width);
  expect(Math.abs(projectComposition[0].top - projectComposition[1].top)).toBeLessThanOrEqual(1);
  expect(projectComposition[2].width).toBeGreaterThan(projectComposition[0].width);
  expect(projectComposition[2].top).toBeGreaterThan(projectComposition[0].top);
});

test("关键内容只做一次性揭示且没有持续装饰动画", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expectProjectIdentity(page);

  await expect(page.locator("html")).toHaveClass(/site-motion-ready/);
  await expect(page.locator("[data-continuous-motion]")).toHaveCount(0);
  await enterProfile(page);
  const projectCard = page.locator(".personal-projects__card").first();
  await projectCard.scrollIntoViewIfNeeded();
  await expect(projectCard).toHaveClass(/is-visible/);
  await page.locator("#profile").scrollIntoViewIfNeeded();
  await expect(projectCard).toHaveClass(/is-visible/);
});

test("Observer 不可用时直接显示静态最终状态", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: undefined
    });
  });
  await page.goto("/");
  await expectProjectIdentity(page);
  await enterProfile(page);

  await expect(page.locator("html")).not.toHaveClass(/site-motion-ready/);
  const hiddenRevealItems = await page.locator(".public-site [data-reveal]").evaluateAll((items) =>
    items.filter((item) => {
      const style = getComputedStyle(item);
      return style.opacity === "0" || style.visibility === "hidden";
    }).length
  );
  expect(hiddenRevealItems).toBe(0);
});

test.describe("公开页视觉回归", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expectProjectIdentity(page);
  });

  test("个性化编辑视觉契约使用系统主题、真实主视觉和开放式内容", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expectProjectIdentity(page);

    const introContract = await page.locator(".public-intro").evaluate((intro) => {
      const site = intro.closest<HTMLElement>(".public-site");
      if (!site) return null;
      const siteStyle = getComputedStyle(site);
      return {
        scheme: site.getAttribute("data-color-scheme"),
        background: siteStyle.getPropertyValue("--site-bg").trim().toLowerCase(),
        card: siteStyle.getPropertyValue("--site-card").trim().toLowerCase(),
        primary: siteStyle.getPropertyValue("--site-primary").trim().toLowerCase(),
        viewportHeightDelta: Math.abs(intro.getBoundingClientRect().height - window.innerHeight),
        hasHeroImage: Boolean(intro.querySelector(".public-intro__visual-image")),
        ambientWash: getComputedStyle(document.querySelector<HTMLElement>(".public-site__wash")!).display,
        imageTape: getComputedStyle(intro.querySelector<HTMLElement>(".public-intro__visual")!, "::before").content,
        sectionEyebrows: document.querySelectorAll(".public-section-heading__label").length
      };
    });

    expect(introContract).toMatchObject({
      scheme: "system",
      background: "#f4f5f6",
      card: "#f9fafb",
      primary: "#e45435",
      hasHeroImage: true,
      ambientWash: "block",
      imageTape: '\"\"',
      sectionEyebrows: 0
    });
    expect(introContract!.viewportHeightDelta).toBeLessThanOrEqual(1);

    await enterProfile(page);

    const visualContract = await page.evaluate(() => {
      const serifFamily = (value: string) => value.split(",").some((entry) => {
        const family = entry.trim().replaceAll("\"", "").replaceAll("'", "").toLowerCase();
        return family === "serif"
          || family.includes("songti")
          || family.includes("stsong")
          || family.includes("noto serif")
          || family.includes("source han serif");
      });
      const font = (selector: string) => getComputedStyle(document.querySelector<HTMLElement>(selector)!).fontFamily;
      const cardStyle = getComputedStyle(document.querySelector<HTMLElement>(".public-content .public-block-card")!);
      const serifUsers = Array.from(document.querySelectorAll<HTMLElement>(".public-site *"))
        .filter((element) => serifFamily(getComputedStyle(element).fontFamily))
        .map((element) => element.matches(".quality-stage__signal small"));

      return {
        titleFonts: [
          font(".profile-module--name h1"),
          font(".public-section-heading h2"),
          font(".public-content .public-block-card h3")
        ],
        mottoFont: font(".quality-stage__signal small"),
        serifUsers,
        cardRadius: cardStyle.borderRadius,
        cardShadow: cardStyle.boxShadow
      };
    });

    expect(visualContract.titleFonts.every((font) => !/songti|stsong|serif/i.test(font.replaceAll("sans-serif", "")))).toBe(true);
    expect(visualContract.mottoFont.replaceAll("sans-serif", "")).toMatch(/songti|stsong|serif/i);
    expect(visualContract.serifUsers.length).toBeGreaterThan(0);
    expect(visualContract.serifUsers.every(Boolean)).toBe(true);
    expect(visualContract.cardRadius).toBe("0px");
    expect(visualContract.cardShadow).toBe("none");
  });

  test("个人信息、章节标题与对应模块共享同一水平边界", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expectProjectIdentity(page);
    await enterProfile(page);

    const pageRegions = await page.evaluate(() => {
      const profile = document.querySelector<HTMLElement>(".profile-hero");
      const content = document.querySelector<HTMLElement>(".public-content");
      if (!profile || !content) return null;

      const profileRect = profile.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      return {
        leftDelta: Math.abs(profileRect.left - contentRect.left),
        rightDelta: Math.abs(profileRect.right - contentRect.right)
      };
    });

    expect(pageRegions).not.toBeNull();
    expect(pageRegions!.leftDelta, "个人信息与章节左边界未对齐").toBeLessThanOrEqual(1);
    expect(pageRegions!.rightDelta, "个人信息与章节右边界未对齐").toBeLessThanOrEqual(1);

    await expect(page.locator('[data-has-company-logo="false"] .experience-timeline__art')).toHaveCount(0);

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
      await expectProjectIdentity(page);
      await enterProfile(page);

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
    await expectProjectIdentity(page);
    await enterProfile(page);

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
    await expectProjectIdentity(page);
    await expect(page.locator("html")).toHaveClass(/site-motion-ready/);
    await enterProfile(page);
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

  test("移动端技能卡片完整展示且悬浮工具不遮挡正文", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await enterProfile(page);

    const skills = page.locator('[data-content-group="skills"] .public-block-card');
    expect(await skills.count()).toBeGreaterThan(0);
    const clippedCards = await skills.evaluateAll((cards) =>
      cards.filter((card) => card.scrollHeight > card.clientHeight + 1).length
    );
    expect(clippedCards, "390px 下技能卡片文字被裁切").toBe(0);

    await page.evaluate(() => window.scrollTo(0, 800));
    const tools = page.locator(".public-floating-tools");
    await expect(tools.locator("span")).toHaveCount(2);
    const toolLayout = await tools.evaluate((element) => {
      const buttons = Array.from(element.querySelectorAll<HTMLElement>("button"));
      return {
        spanDisplays: Array.from(element.querySelectorAll<HTMLElement>("span")).map((span) => getComputedStyle(span).display),
        widths: buttons.map((button) => button.getBoundingClientRect().width),
        right: window.innerWidth - element.getBoundingClientRect().right
      };
    });
    expect(toolLayout.spanDisplays).toEqual(["none", "none"]);
    expect(toolLayout.widths.every((width) => width <= 41)).toBe(true);
    expect(toolLayout.right).toBeGreaterThanOrEqual(8);
  });

  test("豆瓣片单按组件宽度使用 4、2、1 张分页且减弱动效静态显示", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const item of [
      { viewport: { width: 320, height: 720 }, pageSize: "1" },
      { viewport: { width: 390, height: 844 }, pageSize: "1" },
      { viewport: { width: 768, height: 1024 }, pageSize: "2" },
      { viewport: { width: 1024, height: 768 }, pageSize: "4" },
      { viewport: { width: 1440, height: 900 }, pageSize: "4" }
    ]) {
      await page.setViewportSize(item.viewport);
      await page.goto("/profile");
      const panel = page.locator(".media-shelf__tab-panel");
      await expect(panel).toHaveAttribute("data-page-size", item.pageSize);
      await expect(page.locator(".media-shelf__card")).toHaveCount(Number(item.pageSize));
      expect(await panel.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    }
  });

  test("导航状态、豆瓣 Tab 和离散分页按当前内容切换", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await enterProfile(page);

    const firstSectionLink = page.locator(".public-nav__links [data-section-link]").first();
    await firstSectionLink.click();
    await expect(firstSectionLink).toHaveAttribute("aria-current", "location");

    const mediaHeading = page.locator('[data-content-group="media"]');
    await mediaHeading.scrollIntoViewIfNeeded();
    await expect(page.locator('[data-section-link][href="#section-media"]').first()).toHaveAttribute("aria-current", "location");
    await expect(page.locator('#media-shelf-tab-active')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".media-shelf__card")).toHaveCount(4);
    await expect(page.locator(".media-shelf__pagination")).toContainText("1 / 3");
    await page.getByRole("button", { name: "下一页" }).click();
    await expect(page.locator(".media-shelf__pagination")).toContainText("2 / 3");
    await page.locator('#media-shelf-tab-active').focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('#media-shelf-tab-wishlist')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".media-shelf__card")).toHaveCount(4);
    await expect(page.locator(".media-shelf__pagination")).toContainText("1 / 3");

    const gridOverflow = await page.locator(".media-shelf__grid").evaluate((grid) => ({
      overflowX: getComputedStyle(grid).overflowX,
      scrollDelta: grid.scrollWidth - grid.clientWidth
    }));
    expect(gridOverflow.overflowX).not.toBe("auto");
    expect(gridOverflow.overflowX).not.toBe("scroll");
    expect(gridOverflow.scrollDelta).toBeLessThanOrEqual(1);

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator('#media-shelf-tab-active')).toHaveAttribute("aria-selected", "true");
    const viewAll = page.getByRole("button", { name: "查看全部" });
    await viewAll.click();
    await expect(page.getByRole("dialog", { name: "在看的全部记录" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(viewAll).toBeFocused();
  });
});
