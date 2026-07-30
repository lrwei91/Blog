import type {
  DoubanMediaSource,
  DoubanWatchlistProgress,
  MediaCategory,
  MediaItem,
  MediaProgress,
  NowStatus,
  PhotoStory,
  PhotoStoryImage
} from "@/types/life-modules";

const mediaCategories = new Set<MediaCategory>(["movie", "book", "game", "music", "other"]);
const mediaProgresses = new Set<MediaProgress>(["active", "wishlist", "completed"]);
const doubanSyncIntervals = new Set<DoubanMediaSource["syncIntervalDays"]>([0, 1, 3, 7, 14, 30]);

export function readNowStatus(value: unknown): NowStatus {
  const entry = isRecord(value) ? value : {};
  return {
    headline: readString(entry.headline),
    body: readString(entry.body),
    mood: readOptionalString(entry.mood),
    location: readOptionalString(entry.location),
    tags: Array.isArray(entry.tags) ? entry.tags.filter((tag): tag is string => typeof tag === "string") : [],
    updatedAt: readString(entry.updatedAt)
  };
}

export function readMediaItems(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const category = mediaCategories.has(item.category as MediaCategory) ? item.category as MediaCategory : "other";
    const rating = typeof item.rating === "number" && Number.isFinite(item.rating)
      ? Math.min(5, Math.max(0, item.rating))
      : undefined;
    return [{
      id: readString(item.id) || cryptoSafeId("media"),
      category,
      title: readString(item.title),
      creator: readOptionalString(item.creator),
      coverImage: readOptionalString(item.coverImage),
      status: readString(item.status),
      rating,
      note: readOptionalString(item.note),
      href: readOptionalString(item.href),
      progress: mediaProgresses.has(item.progress as MediaProgress) ? item.progress as MediaProgress : undefined,
      markedAt: readOptionalString(item.markedAt),
      source: item.source === "douban" ? "douban" : item.source === "manual" ? "manual" : undefined,
      sourceId: readOptionalString(item.sourceId)
    }];
  });
}

export function sortMediaItemsByMarkedAt(items: MediaItem[]) {
  return [...items].sort((left, right) => {
    const leftTimestamp = readMediaTimestamp(left.markedAt);
    const rightTimestamp = readMediaTimestamp(right.markedAt);
    return rightTimestamp - leftTimestamp;
  });
}

export function getDoubanWatchlistProgress(item: MediaItem): DoubanWatchlistProgress | null {
  const status = item.status.trim();
  if (status === "在看") return "active";
  if (status === "想看") return "wishlist";
  if (item.progress === "active" || item.progress === "wishlist") return item.progress;
  return null;
}

export function buildDoubanWatchlistGroups(items: MediaItem[]) {
  const movieItems = sortMediaItemsByMarkedAt(items)
    .filter((item) => item.category === "movie");
  return ([
    { progress: "wishlist" as const, label: "想看", eyebrow: "WISHLIST" },
    { progress: "active" as const, label: "在看", eyebrow: "WATCHING" }
  ]).map((group) => {
    const groupItems = movieItems.filter(
      (item) => getDoubanWatchlistProgress(item) === group.progress
    );
    return {
      ...group,
      items: groupItems,
      visibleItems: groupItems.slice(0, 6)
    };
  });
}

export function readDoubanMediaSource(value: unknown): DoubanMediaSource {
  const entry = isRecord(value) ? value : {};
  return {
    provider: "douban",
    profileUrl: readString(entry.profileUrl),
    syncIntervalDays: doubanSyncIntervals.has(entry.syncIntervalDays as DoubanMediaSource["syncIntervalDays"])
      ? entry.syncIntervalDays as DoubanMediaSource["syncIntervalDays"]
      : 1,
    lastSyncedAt: readOptionalString(entry.lastSyncedAt),
    totalItems: typeof entry.totalItems === "number" && Number.isFinite(entry.totalItems)
      ? Math.max(0, Math.floor(entry.totalItems))
      : undefined,
    failedPages: typeof entry.failedPages === "number" && Number.isFinite(entry.failedPages)
      ? Math.max(0, Math.floor(entry.failedPages))
      : undefined
  };
}

export function readPhotoStories(value: unknown): PhotoStory[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    return [{
      id: readString(item.id) || cryptoSafeId("story"),
      title: readString(item.title),
      date: readOptionalString(item.date),
      location: readOptionalString(item.location),
      summary: readOptionalString(item.summary),
      photos: readPhotoStoryImages(item.photos)
    }];
  });
}

function readPhotoStoryImages(value: unknown): PhotoStoryImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    return [{
      id: readString(item.id) || cryptoSafeId("photo"),
      url: readString(item.url),
      alt: readString(item.alt),
      caption: readOptionalString(item.caption)
    }];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readOptionalString(value: unknown) {
  const stringValue = readString(value);
  return stringValue || undefined;
}

function readMediaTimestamp(value?: string) {
  if (!value) return Number.NEGATIVE_INFINITY;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function cryptoSafeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
