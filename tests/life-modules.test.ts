import { describe, expect, it } from "vitest";
import { readDoubanMediaSource, readMediaItems, readNowStatus, readPhotoStories } from "@/lib/life-modules";

describe("life module readers", () => {
  it("returns backward-compatible empty values for missing metadata", () => {
    expect(readNowStatus(undefined)).toEqual({ headline: "", body: "", mood: undefined, location: undefined, tags: [], updatedAt: "" });
    expect(readMediaItems(undefined)).toEqual([]);
    expect(readDoubanMediaSource(undefined)).toEqual({
      provider: "douban",
      profileUrl: "",
      lastSyncedAt: undefined,
      totalItems: undefined,
      failedPages: undefined
    });
    expect(readPhotoStories(undefined)).toEqual([]);
  });

  it("preserves normalized Douban item metadata", () => {
    const items = readMediaItems([{
      id: "douban-movie-1",
      category: "movie",
      title: "Film",
      status: "在看",
      progress: "active",
      markedAt: "2026-07-30",
      source: "douban",
      sourceId: "1"
    }]);
    expect(items[0]).toMatchObject({
      progress: "active",
      markedAt: "2026-07-30",
      source: "douban",
      sourceId: "1"
    });
  });

  it("clamps ratings and ignores malformed collection entries", () => {
    const items = readMediaItems([
      null,
      { id: "one", category: "movie", title: "Film", status: "Watched", rating: 8 }
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].rating).toBe(5);
  });

  it("preserves stable story and photo ids", () => {
    const stories = readPhotoStories([{ id: "story", title: "Trip", photos: [{ id: "photo", url: "/trip.jpg", alt: "Trip" }] }]);
    expect(stories[0].id).toBe("story");
    expect(stories[0].photos[0].id).toBe("photo");
  });
});
