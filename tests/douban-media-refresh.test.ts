import { describe, expect, it, vi } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { isDoubanSyncDue, refreshDueDoubanMedia } from "@/lib/douban-media-refresh";

const now = new Date("2026-07-30T12:00:00.000Z");

describe("scheduled Douban media refresh", () => {
  it("honors disabled and elapsed-day intervals", () => {
    expect(isDoubanSyncDue({
      provider: "douban",
      profileUrl: "https://www.douban.com/people/example/",
      syncIntervalDays: 0
    }, now)).toBe(false);
    expect(isDoubanSyncDue({
      provider: "douban",
      profileUrl: "https://www.douban.com/people/example/",
      syncIntervalDays: 3,
      lastSyncedAt: "2026-07-28T12:00:00.000Z"
    }, now)).toBe(false);
    expect(isDoubanSyncDue({
      provider: "douban",
      profileUrl: "https://www.douban.com/people/example/",
      syncIntervalDays: 3,
      lastSyncedAt: "2026-07-27T12:00:00.000Z"
    }, now)).toBe(true);
  });

  it("fetches each due profile once and refreshes every matching content scope", async () => {
    const config = structuredClone(defaultSiteConfig);
    const media = config.blocks.find((block) => block.id === "media-shelf");
    if (!media) throw new Error("media module missing");
    media.metadata = {
      ...media.metadata,
      mediaSource: {
        provider: "douban",
        profileUrl: "https://www.douban.com/people/example/",
        syncIntervalDays: 7,
        lastSyncedAt: "2026-07-20T12:00:00.000Z"
      }
    };
    config.contentVariants = {
      "secondary:zh-CN": {
        profile: config.profile,
        sections: config.sections,
        blocks: structuredClone(config.blocks),
        theme: config.theme
      }
    };
    const syncer = vi.fn(async () => ({
      items: [{
        id: "douban-movie-1",
        category: "movie" as const,
        title: "New title",
        status: "在看"
      }],
      source: {
        provider: "douban" as const,
        profileUrl: "https://www.douban.com/people/example/",
        syncIntervalDays: 1 as const,
        lastSyncedAt: now.toISOString(),
        totalItems: 1,
        failedPages: 0
      }
    }));

    const result = await refreshDueDoubanMedia(config, now, syncer);

    expect(syncer).toHaveBeenCalledTimes(1);
    expect(result.summary).toMatchObject({ dueBlocks: 2, updatedBlocks: 2, failedBlocks: 0 });
    const refreshedSource = result.config.blocks
      .find((block) => block.id === "media-shelf")
      ?.metadata?.mediaSource;
    expect(refreshedSource).toMatchObject({ syncIntervalDays: 7, totalItems: 1 });
  });

  it("keeps saved items when the scheduled fetch fails", async () => {
    const config = structuredClone(defaultSiteConfig);
    const media = config.blocks.find((block) => block.id === "media-shelf");
    if (!media) throw new Error("media module missing");
    media.metadata = {
      mediaItems: [{ id: "saved", category: "movie", title: "Saved", status: "在看" }],
      mediaSource: {
        provider: "douban",
        profileUrl: "https://www.douban.com/people/example/",
        syncIntervalDays: 1
      }
    };

    const result = await refreshDueDoubanMedia(config, now, async () => {
      throw new Error("upstream unavailable");
    });

    expect(result.summary).toMatchObject({ dueBlocks: 1, updatedBlocks: 0, failedBlocks: 1 });
    expect(result.config.blocks.find((block) => block.id === "media-shelf")?.metadata?.mediaItems)
      .toEqual(media.metadata.mediaItems);
  });
});
