import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { defaultTheme } from "@/constants/theme";
import type { SiteConfig, SiteContentSnapshot } from "@/types/site-config";

const configMocks = vi.hoisted(() => ({
  readConfigFromBlob: vi.fn(),
  readConfigFromLocal: vi.fn()
}));

vi.mock("@/lib/blob-config", () => ({
  BlobConfigError: class BlobConfigError extends Error {},
  readConfigFromBlob: configMocks.readConfigFromBlob
}));

vi.mock("@/lib/local-config", () => ({
  readConfigFromLocal: configMocks.readConfigFromLocal
}));

import { getSiteConfig } from "@/lib/site-config";

const legacyPaperTheme = {
  primaryColor: "#b23c22",
  backgroundColor: "#f6f3ec",
  cardBackground: "#fcfaf5",
  textColor: "#201d18",
  mutedTextColor: "#6f6a5e",
  borderColor: "#ddd6c8",
  cardRadius: "md",
  cardShadow: "none",
  fontFamily: "system"
} as const;

const legacyBlueTheme = {
  primaryColor: "#1677FF",
  backgroundColor: "#FFFFFF",
  cardBackground: "#FFFFFF",
  textColor: "#111111",
  mutedTextColor: "#666666",
  borderColor: "#EAEAEA",
  cardRadius: "2xl",
  cardShadow: "soft",
  fontFamily: "system"
} as const;

function snapshot(config: SiteConfig, theme: SiteContentSnapshot["theme"]): SiteContentSnapshot {
  return {
    profile: structuredClone(config.profile),
    sections: structuredClone(config.sections),
    blocks: structuredClone(config.blocks),
    theme
  };
}

describe("site config theme migration", () => {
  beforeEach(() => {
    configMocks.readConfigFromBlob.mockReset().mockResolvedValue(null);
    configMocks.readConfigFromLocal.mockReset();
  });

  it("normalizes old defaults in the main config and content variants while preserving custom themes", async () => {
    const config = structuredClone(defaultSiteConfig);
    const customTheme = {
      ...defaultTheme,
      primaryColor: "#2563eb",
      backgroundColor: "#f5f7ff"
    };
    config.theme = legacyPaperTheme;
    config.contentVariants = {
      "legacy:zh-CN": snapshot(config, legacyBlueTheme),
      "custom:zh-CN": snapshot(config, customTheme)
    };
    configMocks.readConfigFromLocal.mockResolvedValue(config);

    const normalized = await getSiteConfig("zh-CN");

    expect(normalized.theme).toEqual(defaultTheme);
    expect(normalized.contentVariants?.["legacy:zh-CN"].theme).toEqual(defaultTheme);
    expect(normalized.contentVariants?.["custom:zh-CN"].theme).toEqual(customTheme);
  });
});
