import type { Metadata } from "next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { buildPublicMetadata, getPublicSiteContext } from "@/lib/public-site-context";
import { buildRenderModel } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata("profile");
}

export default async function ProfilePage() {
  const { config, locale, initialPreparingLocale, languages } = await getPublicSiteContext();

  return (
    <SiteLayout
      config={config}
      renderModel={buildRenderModel(config)}
      languageSwitcher={{
        currentLocale: locale,
        languages,
        initialPreparingLocale
      }}
    />
  );
}
