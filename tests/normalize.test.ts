import { describe, expect, it } from "vitest";
import {
  getMainLocale,
  getMainVariantId,
  getVariantAllowSeoIndex,
  buildRenderModel,
  normalizeContentFlowConfig
} from "@/lib/utils";
import { defaultSiteConfig } from "@/lib/default-site-config";

describe("normalizeContentFlowConfig", () => {
  it("preserves profile and settings while collapsing sections into blocks", () => {
    const config = structuredClone(defaultSiteConfig);
    const normalized = normalizeContentFlowConfig(config);

    expect(normalized.profile).toEqual(config.profile);
    expect(normalized.settings.siteTitle).toBe(config.settings.siteTitle);
    expect(normalized.sections).toEqual([]);
    expect(normalized.blocks.length).toBeGreaterThanOrEqual(config.blocks.length);
  });

  it("normalizes block sortOrder to 1-based sequential integers", () => {
    const config = structuredClone(defaultSiteConfig);
    config.blocks[0].sortOrder = 42;
    const normalized = normalizeContentFlowConfig(config);

    normalized.blocks.forEach((block, index) => {
      expect(block.sortOrder).toBe(index + 1);
    });
  });

  it("clears topLevelBlocksSortOrder", () => {
    const config = structuredClone(defaultSiteConfig);
    config.settings.topLevelBlocksSortOrder = 5;
    const normalized = normalizeContentFlowConfig(config);
    expect(normalized.settings.topLevelBlocksSortOrder).toBeUndefined();
  });
});

describe("buildRenderModel life modules", () => {
  it("keeps hidden life modules out of public content and navigation headings", () => {
    const model = buildRenderModel(defaultSiteConfig);
    const ids = model.orderedContentItems.map((item) => item.id);
    expect(ids).not.toContain("text-now");
    expect(ids).not.toContain("text-media");
    expect(ids).not.toContain("text-photos");
  });

  it("groups a visible life module directly after its heading", () => {
    const config = structuredClone(defaultSiteConfig);
    for (const block of config.blocks) {
      if (block.id === "text-now" || block.id === "now-status") block.isVisible = true;
    }
    const model = buildRenderModel(config);
    const headingIndex = model.orderedContentItems.findIndex((item) => item.id === "text-now");
    expect(headingIndex).toBeGreaterThanOrEqual(0);
    const content = model.orderedContentItems[headingIndex + 1];
    expect(content?.type).toBe("top-level-blocks");
    if (content?.type === "top-level-blocks") {
      expect(content.blocks.map((block) => block.id)).toContain("now-status");
    }
  });
});

describe("getMainVariantId / getMainLocale / getVariantAllowSeoIndex", () => {
  it("returns the configured main variant and locale", () => {
    expect(getMainVariantId(defaultSiteConfig)).toBe(
      defaultSiteConfig.settings.variants.mainVariantId
    );
    expect(getMainLocale(defaultSiteConfig)).toBe(
      defaultSiteConfig.settings.languages.mainLocale
    );
  });

  it("falls back to true for the main variant when allowSeoIndex is unset", () => {
    const config = structuredClone(defaultSiteConfig);
    const variant = config.settings.variants.variants.find(
      (item) => item.id === config.settings.variants.mainVariantId
    );
    if (variant) delete variant.allowSeoIndex;
    expect(getVariantAllowSeoIndex(config, config.settings.variants.mainVariantId)).toBe(true);
  });

  it("respects an explicit allowSeoIndex=false on a non-main variant", () => {
    const config = structuredClone(defaultSiteConfig);
    config.settings.variants.isEnabled = true;
    config.settings.variants.variants.push({
      id: "hidden",
      name: "Hidden",
      accessCode: "hidden",
      isEnabled: true,
      allowSeoIndex: false,
      sortOrder: 2
    });
    expect(getVariantAllowSeoIndex(config, "hidden")).toBe(false);
  });
});
