export type NowStatus = {
  headline: string;
  body: string;
  mood?: string;
  location?: string;
  tags: string[];
  updatedAt: string;
};

export type MediaCategory = "movie" | "book" | "game" | "music" | "other";
export type MediaProgress = "active" | "wishlist" | "completed";
export type DoubanWatchlistProgress = Extract<MediaProgress, "active" | "wishlist">;

export type MediaItem = {
  id: string;
  category: MediaCategory;
  title: string;
  creator?: string;
  coverImage?: string;
  status: string;
  rating?: number;
  note?: string;
  href?: string;
  progress?: MediaProgress;
  markedAt?: string;
  source?: "douban" | "manual";
  sourceId?: string;
};

export type DoubanMediaSource = {
  provider: "douban";
  profileUrl: string;
  syncIntervalDays: 0 | 1 | 3 | 7 | 14 | 30;
  lastSyncedAt?: string;
  totalItems?: number;
  failedPages?: number;
};

export type PhotoStoryImage = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
};

export type PhotoStory = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  summary?: string;
  photos: PhotoStoryImage[];
};

export type LifeModuleType = "now" | "media" | "photos";
