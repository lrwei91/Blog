import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Block } from "@/types/block";
import type { SiteConfig, SiteLanguage } from "@/types/site-config";
import { getSectionAnchorId, type ContentOrderItem } from "@/lib/utils";
import { ContentArea } from "@/components/site/ContentArea";
import { ProfilePanel } from "@/components/site/ProfilePanel";
import { PublicLanguageSwitcher } from "@/components/site/PublicLanguageSwitcher";
import { PublicSiteEffects } from "@/components/site/PublicSiteEffects";
import { getPublicDesktopContentColumns } from "@/lib/public-content-layout";
import { PublicFloatingTools } from "@/components/site/PublicFloatingTools";
import { getThemeStyleVariables } from "@/constants/theme";

type RenderModel = {
  profile: SiteConfig["profile"];
  topLevelBlocks: Block[];
  orderedContentItems: ContentOrderItem[];
};

type SiteLayoutProps = {
  config: SiteConfig;
  renderModel: RenderModel;
  languageSwitcher?: {
    currentLocale: string;
    languages: SiteLanguage[];
    initialPreparingLocale?: string;
  };
};

export function SiteLayout({ config, renderModel, languageSwitcher }: SiteLayoutProps) {
  const theme = config.theme;
  const desktopContentColumns = getPublicDesktopContentColumns(renderModel.orderedContentItems);
  const desktopPageWidth = "1040px";
  const navItems = renderModel.orderedContentItems
    .filter((item): item is Extract<ContentOrderItem, { type: "text-block" }> => item.type === "text-block")
    .filter((item) => item.block.title.trim());
  const visibleNavItems = navItems;
  const primaryNavItems = visibleNavItems.slice(0, 5);
  const overflowNavItems = visibleNavItems.slice(5);
  const email = renderModel.profile.visibleModules.contact ? renderModel.profile.email : "";

  return (
    <main
      id="top"
      data-color-scheme={theme.colorScheme ?? "system"}
      style={
        {
          ...getThemeStyleVariables(theme),
          "--site-content-max-width": desktopPageWidth,
          "--site-shell-max-width": desktopPageWidth
        } as React.CSSProperties
      }
      className="public-site min-h-[100dvh] text-[var(--site-text)]"
    >
      <PublicSiteEffects enabled={config.settings.enableAnimation} />
      <div className="public-site__wash" aria-hidden="true" />
      <div className="public-nav-sentinel" data-public-nav-sentinel aria-hidden="true" />

      <header className="public-nav" data-public-nav>
        <div className="public-nav__inner">
          <Link href="/" className="public-nav__brand" aria-label="个人主页">
            <span className="public-nav__mark" aria-hidden="true"><img src="/brand-seal.png" alt="" /></span>
            <span className="public-nav__brand-label">个人主页</span>
          </Link>

          {visibleNavItems.length > 0 ? (
            <nav className="public-nav__links" aria-label="页面导航">
              {primaryNavItems.map((item) => (
                <a key={item.id} href={`#${getSectionAnchorId(item.block)}`} data-section-link>
                  {item.block.title.trim()}
                </a>
              ))}
              {overflowNavItems.length > 0 ? (
                <details className="public-nav__more">
                  <summary>更多 <ChevronDown aria-hidden="true" /></summary>
                  <div>
                    {overflowNavItems.map((item) => (
                      <a key={item.id} href={`#${getSectionAnchorId(item.block)}`} data-section-link>
                        {item.block.title.trim()}
                      </a>
                    ))}
                  </div>
                </details>
              ) : null}
            </nav>
          ) : null}

          <div className="public-nav__actions">
            {languageSwitcher ? (
              <PublicLanguageSwitcher
                currentLocale={languageSwitcher.currentLocale}
                languages={languageSwitcher.languages}
                initialPreparingLocale={languageSwitcher.initialPreparingLocale}
                returnPath="/profile"
                className="public-language-switcher"
              />
            ) : null}
            {email ? (
              <a className="public-nav__cta" href={`mailto:${email}`} aria-label={`发送邮件给 ${renderModel.profile.displayName}`}>
                <span>给我写信</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="public-site__shell">
        <ProfilePanel profile={renderModel.profile} />
        <ContentArea
          topLevelBlocks={renderModel.topLevelBlocks}
          orderedContentItems={renderModel.orderedContentItems}
          desktopContentColumns={desktopContentColumns}
          enableImagePreview={config.settings.enableImagePreview}
        />
      </div>

      <footer className="public-footer" data-reveal="footer">
        <div className="public-footer__inner">
          <p className="public-footer__statement">
            把喜欢的事，<br />
            <span>慢慢做成作品。</span>
          </p>
          <div className="public-footer__meta">
            <a href="#top" className="public-nav__brand public-footer__brand" aria-label={`${renderModel.profile.displayName} 首页`}>
              <span className="public-nav__mark" aria-hidden="true"><img src="/brand-seal.png" alt="" /></span>
            </a>
            <p className="public-footer__signature">
              由 <span>{renderModel.profile.username || "lrwei91"}</span> 慢慢维护
            </p>
            <p className="public-footer__copyright">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      <PublicFloatingTools enableShare={config.settings.enablePublicShare} title={config.settings.siteTitle} />
    </main>
  );
}
