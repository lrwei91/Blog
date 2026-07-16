import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { Block } from "@/types/block";
import type { SiteConfig, SiteLanguage } from "@/types/site-config";
import { getSectionAnchorId, type ContentOrderItem } from "@/lib/utils";
import { ContentArea } from "@/components/site/ContentArea";
import { ProfilePanel } from "@/components/site/ProfilePanel";
import { PublicLanguageSwitcher } from "@/components/site/PublicLanguageSwitcher";
import { PublicSiteEffects } from "@/components/site/PublicSiteEffects";
import { getPublicDesktopContentColumns, getPublicDesktopContentWidth } from "@/lib/public-content-layout";

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
    accessCode: string;
    initialPreparingLocale?: string;
  };
};

export function SiteLayout({ config, renderModel, languageSwitcher }: SiteLayoutProps) {
  const theme = config.theme;
  const desktopContentColumns = getPublicDesktopContentColumns(renderModel.orderedContentItems);
  const desktopContentWidth = getPublicDesktopContentWidth(desktopContentColumns);
  const navItems = renderModel.orderedContentItems
    .filter((item): item is Extract<ContentOrderItem, { type: "text-block" }> => item.type === "text-block")
    .slice(0, 4);
  const email = renderModel.profile.visibleModules.contact ? renderModel.profile.email : "";

  return (
    <main
      id="top"
      style={
        {
          "--site-bg": theme.backgroundColor,
          "--site-card": theme.cardBackground,
          "--site-text": theme.textColor,
          "--site-muted": theme.mutedTextColor,
          "--site-border": theme.borderColor,
          "--site-primary": theme.primaryColor,
          "--site-content-max-width": desktopContentWidth,
          "--site-shell-max-width": `max(960px, ${desktopContentWidth})`
        } as React.CSSProperties
      }
      className="public-site min-h-screen text-[var(--site-text)]"
    >
      <PublicSiteEffects enabled={config.settings.enableAnimation} />
      <div className="public-site__wash" aria-hidden="true" />

      <header className="public-nav" data-public-nav>
        <div className="public-nav__inner">
          <a href="#top" className="public-nav__brand" aria-label={`${renderModel.profile.displayName} 首页`}>
            <span className="public-nav__mark"><i /><i /><i /></span>
            <span className="public-nav__brand-label">个人主页</span>
          </a>

          {navItems.length > 0 ? (
            <nav className="public-nav__links" aria-label="页面导航">
              {navItems.map((item) => (
                <a key={item.id} href={`#${getSectionAnchorId(item.block)}`}>{item.block.title.trim()}</a>
              ))}
            </nav>
          ) : null}

          <div className="public-nav__actions">
            {languageSwitcher ? (
              <PublicLanguageSwitcher
                currentLocale={languageSwitcher.currentLocale}
                languages={languageSwitcher.languages}
                accessCode={languageSwitcher.accessCode}
                initialPreparingLocale={languageSwitcher.initialPreparingLocale}
                className="public-language-switcher"
              />
            ) : null}
            {email ? (
              <a className="public-nav__cta" href={`mailto:${email}`}>
                <span>联系我</span>
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
        />
      </div>

      <footer className="public-footer" data-reveal>
        <div className="public-footer__inner">
          <p className="public-footer__statement">
            把喜欢的事，<br />
            <span>慢慢做成作品。</span>
          </p>
          <div className="public-footer__meta">
            <a href="#top" className="public-nav__brand public-footer__brand" aria-label={`${renderModel.profile.displayName} 首页`}>
              <span className="public-nav__mark"><i /><i /><i /></span>
            </a>
            <p className="public-footer__signature">
              {"// Designed by "}<span>{renderModel.profile.username || "lrwei91"}</span>
            </p>
            <p className="public-footer__copyright">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>

      <a className="public-back-to-top" href="#top" data-back-to-top aria-label="返回顶部">
        <ArrowUp aria-hidden="true" />
        <span>TOP</span>
      </a>
    </main>
  );
}
