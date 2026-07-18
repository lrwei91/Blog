"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LOADING_MS = 950;
const EXIT_MS = 560;

type Phase = "loading" | "welcome" | "exit" | "done";

export function PublicIntro({
  displayName,
  tagline
}: {
  displayName: string;
  tagline?: string;
}) {
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
    timersRef.current.push(window.setTimeout(() => setPhase("done"), EXIT_MS + 80));
  };

  if (phase === "done") return null;

  return (
    <div className="public-intro" data-phase={phase} role="dialog" aria-modal="true" aria-label="欢迎页">
      <div className="public-intro__inner">
        <span className="public-intro__seal">
          <img src="/brand-seal.png" alt="" />
        </span>
        <span className="public-intro__progress" aria-hidden="true">
          <i />
        </span>
        <span className="public-intro__label">LOADING · 载入中</span>
        <div className="public-intro__welcome">
          <span className="public-intro__name">{displayName}</span>
          <span className="public-intro__rule" aria-hidden="true" />
          {tagline ? <span className="public-intro__tagline">{tagline}</span> : null}
          <button type="button" className="public-intro__enter" onClick={enter}>
            进入主页
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
