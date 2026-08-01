import type { ThemeConfig } from "@/types/theme";

export const defaultTheme: ThemeConfig = {
  primaryColor: "#e45435",
  backgroundColor: "#f4f5f6",
  cardBackground: "#f9fafb",
  textColor: "#16181d",
  mutedTextColor: "#59616a",
  borderColor: "#d8dde2",
  cardRadius: "lg",
  cardShadow: "none",
  fontFamily: "system",
  colorScheme: "system"
};

const legacyPrecisionTheme: ThemeConfig = {
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
};

const legacyPaperInkTheme: ThemeConfig = {
  primaryColor: "#b23c22",
  backgroundColor: "#f6f3ec",
  cardBackground: "#fcfaf5",
  textColor: "#201d18",
  mutedTextColor: "#6f6a5e",
  borderColor: "#ddd6c8",
  cardRadius: "md",
  cardShadow: "none",
  fontFamily: "system"
};

const legacyBlueTheme: ThemeConfig = {
  primaryColor: "#1677FF",
  backgroundColor: "#FFFFFF",
  cardBackground: "#FFFFFF",
  textColor: "#111111",
  mutedTextColor: "#666666",
  borderColor: "#EAEAEA",
  cardRadius: "2xl",
  cardShadow: "soft",
  fontFamily: "system"
};

const radiusByTheme: Record<ThemeConfig["cardRadius"], string> = {
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px"
};

const shadowByTheme: Record<ThemeConfig["cardShadow"], string> = {
  none: "none",
  soft: "0 1px 2px color-mix(in srgb, var(--site-text) 5%, transparent), 0 12px 30px -26px color-mix(in srgb, var(--site-text) 22%, transparent)",
  medium: "0 22px 54px -28px color-mix(in srgb, var(--site-text) 46%, transparent)"
};

const fontByTheme: Record<ThemeConfig["fontFamily"], string> = {
  system: 'var(--font-display), "PingFang SC", "Microsoft YaHei", sans-serif',
  rounded: '"Nunito Sans", "Arial Rounded MT Bold", "PingFang SC", sans-serif',
  mono: 'var(--font-label), "SFMono-Regular", Consolas, monospace'
};

export function getThemeStyleVariables(theme: ThemeConfig) {
  return {
    "--site-bg": theme.backgroundColor,
    "--site-card": theme.cardBackground,
    "--site-text": theme.textColor,
    "--site-muted": theme.mutedTextColor,
    "--site-border": theme.borderColor,
    "--site-primary": theme.primaryColor,
    "--site-radius-card": radiusByTheme[theme.cardRadius],
    "--site-shadow-card": shadowByTheme[theme.cardShadow],
    "--site-font-family": fontByTheme[theme.fontFamily]
  };
}

export function normalizeThemeConfig(theme: ThemeConfig): ThemeConfig {
  const matchesTheme = (candidate: ThemeConfig) => Object.entries(candidate).every(
    ([key, value]) => (theme[key as keyof ThemeConfig] ?? "").toLowerCase() === value.toLowerCase()
  );

  return matchesTheme(legacyPaperInkTheme) || matchesTheme(legacyBlueTheme) || matchesTheme(legacyPrecisionTheme)
    ? { ...defaultTheme }
    : theme;
}
