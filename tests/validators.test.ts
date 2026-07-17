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
});

const now = defaultSiteConfig.updatedAt;
