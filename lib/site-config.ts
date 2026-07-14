import { readConfigFromBlob } from "@/lib/blob-config";
import { defaultSiteConfig, getDefaultSiteConfig } from "@/lib/default-site-config";
import { normalizeContentFlowConfig } from "@/lib/utils";
import type { SiteConfig } from "@/types/site-config";

export async function getSiteConfig(languageTag?: string | null) {
  const blobConfig = await readConfigFromBlob();
  return normalizeSiteConfig(blobConfig ?? getDefaultSiteConfig(languageTag));
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
