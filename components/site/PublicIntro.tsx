import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PublicIntro({
  displayName,
  headline,
  enableMotion,
  introImageUrl
}: {
  displayName: string;
  headline: string;
  enableMotion: boolean;
  introImageUrl?: string;
}) {
  const resolvedName = displayName.trim();
  const resolvedHeadline = headline.trim();
  const heroImage = introImageUrl?.trim() || "/images/hero/qa-workbench-v2.webp";

  return (
    <section
      className="public-intro"
      data-motion={enableMotion ? "true" : "false"}
      aria-label="欢迎页"
    >
      <div className="public-intro__inner">
        <header className="public-intro__masthead">
          <span className="public-intro__mark" aria-hidden="true">
            <img src="/brand-seal.png" alt="" />
          </span>
        </header>

        <div className="public-intro__layout">
          <div className="public-intro__welcome">
            <h1 className="public-intro__statement">
              <span className="public-intro__line"><span>把复杂的事理清，</span></span>
              <span className="public-intro__line"><span>把喜欢的事做久。</span></span>
            </h1>
            {resolvedName || resolvedHeadline ? (
              <p className="public-intro__identity">
                {resolvedName ? <strong>{resolvedName}</strong> : null}
                {resolvedHeadline ? <span>{resolvedHeadline}</span> : null}
              </p>
            ) : null}
            <Link href="/profile" className="public-intro__enter">
              <span>进来逛逛</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <figure className="public-intro__visual">
            <img
              className="public-intro__visual-image"
              src={heroImage}
              alt="键盘、游戏手柄、笔记本与测试卡片组成的工作台"
              width={1200}
              height={1500}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
