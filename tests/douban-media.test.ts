import { describe, expect, it } from "vitest";
import {
  extractDoubanUserId,
  parseDoubanMediaPage,
  syncDoubanMedia
} from "@/lib/douban-media";

const movieItemHtml = `
  <div class="grid-view">
    <div class="item comment-item" data-cid="1">
      <div class="pic">
        <a title="示例电影" href="https://movie.douban.com/subject/1234567/" class="nbg">
          <img alt="示例电影" src="https://img1.doubanio.com/poster.jpg">
        </a>
      </div>
      <div class="info">
        <ul>
          <li class="title"><a href="https://movie.douban.com/subject/1234567/"><em>示例电影</em></a></li>
          <li class="intro">2026-07-30 / 主演甲 / 主演乙 / 中国大陆</li>
          <li><span class="rating4-t"></span><span class="date">2026-07-30</span></li>
          <li><span class="comment">值得继续看</span></li>
        </ul>
      </div>
    </div>
  </div>
`;

describe("Douban media sync", () => {
  it("extracts a user id only from supported public profile URLs", () => {
    expect(extractDoubanUserId("https://www.douban.com/people/lrwei91/")).toBe("lrwei91");
    expect(extractDoubanUserId("https://movie.douban.com/people/lrwei91/do")).toBe("lrwei91");
    expect(() => extractDoubanUserId("https://example.com/people/lrwei91/")).toThrow(/豆瓣/);
  });

  it("parses a public movie collection card into a media item", () => {
    const items = parseDoubanMediaPage(movieItemHtml, {
      category: "movie",
      progress: "active",
      status: "在看"
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "douban-movie-1234567",
      title: "示例电影",
      category: "movie",
      status: "在看",
      progress: "active",
      creator: "主演甲 · 主演乙",
      rating: 4,
      markedAt: "2026-07-30",
      source: "douban",
      sourceId: "1234567"
    });
    expect(items[0].coverImage).toContain("/api/douban/image?url=");
  });

  it("syncs through the server fetcher and returns a canonical cached result", async () => {
    const requestedUrls: string[] = [];
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = String(input);
      requestedUrls.push(url);
      return new Response(url.includes("movie.douban.com") && url.includes("/do?") ? movieItemHtml : "", {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    }) as typeof fetch;

    const result = await syncDoubanMedia("https://movie.douban.com/people/lrwei91/", fetcher);
    expect(result.items).toHaveLength(1);
    expect(result.source.profileUrl).toBe("https://www.douban.com/people/lrwei91/");
    expect(result.source.failedPages).toBe(0);
    expect(requestedUrls).toHaveLength(2);
    expect(requestedUrls.every((url) =>
      url.includes("movie.douban.com") && (url.includes("/do?") || url.includes("/wish?"))
    )).toBe(true);
  });

  it("keeps every fetched record instead of truncating the archive to the homepage limit", async () => {
    const pageWithThirteenItems = Array.from({ length: 13 }, (_, index) =>
      movieItemHtml
        .replaceAll("1234567", String(2_000_000 + index))
        .replaceAll("示例电影", `示例电影 ${index + 1}`)
    ).join("");
    const fetcher = (async (input: RequestInfo | URL) =>
      new Response(
        String(input).includes("movie.douban.com") && String(input).includes("/do?")
          ? pageWithThirteenItems
          : "",
        { status: 200 }
      )) as typeof fetch;

    const result = await syncDoubanMedia("https://www.douban.com/people/lrwei91/", fetcher);

    expect(result.items).toHaveLength(13);
    expect(result.source.totalItems).toBe(13);
  });

  it("rejects an empty partial response so saved content is not replaced", async () => {
    const fetcher = (async (input: RequestInfo | URL) => {
      if (String(input).includes("/do?")) {
        throw new Error("temporary upstream failure");
      }
      return new Response("", { status: 200 });
    }) as typeof fetch;

    await expect(
      syncDoubanMedia("https://www.douban.com/people/lrwei91/", fetcher)
    ).rejects.toThrow(/保留上次同步内容/);
  });

  it("rejects a populated partial response so missing pages cannot delete saved items", async () => {
    const fetcher = (async (input: RequestInfo | URL) => {
      if (String(input).includes("/wish?")) {
        throw new Error("temporary upstream failure");
      }
      return new Response(movieItemHtml, { status: 200 });
    }) as typeof fetch;

    await expect(
      syncDoubanMedia("https://www.douban.com/people/lrwei91/", fetcher)
    ).rejects.toThrow(/保留上次同步内容/);
  });
});
