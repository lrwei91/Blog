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

  it("migrates the historical blue starter theme to the adopted paper-ink theme", () => {
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

  it("preserves intentional custom themes", () => {
    const customTheme = { ...defaultTheme, primaryColor: "#315c7a" };
    expect(normalizeThemeConfig(customTheme)).toBe(customTheme);
  });
});
