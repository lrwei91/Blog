import type { SiteConfig } from "@/types/site-config";
import { topLevelBlockSectionId } from "@/lib/utils";

const now = "2026-07-03T00:00:00.000Z";

export const defaultSiteConfig: SiteConfig = {
  version: 1,
  profile: {
    avatarUrl: "/default-avatar.svg",
    displayName: "Your Name",
    username: "",
    headline: "Builder / Designer / Writer",
    bio: "A short introduction about who you are, what you build, and where people can find your work.",
    location: "Your city",
    tags: ["Portfolio", "Projects", "Writing", "Links"],
    email: "",
    socialLinks: [
      {
        id: "github",
        label: "GitHub",
        icon: "github",
        href: "https://github.com/your-handle",
        isVisible: true,
        sortOrder: 1
      },
      {
        id: "x",
        label: "X",
        icon: "twitter",
        href: "https://x.com/",
        isVisible: true,
        sortOrder: 2
      }
    ],
    moduleOrder: [
      "avatar",
      "name",
      "headline",
      "bio",
      "tags",
      "location",
      "socialLinks",
      "contact"
    ],
    visibleModules: {
      avatar: true,
      name: true,
      headline: true,
      bio: true,
      tags: true,
      location: true,
      socialLinks: true,
      contact: true,
      latestPosts: false
    }
  },
  sections: [],
  blocks: [
    {
      id: "text-doing",
      sectionId: topLevelBlockSectionId,
      title: "Featured work",
      subtitle: "Projects, products, and experiments you want people to notice first.",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "build",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "doing",
        titleAlign: "left",
        titleSize: "md"
      },
      sortOrder: 1,
      isVisible: true,
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "flagship-project",
      sectionId: topLevelBlockSectionId,
      title: "Flagship project",
      subtitle: "A product or case study",
      description: "Use this block for your main app, startup, portfolio case, or open-source project.",
      size: "large-square",
      coverImage: "",
      icon: "chef-hat",
      badge: "Featured",
      href: "https://example.com",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "",
      textColor: "",
      metadata: {},
      isVisible: true,
      isFeatured: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "health-trip",
      sectionId: topLevelBlockSectionId,
      title: "Side project",
      subtitle: "An experiment or prototype",
      description: "Use this card for a smaller project, design exploration, or work in progress.",
      size: "large-square",
      coverImage: "",
      icon: "map",
      badge: "WIP",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "text-daily",
      sectionId: topLevelBlockSectionId,
      title: "Notes",
      subtitle: "Short updates, writing, and personal highlights.",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "sparkle",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "daily",
        titleAlign: "left",
        titleSize: "md"
      },
      isVisible: true,
      isFeatured: false,
      sortOrder: 4,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "daily-note",
      sectionId: topLevelBlockSectionId,
      title: "Latest note",
      subtitle: "What are you working on right now?",
      description: "Share a short update, announcement, or personal note.",
      size: "wide",
      coverImage: "",
      icon: "activity",
      badge: "MVP",
      href: "",
      actionType: "modal",
      openInNewTab: false,
      backgroundColor: "#F8FAFC",
      textColor: "",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 5,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "text-social",
      sectionId: topLevelBlockSectionId,
      title: "Social",
      subtitle: "",
      description: "",
      size: "section-text",
      responsiveSizes: {
        desktop: "section-text",
        mobile: "section-text"
      },
      coverImage: "",
      icon: "link",
      badge: "",
      href: "",
      actionType: "none",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        sourceSectionId: "social",
        titleAlign: "left",
        titleSize: "md"
      },
      isVisible: true,
      isFeatured: false,
      sortOrder: 6,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "github",
      sectionId: topLevelBlockSectionId,
      title: "GitHub",
      subtitle: "",
      description: "",
      size: "small-square",
      coverImage: "",
      icon: "github",
      badge: "",
      href: "https://github.com/your-handle",
      actionType: "link",
      openInNewTab: true,
      backgroundColor: "",
      textColor: "",
      metadata: {},
      isVisible: true,
      isFeatured: false,
      sortOrder: 7,
      createdAt: now,
      updatedAt: now
    }
  ],
  theme: {
    primaryColor: "#1677FF",
    backgroundColor: "#FFFFFF",
    cardBackground: "#FFFFFF",
    textColor: "#111111",
    mutedTextColor: "#666666",
    borderColor: "#EAEAEA",
    cardRadius: "2xl",
    cardShadow: "soft",
    fontFamily: "system"
  },
  settings: {
    projectName: "Bio Template Editor",
    siteTitle: "Personal Site Studio",
    siteDescription: "A visual personal homepage template with an editable admin.",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    seoTitle: "",
    seoDescription: "",
    seoCanonicalUrl: "",
    seoOgImage: "",
    enableImagePreview: true,
    enableAnimation: true,
    enablePublicShare: true,
    languages: {
      isEnabled: false,
      mainLocale: "en",
      languages: [
        { code: "en", label: "English", isEnabled: true, sortOrder: 1 }
      ]
    },
    variants: {
      isEnabled: false,
      mainVariantId: "main",
      variants: [
        {
          id: "main",
          name: "Main version",
          accessCode: "",
          isEnabled: true,
          allowSeoIndex: true,
          sortOrder: 1,
          mainLocale: "en",
          languages: [{ code: "en", label: "English", isEnabled: true, sortOrder: 1 }],
          languageSettings: { en: { isEnabled: true } }
        }
      ]
    }
  },
  contentVariants: {},
  updatedAt: now
};

