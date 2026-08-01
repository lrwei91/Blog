import "server-only";

import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { buildFullModuleTestConfig } from "@/lib/full-module-test-config";
import { getSiteConfig } from "@/lib/site-config";
import {
  publicLanguageTransitionCookieName,
  publicLocaleCookieName,
  publicVariantCookieName
} from "@/lib/public-variant-cookies";
import { verifyVariantCookie } from "@/lib/variant-auth";
import {
  getAvailableLanguagesForVariant,
  getMainVariantId,
  getVariantAllowSeoIndex,
  materializeSiteConfig,
  resolvePublicLocale,
  resolvePublicVariantId
} from "@/lib/utils";

export async function getPublicSiteContext() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const storedConfig = await getSiteConfig(requestHeaders.get("accept-language"));
  const baseConfig = process.env.NODE_ENV !== "production" && process.env.BIO_E2E_FULL_MODULES === "1"
    ? buildFullModuleTestConfig(storedConfig)
    : storedConfig;
  const verified = verifyVariantCookie(cookieStore.get(publicVariantCookieName)?.value);
  const variantId = verified
    ? resolvePublicVariantId(baseConfig, verified.variantId)
    : getMainVariantId(baseConfig);
  const locale = resolvePublicLocale(
    baseConfig,
    cookieStore.get(publicLocaleCookieName)?.value,
    requestHeaders.get("accept-language"),
    variantId
  );
  const transitionLocale = cookieStore.get(publicLanguageTransitionCookieName)?.value;
  const initialPreparingLocale = transitionLocale?.toLowerCase() === locale.toLowerCase() ? locale : undefined;

  return {
    baseConfig,
    config: materializeSiteConfig(baseConfig, variantId, locale),
    variantId,
    locale,
    initialPreparingLocale,
    languages: getAvailableLanguagesForVariant(baseConfig, variantId)
  };
}

export async function buildPublicMetadata(page: "welcome" | "profile"): Promise<Metadata> {
  const { baseConfig, config, variantId } = await getPublicSiteContext();
  const siteUrl = config.settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const metadataBase = getMetadataBase(siteUrl);
  const rootCanonical = config.settings.seoCanonicalUrl || siteUrl;
  const canonicalUrl = page === "profile"
    ? new URL("/profile", new URL(rootCanonical, metadataBase)).toString()
    : rootCanonical;
  const siteTitle = config.settings.siteTitle || config.profile.displayName;
  const title = page === "profile"
    ? `${config.profile.displayName}的主页 | ${siteTitle}`
    : siteTitle;
  const description = page === "profile"
    ? config.settings.seoDescription || config.settings.siteDescription
    : config.settings.siteDescription || config.settings.seoDescription;
  const ogImage = config.settings.seoOgImage || "/og.png";
  const shouldIndex = getVariantAllowSeoIndex(baseConfig, variantId);

  return {
    metadataBase,
    title,
    description,
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true }
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: { index: false, follow: false }
        },
    alternates: {
      canonical: canonicalUrl,
      languages: config.settings.languages.isEnabled
        ? { "zh-CN": canonicalUrl, en: canonicalUrl }
        : undefined
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{
        url: ogImage,
        width: 1731,
        height: 909,
        alt: config.settings.seoOgImageAlt || `${config.profile.displayName} · ${siteTitle}`
      }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

function getMetadataBase(siteUrl: string) {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  }
}
