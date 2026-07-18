import type {
  MediaCategory,
  MediaItem,
  NowStatus,
  PhotoStory,
  PhotoStoryImage
} from "@/types/life-modules";

const mediaCategories = new Set<MediaCategory>(["movie", "book", "game", "music", "other"]);

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
      href: readOptionalString(item.href)
    }];
  });
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

function cryptoSafeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
