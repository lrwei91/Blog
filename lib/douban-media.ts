import type {
  DoubanMediaSource,
  MediaCategory,
  MediaItem,
  MediaProgress
} from "@/types/life-modules";
import { sortMediaItemsByMarkedAt } from "@/lib/life-modules";

const requestTimeoutMs = 12_000;

type DoubanStatusSlug = "do" | "wish" | "collect";
type DoubanPageSpec = {
  category: Exclude<MediaCategory, "other">;
  progress: MediaProgress;
  slug: DoubanStatusSlug;
  status: string;
  url: string;
};

export type DoubanMediaSyncResult = {
  items: MediaItem[];
  source: DoubanMediaSource;
};

export async function syncDoubanMedia(
  profileUrl: string,
  fetcher: typeof fetch = fetch
): Promise<DoubanMediaSyncResult> {
  const userId = extractDoubanUserId(profileUrl);
  const canonicalProfileUrl = `https://www.douban.com/people/${encodeURIComponent(userId)}/`;
  const specs = buildPageSpecs(userId);
  const settled = await Promise.allSettled(
    specs.map(async (spec) => {
      const response = await fetcher(spec.url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          Referer: "https://www.douban.com/",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/135 Safari/537.36"
        },
        cache: "no-store",
        signal: AbortSignal.timeout(requestTimeoutMs)
      });
      if (!response.ok) throw new Error(`Douban returned ${response.status}`);
      return parseDoubanMediaPage(await response.text(), spec);
    })
  );

  const successfulPages = settled.filter((result) => result.status === "fulfilled");
  if (successfulPages.length === 0) {
    throw new Error("豆瓣公开页暂时无法访问，请稍后重试");
  }

  const items = sortMediaItemsByMarkedAt(
    successfulPages.flatMap((result) => result.value)
  );
  if (items.length === 0 && successfulPages.length < settled.length) {
    throw new Error("豆瓣公开页只返回了部分结果，已保留上次同步内容，请稍后重试");
  }
  const syncedAt = new Date().toISOString();

  return {
    items,
    source: {
      provider: "douban",
      profileUrl: canonicalProfileUrl,
      syncIntervalDays: 1,
      lastSyncedAt: syncedAt,
      totalItems: items.length,
      failedPages: settled.length - successfulPages.length
    }
  };
}

export function extractDoubanUserId(profileUrl: string) {
  let url: URL;
  try {
    url = new URL(profileUrl.trim());
  } catch {
    throw new Error("请输入完整的豆瓣个人主页 URL");
  }

  const allowedHosts = new Set([
    "www.douban.com",
    "movie.douban.com",
    "book.douban.com",
    "music.douban.com"
  ]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    throw new Error("仅支持 HTTPS 豆瓣个人主页 URL");
  }

  const match = url.pathname.match(/^\/people\/([^/]+)/);
  const userId = match?.[1] ? decodeURIComponent(match[1]).trim() : "";
  if (!userId || !/^[\w.-]+$/u.test(userId)) {
    throw new Error("无法从 URL 中识别豆瓣用户 ID");
  }
  return userId;
}

export function parseDoubanMediaPage(
  html: string,
  spec: Pick<DoubanPageSpec, "category" | "progress" | "status">
): MediaItem[] {
  if (spec.category === "book") return parseBookItems(html, spec);
  if (spec.category === "game") return parseGameItems(html, spec);
  return parseCommentItems(html, spec);
}

function buildPageSpecs(userId: string): DoubanPageSpec[] {
  const encodedUserId = encodeURIComponent(userId);
  const progressBySlug: Record<DoubanStatusSlug, MediaProgress> = {
    do: "active",
    wish: "wishlist",
    collect: "completed"
  };
  return (Object.entries({ do: "在看", wish: "想看" }) as Array<
    [Exclude<DoubanStatusSlug, "collect">, string]
  >).map(([slug, status]) => ({
      category: "movie" as const,
      progress: progressBySlug[slug],
      slug,
      status,
      url:
        `https://movie.douban.com/people/${encodedUserId}/${slug}` +
        "?start=0&sort=time&rating=all&filter=all&mode=grid"
    }));
}

