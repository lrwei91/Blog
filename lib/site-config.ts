import { readConfigFromBlob, BlobConfigError } from "@/lib/blob-config";
import { readConfigFromLocal } from "@/lib/local-config";
import { defaultSiteConfig, getDefaultSiteConfig } from "@/lib/default-site-config";
import { normalizeContentFlowConfig } from "@/lib/utils";
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
  return normalizeContentFlowConfig({
    ...config,
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
    contentVariants: config.contentVariants ?? {}
  });
}
