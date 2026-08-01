import { describe, expect, it } from "vitest";
import { validateSiteConfig } from "@/lib/validators";
import { defaultSiteConfig } from "@/lib/default-site-config";

describe("validateSiteConfig", () => {
  it("accepts the default site config", () => {
    const result = validateSiteConfig(defaultSiteConfig);
    expect(result.success).toBe(true);
  });

  it("applies defaults for missing optional seo fields", () => {
    const minimal = structuredClone(defaultSiteConfig);
    delete (minimal.settings as Record<string, unknown>).seoOgImageAlt;
    const result = validateSiteConfig(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.settings.seoOgImageAlt).toBe("");
    }
  });

  it("rejects a config missing required profile.displayName", () => {
    const bad = structuredClone(defaultSiteConfig) as unknown as Record<string, unknown>;
    (bad.profile as Record<string, unknown>).displayName = "";
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/displayName/);
    }
  });

  it("rejects a config with an invalid version", () => {
    const bad = structuredClone(defaultSiteConfig) as unknown as Record<string, unknown>;
    bad.version = 0;
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
  });

  it("rejects a config whose mainVariantId is not present in variants", () => {
    const bad = structuredClone(defaultSiteConfig);
    bad.settings.variants.mainVariantId = "ghost";
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/Main version must exist in variants/);
    }
  });

  it("reserves the profile route from variant access codes", () => {
    const bad = structuredClone(defaultSiteConfig);
    bad.settings.variants.isEnabled = true;
    bad.settings.variants.variants.push({
      id: "profile-variant",
      name: "Profile variant",
      accessCode: "profile",
      isEnabled: true,
      sortOrder: 2
    });
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/reserved/i);
  });

  it("rejects a config with a block referencing an unknown section", () => {
    const bad = structuredClone(defaultSiteConfig);
    bad.blocks = [
      {
        id: "orphan",
        sectionId: "non-existent",
        title: "Orphan",
        size: "small-square",
        actionType: "none",
        isVisible: true,
        isFeatured: false,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now
      }
    ];
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/Unknown sectionId/);
    }
  });

  it("accepts hidden empty life modules in the default config", () => {
    const result = validateSiteConfig(defaultSiteConfig);
    expect(result.success).toBe(true);
    expect(defaultSiteConfig.blocks.find((block) => block.id === "now-status")?.isVisible).toBe(false);
    expect(defaultSiteConfig.blocks.find((block) => block.id === "media-shelf")?.isVisible).toBe(false);
    expect(defaultSiteConfig.blocks.find((block) => block.id === "photo-stories")?.isVisible).toBe(false);
  });

  it("validates media ratings and safe external URLs", () => {
    const bad = structuredClone(defaultSiteConfig);
    const media = bad.blocks.find((block) => block.id === "media-shelf");
    if (!media) throw new Error("media module missing");
    media.metadata = {
      mediaItems: [{
        id: "media-1",
        category: "movie",
        title: "Example",
        status: "Watching",
        rating: 6,
        href: "javascript:alert(1)"
      }]
    };
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/rating|href/);
    }
  });

  it("validates the Douban media source URL", () => {
    const bad = structuredClone(defaultSiteConfig);
    const media = bad.blocks.find((block) => block.id === "media-shelf");
    if (!media) throw new Error("media module missing");
    media.metadata = {
      ...media.metadata,
      mediaSource: {
        provider: "douban",
        profileUrl: "javascript:alert(1)"
      }
    };
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/mediaSource|profileUrl/);
    }
  });

  it("rejects unsupported Douban auto-sync intervals", () => {
    const bad = structuredClone(defaultSiteConfig);
    const media = bad.blocks.find((block) => block.id === "media-shelf");
    if (!media) throw new Error("media module missing");
    media.metadata = {
      ...media.metadata,
      mediaSource: {
        provider: "douban",
        profileUrl: "https://www.douban.com/people/example/",
        syncIntervalDays: 2
      }
    };
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
  });

  it("requires safe photo URLs and accessible alt text", () => {
    const bad = structuredClone(defaultSiteConfig);
    const photos = bad.blocks.find((block) => block.id === "photo-stories");
    if (!photos) throw new Error("photo module missing");
    photos.metadata = {
      photoStories: [{
        id: "story-1",
        title: "Trip",
        photos: [{ id: "photo-1", url: "data:text/html,bad", alt: "" }]
      }]
    };
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/url|alt/);
    }
  });

  it("requires a safe company logo URL", () => {
    const bad = structuredClone(defaultSiteConfig);
    const experience = bad.blocks.find((block) => block.id === "job-baismgs");
    if (!experience) throw new Error("experience block missing");
    experience.metadata = {
      ...experience.metadata,
      companyLogo: "javascript:alert(1)"
    };
    const result = validateSiteConfig(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/companyLogo/);
    }
  });
});

const now = defaultSiteConfig.updatedAt;
