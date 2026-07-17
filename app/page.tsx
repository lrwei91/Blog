import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getSiteConfig } from "@/lib/site-config";
import {
  publicLanguageTransitionCookieName,
  publicLocaleCookieName,
  publicVariantCookieName
} from "@/lib/public-variant-cookies";
import { verifyVariantCookie } from "@/lib/variant-auth";
import {
  buildRenderModel,
  getAvailableLanguagesForVariant,
  getMainVariantId,
  getVariantAllowSeoIndex,
  materializeSiteConfig,
  resolvePublicLocale,
  resolvePublicVariantId
} from "@/lib/utils";
import { SiteLayout } from "@/components/site/SiteLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const { baseConfig, config, variantId } = await getPublicSiteContext();
  const siteUrl = config.settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const metadataBase = getMetadataBase(siteUrl);
  const title = config.settings.seoTitle || config.settings.siteTitle;
  const description = config.settings.seoDescription || config.settings.siteDescription;
  const canonicalUrl = config.settings.seoCanonicalUrl || siteUrl;
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
          googleBot: {
            index: true,
            follow: true
          }
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: {
            index: false,
            follow: false
          }
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
      images: [
        {
          url: ogImage,
          width: 1731,
          height: 909,
          alt: config.settings.seoOgImageAlt || `${config.profile.displayName} · ${config.settings.siteTitle}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function HomePage() {
  const { baseConfig, config, variantId, locale, initialPreparingLocale } = await getPublicSiteContext();
  const model = buildRenderModel(config);
  return (
    <SiteLayout
      config={config}
      renderModel={model}
      languageSwitcher={{
        currentLocale: locale,
        languages: getAvailableLanguagesForVariant(baseConfig, variantId),
        initialPreparingLocale
      }}
    />
  );
}

async function getPublicSiteContext() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const config = await getSiteConfig(requestHeaders.get("accept-language"));
  // 2026-07-17 P0: variantId 只从已签名的 Cookie 中提取，不再信任明文 Cookie
  const verified = verifyVariantCookie(cookieStore.get(publicVariantCookieName)?.value);
  const variantId = verified
    ? resolvePublicVariantId(config, verified.variantId)
    : getMainVariantId(config);
  const locale = resolvePublicLocale(config, cookieStore.get(publicLocaleCookieName)?.value, requestHeaders.get("accept-language"), variantId);
  const transitionLocale = cookieStore.get(publicLanguageTransitionCookieName)?.value;
  const initialPreparingLocale = transitionLocale?.toLowerCase() === locale.toLowerCase() ? locale : undefined;
  return { baseConfig: config, config: materializeSiteConfig(config, variantId, locale), variantId, locale, initialPreparingLocale };
}

function getMetadataBase(siteUrl: string) {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  }
}