function parseCommentItems(
  html: string,
  spec: Pick<DoubanPageSpec, "category" | "progress" | "status">
) {
  const blocks = html.match(/<div class="item comment-item"[\s\S]*?<\/div>\s*<\/div>/g) ?? [];
  return blocks.flatMap((block) => {
    const subject = readSubject(block, spec.category);
    if (!subject) return [];
    return [createMediaItem(block, subject, spec)];
  });
}

function parseBookItems(
  html: string,
  spec: Pick<DoubanPageSpec, "category" | "progress" | "status">
) {
  const blocks = html.match(/<li class="subject-item"[\s\S]*?<\/li>/g) ?? [];
  return blocks.flatMap((block) => {
    const subject = readSubject(block, spec.category);
    if (!subject) return [];
    return [createMediaItem(block, subject, spec)];
  });
}

function parseGameItems(
  html: string,
  spec: Pick<DoubanPageSpec, "category" | "progress" | "status">
) {
  const gameList = html.match(/<div class="game-list">([\s\S]*?)<\/div>\s*<script/)?.[1] ?? "";
  const blocks =
    gameList.match(/<(?:li|div)[^>]+class="[^"]*(?:game-item|item)[^"]*"[\s\S]*?<\/(?:li|div)>/g) ??
    [];
  return blocks.flatMap((block) => {
    const subject = readSubject(block, spec.category);
    if (!subject) return [];
    return [createMediaItem(block, subject, spec)];
  });
}

function readSubject(block: string, category: Exclude<MediaCategory, "other">) {
  const domain = category === "game" ? "(?:www\\.)?douban\\.com/game" : `${category}\\.douban\\.com/subject`;
  const hrefMatch = block.match(new RegExp(`href="(https?:\\/\\/${domain}\\/(\\d+)\\/?)"`));
  if (!hrefMatch) return null;
  const title =
    readFirst(block, /<em[^>]*>([\s\S]*?)<\/em>/) ||
    readFirst(block, /<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/) ||
    readFirst(block, /<img[^>]+alt="([^"]+)"/) ||
    readFirst(block, /<a[^>]+title="([^"]+)"/);
  if (!title) return null;

  return {
    id: hrefMatch[2],
    href: hrefMatch[1],
    title
  };
}

function createMediaItem(
  block: string,
  subject: { id: string; href: string; title: string },
  spec: Pick<DoubanPageSpec, "category" | "progress" | "status">
): MediaItem {
  const remoteCover = normalizeImageUrl(readFirst(block, /<img[^>]+src="([^"]+)"/));
  const intro =
    readFirst(block, /<li class="intro">([\s\S]*?)<\/li>/) ||
    readFirst(block, /<div class="pub">([\s\S]*?)<\/div>/) ||
    readFirst(block, /<p class="desc">([\s\S]*?)<\/p>/);
  const ratingMatch = block.match(/class="rating([1-5])-t"/);

  return {
    id: `douban-${spec.category}-${subject.id}`,
    category: spec.category,
    title: subject.title,
    creator: summarizeIntro(intro),
    coverImage: remoteCover ? `/api/douban/image?url=${encodeURIComponent(remoteCover)}` : undefined,
    status: spec.status,
    rating: ratingMatch ? Number(ratingMatch[1]) : undefined,
    note: readFirst(block, /<span class="comment">([\s\S]*?)<\/span>/) || undefined,
    href: subject.href,
    progress: spec.progress,
    markedAt: readFirst(block, /<span class="date">([^<]+)<\/span>/) || undefined,
    source: "douban",
    sourceId: subject.id
  };
}

function readFirst(value: string, pattern: RegExp) {
  const text = value.match(pattern)?.[1] ?? "";
  return decodeHtml(stripTags(text)).trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeImageUrl(value: string) {
  if (value.startsWith("//")) return `https:${value}`;
  return /^https:\/\//.test(value) ? value : "";
}

function summarizeIntro(value: string) {
  if (!value) return undefined;
  const parts = value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
  return parts.join(" · ").slice(0, 120) || undefined;
}