export function getDefaultSiteConfig(languageTag?: string | null): SiteConfig {
  const config = structuredClone(defaultSiteConfig);
  if (!languageTag?.toLowerCase().startsWith("zh")) return config;

  config.profile = {
    ...config.profile,
    displayName: "你的名字",
    headline: "创作者 / 设计师 / 写作者",
    bio: "用一小段文字介绍你是谁、你在做什么，以及大家在哪里可以找到你。",
    location: "你的城市",
    tags: ["作品集", "项目", "写作", "链接"],
    socialLinks: config.profile.socialLinks.map((link) => link.id === "x" ? { ...link, label: "X" } : link)
  };
  config.blocks = config.blocks.map((block) => {
    const translated: Record<string, Partial<typeof block>> = {
      "text-doing": { title: "精选作品", subtitle: "把你最希望大家先看到的项目、产品和实验放在这里。" },
      "flagship-project": { title: "代表项目", subtitle: "一个产品或案例研究", description: "用这个区块展示你的主力应用、创业项目、作品集案例或开源项目。", badge: "精选" },
      "health-trip": { title: "个人项目", subtitle: "一个实验或原型", description: "用这个卡片展示较小的项目、设计探索或进行中的作品。", badge: "进行中" },
      "text-daily": { title: "随笔", subtitle: "短动态、写作和个人亮点。" },
      "daily-note": { title: "最新动态", subtitle: "你最近在做什么？", description: "分享一条简短的动态、公告或个人近况。", badge: "MVP" },
      "text-social": { title: "社交链接" }
    };
    return { ...block, ...(translated[block.id] ?? {}) };
  });
  config.settings = {
    ...config.settings,
    projectName: "个人主页编辑器",
    siteTitle: "个人主页工作室",
    siteDescription: "一个带可视化编辑器的个人主页模板。",
    languages: {
      isEnabled: false,
      mainLocale: "zh-CN",
      languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }]
    },
    variants: {
      isEnabled: false,
      mainVariantId: "main",
      variants: [{
        id: "main",
        name: "主版本",
        accessCode: "",
        isEnabled: true,
        allowSeoIndex: true,
        sortOrder: 1,
        mainLocale: "zh-CN",
        languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }],
        languageSettings: { "zh-CN": { isEnabled: true } }
      }]
    }
  };
  return config;
}
