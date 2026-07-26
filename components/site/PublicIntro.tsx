import { ArrowRight } from "lucide-react";

export function PublicIntro({
  displayName,
  headline,
  enableMotion
}: {
  displayName: string;
  headline: string;
  enableMotion: boolean;
}) {
  const identity = [displayName.trim(), headline.trim()].filter(Boolean).join(" · ");

  return (
    <section
      className="public-intro"
      data-motion={enableMotion ? "true" : "false"}
      data-continuous-motion
      aria-label="欢迎页"
    >
      <div className="public-intro__glow" aria-hidden="true" />
      <div className="public-intro__ring" aria-hidden="true" />
      <div className="public-intro__inner">
        <header className="public-intro__masthead">
          <span className="public-intro__mark" aria-hidden="true">
            <img src="/brand-seal.png" alt="" />
          </span>
          <span>EST. 2026</span>
        </header>

        <div className="public-intro__welcome">
          <p className="public-intro__statement" aria-label="把复杂的事理清，把喜欢的事做久。">
            <span className="public-intro__line" aria-hidden="true"><span>把复杂的事理清，</span></span>
            <span className="public-intro__line" aria-hidden="true"><span>把喜欢的事做久。</span></span>
          </p>
          {identity ? <p className="public-intro__identity">{identity}</p> : null}
          <p className="public-intro__topics">Testing · AI · Games · Life</p>
          <a href="#profile" className="public-intro__enter">
            <span><b>ENTER</b><small>进入主页</small></span>
            <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <footer className="public-intro__footer">
          <span>PERSONAL ARCHIVE</span>
          <span>FUZHOU · CN</span>
        </footer>
      </div>
    </section>
  );
}
