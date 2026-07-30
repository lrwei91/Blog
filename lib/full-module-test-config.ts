import type { SiteConfig } from "@/types/site-config";

const fullModuleIds = new Set([
  "text-now",
  "now-status",
  "text-media",
  "media-shelf",
  "text-photos",
  "photo-stories"
]);

const fallbackMediaItems = [
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `e2e-active-${index + 1}`,
    category: "movie",
    title: `在看片单 ${String(index + 1).padStart(2, "0")}`,
    creator: "完整模块视觉测试",
    coverImage: "/og.png",
    status: "在看",
    progress: "active",
    markedAt: `2026-07-${String(31 - index).padStart(2, "0")}`,
    source: "douban"
  })),
  ...Array.from({ length: 9 }, (_, index) => ({
    id: `e2e-wishlist-${index + 1}`,
    category: "movie",
    title: `想看片单 ${String(index + 1).padStart(2, "0")}`,
    creator: "完整模块视觉测试",
    coverImage: "/og.png",
    status: "想看",
    progress: "wishlist",
    markedAt: `2026-06-${String(30 - index).padStart(2, "0")}`,
    source: "douban"
  }))
];

export function buildFullModuleTestConfig(config: SiteConfig): SiteConfig {
  const result = structuredClone(config);
  result.settings.enableAnimation = true;
  result.blocks = result.blocks.map((block) => {
    if (!fullModuleIds.has(block.id)) return block;

    if (block.id === "now-status") {
      return {
        ...block,
        isVisible: true,
        metadata: {
          ...block.metadata,
          nowStatus: {
            headline: "正在把复杂的体验，整理成稳定的质量。",
            body: "近期专注自动化测试、AI QA 工作流与个人项目的持续迭代。",
            mood: "专注",
            location: "福州",
            tags: ["测试", "自动化", "AI QA"],
            updatedAt: "2026-07-31"
          }
        }
      };
    }

    if (block.id === "media-shelf") {
      const mediaItems = Array.isArray(block.metadata?.mediaItems) && block.metadata.mediaItems.length > 0
        ? block.metadata.mediaItems
        : fallbackMediaItems;
      return {
        ...block,
        isVisible: true,
        metadata: {
          ...block.metadata,
          mediaItems,
          mediaSource: {
            provider: "douban",
            profileUrl: "https://www.douban.com/people/e2e-preview/",
            syncIntervalDays: 1,
            lastSyncedAt: "2026-07-31T12:00:00.000Z",
            totalItems: mediaItems.length
          }
        }
      };
    }

    if (block.id === "photo-stories") {
      const photoStories = Array.isArray(block.metadata?.photoStories) && block.metadata.photoStories.length > 0
        ? block.metadata.photoStories
        : [
            {
              id: "e2e-story-1",
              title: "城市与山海之间",
              date: "2026-07",
              location: "福建",
              summary: "用于完整模块布局、卡片与灯箱交互的视觉测试内容。",
              photos: [{ id: "e2e-photo-1", url: "/og.png", alt: "完整模块视觉测试图片" }]
            },
            {
              id: "e2e-story-2",
              title: "路上的片段",
              date: "2026-06",
              location: "中国",
              summary: "验证照片故事在桌面与移动视口下的完整展示。",
              photos: [{ id: "e2e-photo-2", url: "/default-avatar.svg", alt: "完整模块视觉测试头像" }]
            }
          ];
      return {
        ...block,
        isVisible: true,
        metadata: { ...block.metadata, photoStories }
      };
    }

    return { ...block, isVisible: true };
  });
  return result;
}
