import { describe, expect, it } from "vitest";
import { defaultTheme, getThemeStyleVariables, normalizeThemeConfig } from "@/constants/theme";

describe("theme mapping", () => {
  it("maps every persisted appearance option to a runtime CSS variable", () => {
    expect(getThemeStyleVariables({
      ...defaultTheme,
      cardRadius: "xl",
      cardShadow: "medium",
      fontFamily: "mono"
    })).toMatchObject({
      "--site-bg": defaultTheme.backgroundColor,
      "--site-muted": defaultTheme.mutedTextColor,
      "--site-radius-card": "12px",
      "--site-shadow-card": expect.stringContaining("0 22px"),
      "--site-font-family": expect.stringContaining("--font-label")
    });
  });

  it("migrates the historical paper-ink theme to the current theme", () => {
    expect(normalizeThemeConfig({
      primaryColor: "#B23C22",
      backgroundColor: "#F6F3EC",
      cardBackground: "#FCFAF5",
      textColor: "#201D18",
      mutedTextColor: "#6F6A5E",
      borderColor: "#DDD6C8",
      cardRadius: "md",
      cardShadow: "none",
      fontFamily: "system"
    })).toEqual(defaultTheme);
  });

  it("migrates the historical blue starter theme to the current theme", () => {
    expect(normalizeThemeConfig({
      primaryColor: "#1677FF",
      backgroundColor: "#FFFFFF",
      cardBackground: "#FFFFFF",
      textColor: "#111111",
      mutedTextColor: "#666666",
      borderColor: "#EAEAEA",
      cardRadius: "2xl",
      cardShadow: "soft",
      fontFamily: "system"
    })).toEqual(defaultTheme);
  });

  it("migrates the previous precision default to the Swiss technical theme", () => {
    expect(normalizeThemeConfig({
      primaryColor: "#e45435",
      backgroundColor: "#fafafa",
      cardBackground: "#ffffff",
      textColor: "#111113",
      mutedTextColor: "#6e6e73",
      borderColor: "#e8e8ea",
      cardRadius: "xl",
      cardShadow: "soft",
      fontFamily: "system",
      colorScheme: "light"
    })).toEqual(defaultTheme);
  });

  it("preserves intentional custom themes", () => {
    const customTheme = { ...defaultTheme, primaryColor: "#315c7a" };
    expect(normalizeThemeConfig(customTheme)).toBe(customTheme);
  });
});
