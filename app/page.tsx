import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PublicIntro } from "@/components/site/PublicIntro";
import { PublicSiteEffects } from "@/components/site/PublicSiteEffects";
import { getThemeStyleVariables } from "@/constants/theme";
import { buildPublicMetadata, getPublicSiteContext } from "@/lib/public-site-context";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata("welcome");
}

export default async function HomePage() {
  const { config } = await getPublicSiteContext();

  return (
    <main
      id="top"
      data-color-scheme={config.theme.colorScheme ?? "system"}
      style={getThemeStyleVariables(config.theme) as CSSProperties}
      className="public-site public-site--welcome min-h-[100dvh] text-[var(--site-text)]"
    >
      <PublicSiteEffects enabled={config.settings.enableAnimation} />
      <div className="public-site__wash" aria-hidden="true" />
      <PublicIntro
        displayName={config.profile.displayName}
        headline={config.profile.headline}
        enableMotion={config.settings.enableAnimation}
        introImageUrl={config.settings.introImage}
      />
    </main>
  );
}
