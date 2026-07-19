"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LOADING_MS = 950;
const EXIT_MS = 640;

type Phase = "loading" | "welcome" | "exit" | "done";

export function PublicIntro() {
  const [phase, setPhase] = useState<Phase>("loading");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      const frame = window.requestAnimationFrame(() => setPhase("done"));
      return () => window.cancelAnimationFrame(frame);
    }

    root.classList.add("public-intro-active");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const clearTimers = () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };

    timersRef.current.push(window.setTimeout(() => setPhase("welcome"), LOADING_MS));

    return () => {
      clearTimers();
      root.classList.remove("public-intro-active");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const enter = () => {
    const root = document.documentElement;
    // Let the page fade up beneath the lifting curtain.
    root.classList.remove("public-intro-active");
    document.body.style.overflow = "";
    setPhase("exit");
    timersRef.current.push(window.setTimeout(() => setPhase("done"), EXIT_MS + 120));
  };

  if (phase === "done") return null;

  return (
    <div className="public-intro" data-phase={phase} role="dialog" aria-modal="true" aria-label="欢迎页">
      <div className="public-intro__glow" aria-hidden="true" />
      <div className="public-intro__ring" aria-hidden="true" />
      <div className="public-intro__inner">
        <header className="public-intro__masthead">
          <span className="public-intro__mark" aria-hidden="true">
            <img src="/brand-seal.png" alt="" />
          </span>
          <span>EST. 2026</span>
        </header>

        <div className="public-intro__loading" aria-hidden="true">
          <span className="public-intro__progress"><i /></span>
          <span className="public-intro__label">OPENING THE ARCHIVE</span>
        </div>

        <div className="public-intro__welcome">
          <h1 className="public-intro__statement">
            <span className="public-intro__line"><span>把复杂的事理清，</span></span>
            <span className="public-intro__line"><span>把喜欢的事做久。</span></span>
          </h1>
          <p className="public-intro__topics">Testing · AI · Games · Life</p>
          <button type="button" className="public-intro__enter" onClick={enter}>
            <span><b>ENTER</b><small>进入</small></span>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <footer className="public-intro__footer">
          <span>PERSONAL ARCHIVE</span>
          <span>FUZHOU · CN</span>
        </footer>
      </div>
    </div>
  );
}
