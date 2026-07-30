import { readConfigFromBlob, BlobConfigError } from "@/lib/blob-config";
import { readConfigFromLocal } from "@/lib/local-config";
import { defaultSiteConfig, getDefaultSiteConfig } from "@/lib/default-site-config";
import { restoreMissingPersonalProjectLiveLinks } from "@/lib/personal-projects";
import { normalizeContentFlowConfig } from "@/lib/utils";
import { normalizeThemeConfig } from "@/constants/theme";
import type { SiteConfig } from "@/types/site-config";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Emit a structured error log. In production we log only the error type and
 * message (never the config payload); in development we additionally print the
 * stack trace for easier debugging.
 */
function logConfigError(error: unknown, context: string) {
  const errorType = error instanceof Error ? error.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);

  console.error(
    JSON.stringify({
      level: "error",
      component: "site-config",
      context,
      errorType,
      message,
      timestamp: new Date().toISOString()
    })
  );

  if (!isProduction && error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

export async function getSiteConfig(languageTag?: string | null) {
  // ── Production hard fail: BLOB_READ_WRITE_TOKEN must be present ────────
  if (isProduction && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN in production");
  }

  // ── Attempt Blob first ─────────────────────────────────────────────────
  try {
    const blobConfig = await readConfigFromBlob();
    if (blobConfig) {
      return normalizeSiteConfig(blobConfig);
    }
    // blobConfig === null means the token is absent (dev) or the blob does
    // not exist yet; only the latter is worth logging.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      logConfigError(
        new BlobConfigError(`Blob config not found at "${"config/site-config.json"}", falling back`),
        "readConfigFromBlob"
      );
    }
  } catch (error) {
    // Production: do NOT fall back – surface the error so the Next.js error
    // page renders.
    if (isProduction) {
      throw error;
    }
    // Development: log and continue to the local fallback.
    logConfigError(error, "readConfigFromBlob");
  }

  // ── Local fallback (dev only – production would have thrown above) ─────
  try {
    const localConfig = await readConfigFromLocal();
    if (localConfig) {
      return normalizeSiteConfig(localConfig);
    }
  } catch (error) {
    logConfigError(error, "readConfigFromLocal");
  }

  // ── Final fallback: built-in default config ────────────────────────────
  logConfigError(
    new BlobConfigError("No blob or local config available, using built-in default config"),
    "getDefaultSiteConfig"
  );
  return normalizeSiteConfig(getDefaultSiteConfig(languageTag));
}

function normalizeSiteConfig(config: SiteConfig): SiteConfig {
  const normalizedContentVariants = Object.fromEntries(
    Object.entries(config.contentVariants ?? {}).map(([key, snapshot]) => [
      key,
      {
        ...snapshot,
        profile: normalizeProfile(snapshot.profile),
        blocks: normalizeMediaShelfNames(snapshot.blocks),
        theme: normalizeThemeConfig(snapshot.theme)
      }
    ])
  );
  const normalizedConfig = normalizeContentFlowConfig({
    ...config,
    profile: normalizeProfile(config.profile),
    blocks: normalizeMediaShelfNames(config.blocks),
    theme: normalizeThemeConfig(config.theme),
    settings: {
      ...defaultSiteConfig.settings,
      ...config.settings,
      languages: {
        ...defaultSiteConfig.settings.languages,
        ...config.settings.languages,
        languages: config.settings.languages?.languages?.length
          ? config.settings.languages.languages
          : defaultSiteConfig.settings.languages.languages
      },
      variants: {
        ...defaultSiteConfig.settings.variants,
        ...config.settings.variants,
        variants: config.settings.variants?.variants?.length
          ? config.settings.variants.variants
          : defaultSiteConfig.settings.variants.variants
      }
    },
    contentVariants: normalizedContentVariants
  });

  return restoreMissingPersonalProjectLiveLinks(normalizedConfig, defaultSiteConfig);
}

function normalizeProfile(profile: SiteConfig["profile"]): SiteConfig["profile"] {
  return {
    ...profile,
    socialLinks: profile.socialLinks
      .filter((link) => link.href.trim() !== "https://12345")
      .map((link) => link.actionType === "copy" && link.href.trim() === "https://"
        ? { ...link, href: "" }
        : link)
  };
}

export function normalizeMediaShelfNames(blocks: SiteConfig["blocks"]) {
  return blocks.map((block) => {
    if (block.id !== "text-media" && block.id !== "media-shelf") return block;
    return {
      ...block,
      title: "我的豆瓣片单",
      subtitle: block.id === "text-media" ? "Douban Watchlist" : block.subtitle
    };
  });
}
