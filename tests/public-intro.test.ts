import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PublicIntro } from "@/components/site/PublicIntro";

describe("PublicIntro", () => {
  it("renders the admin-configured remote image URL without the Next image optimizer", () => {
    const introImageUrl = "https://example.public.blob.vercel-storage.com/images/intro/cover.webp";
    const html = renderToStaticMarkup(createElement(PublicIntro, {
      displayName: "测试用户",
      headline: "个人站",
      enableMotion: true,
      introImageUrl
    }));

    expect(html).toContain(`src="${introImageUrl}"`);
    expect(html).not.toContain("/_next/image");
  });

  it("keeps the bundled welcome image as the empty-value fallback", () => {
    const html = renderToStaticMarkup(createElement(PublicIntro, {
      displayName: "测试用户",
      headline: "个人站",
      enableMotion: false,
      introImageUrl: "  "
    }));

    expect(html).toContain('src="/images/hero/qa-workbench-v2.webp"');
  });
});
