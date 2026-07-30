import { describe, expect, it } from "vitest";
import {
  buildDoubanWatchlistGroups,
  getDoubanWatchlistProgress,
  readDoubanMediaSource,
  readMediaItems,
  readNowStatus,
  readPhotoStories,
  sortMediaItemsByMarkedAt
} from "@/lib/life-modules";

describe("life module readers", () => {
  it("returns backward-compatible empty values for missing metadata", () => {
    expect(readNowStatus(undefined)).toEqual({ headline: "", body: "", mood: undefined, location: undefined, tags: [], updatedAt: "" });
    expect(readMediaItems(undefined)).toEqual([]);
    expect(readDoubanMediaSource(undefined)).toEqual({
      provider: "douban",
      profileUrl: "",
      syncIntervalDays: 1,
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

  it("sorts media records by marked time descending and keeps undated items last", () => {
    const items = readMediaItems([
      { id: "old", category: "movie", title: "Old", status: "看过", markedAt: "2026-06-01" },
      { id: "undated", category: "book", title: "Undated", status: "想读" },
      { id: "new", category: "game", title: "New", status: "在玩", markedAt: "2026-07-30" }
    ]);

    expect(sortMediaItemsByMarkedAt(items).map((item) => item.id))
      .toEqual(["new", "old", "undated"]);
  });

  it("builds separate watching and wishlist groups with eight-card homepage limits", () => {
    const watching = Array.from({ length: 9 }, (_, index) => ({
      id: `watching-${index}`,
      category: "movie",
      title: `Watching ${index}`,
      status: "在看",
      markedAt: `2026-07-${String(index + 1).padStart(2, "0")}`
    }));
    const wishlist = Array.from({ length: 9 }, (_, index) => ({
      id: `wishlist-${index}`,
      category: "movie",
      title: `Wishlist ${index}`,
      status: "想看",
      markedAt: `2026-06-${String(index + 1).padStart(2, "0")}`
    }));
    const groups = buildDoubanWatchlistGroups(readMediaItems([
      ...watching,
      ...wishlist,
      { id: "book", category: "book", title: "Book", status: "想看" },
      { id: "watched", category: "movie", title: "Watched", status: "看过", progress: "completed" }
    ]));

    expect(groups[0].progress).toBe("active");
    expect(groups.find((group) => group.progress === "active")).toMatchObject({
      label: "在看",
      items: { length: 9 },
      visibleItems: { length: 8 }
    });
    expect(groups.find((group) => group.progress === "wishlist")).toMatchObject({
      label: "想看",
      items: { length: 9 },
      visibleItems: { length: 8 }
    });
    expect(getDoubanWatchlistProgress({
      id: "manual",
      category: "movie",
      title: "Manual",
      status: "在看",
      progress: "wishlist"
    })).toBe("active");
  });

  it("preserves stable story and photo ids", () => {
    const stories = readPhotoStories([{ id: "story", title: "Trip", photos: [{ id: "photo", url: "/trip.jpg", alt: "Trip" }] }]);
    expect(stories[0].id).toBe("story");
    expect(stories[0].photos[0].id).toBe("photo");
  });
});
