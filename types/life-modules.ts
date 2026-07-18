export type NowStatus = {
  headline: string;
  body: string;
  mood?: string;
  location?: string;
  tags: string[];
  updatedAt: string;
};

export type MediaCategory = "movie" | "book" | "game" | "music" | "other";

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
