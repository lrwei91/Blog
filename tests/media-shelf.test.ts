import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MediaShelf } from "@/components/site/MediaShelf";
import { defaultSiteConfig } from "@/lib/default-site-config";

describe("MediaShelf", () => {
  it("renders watching as the default tab with four paged cards and no duplicate title", () => {
    const block = structuredClone(
      defaultSiteConfig.blocks.find((item) => item.id === "media-shelf")
    );
    if (!block) throw new Error("media shelf block missing");
    block.metadata = {
      mediaItems: [
        ...Array.from({ length: 9 }, (_, index) => ({
          id: `active-${index}`,
          category: "movie",
          title: `在看影片 ${index + 1}`,
          status: "在看",
          progress: "active",
          rating: index === 8 ? 8.5 : undefined,
          markedAt: `2026-07-${String(index + 1).padStart(2, "0")}`
        })),
        ...Array.from({ length: 9 }, (_, index) => ({
          id: `wish-${index}`,
          category: "movie",
          title: `想看影片 ${index + 1}`,
          status: "想看",
          progress: "wishlist",
          markedAt: `2026-06-${String(index + 1).padStart(2, "0")}`
        }))
      ],
      mediaSource: {
        provider: "douban",
        profileUrl: "https://www.douban.com/people/example/",
        syncIntervalDays: 1
      }
    };

    const html = renderToStaticMarkup(createElement(MediaShelf, { block }));

    expect(html).toContain('id="media-shelf-tab-active"');
    expect(html).toContain('id="media-shelf-tab-active" type="button" role="tab" aria-selected="true"');
    expect(html).toContain("在看影片 9");
    expect(html).not.toContain("在看影片 1");
    expect(html).not.toContain("想看影片 9");
    expect(html.match(/media-shelf__card/g)).toHaveLength(4);
    expect(html).not.toContain("media-shelf__number");
    expect(html).not.toContain("media-shelf__status");
    expect(html).not.toContain("<h3>我的豆瓣片单</h3>");
    expect(html).toContain('aria-label="下一页"');
    expect(html).not.toContain('aria-label="上一页"');
    expect(html).toContain("media-shelf__page-status");
    expect(html).not.toContain("media-shelf__pagination");
    expect(html).toContain('data-has-ratings="true"');
    expect(html).toContain("查看全部");
    expect(html).not.toContain("豆瓣主页");
    expect(html).not.toContain("豆瓣条目");
    expect(html).not.toMatch(/<small>0[09]<\/small>/);
    expect(html).not.toContain("DOUBAN WATCHLIST");
    expect(html).not.toContain("LAST SYNC");
  });
});
