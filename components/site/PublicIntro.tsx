"use client";

import { useEffect, useRef, useState } from "react";

const SEEN_KEY = "public-intro-seen";
const LOADING_MS = 900;
const WELCOME_MS = 1050;
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
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen || reduceMotion) {
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
    const markSeen = () => {
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage unavailable */
      }
    };
    const finish = () => {
      clearTimers();
      document.body.style.overflow = previousOverflow;
      setPhase("done");
    };
    const beginExit = () => {
      markSeen();
      // Let the page fade up beneath the lifting curtain.
      root.classList.remove("public-intro-active");
      setPhase("exit");
      timersRef.current.push(window.setTimeout(finish, EXIT_MS + 80));
    };
    const skip = () => beginExit();

    timersRef.current.push(window.setTimeout(() => setPhase("welcome"), LOADING_MS));
    timersRef.current.push(window.setTimeout(beginExit, LOADING_MS + WELCOME_MS));

    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      clearTimers();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      root.classList.remove("public-intro-active");
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem("${SEEN_KEY}")==="1"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("public-intro-skip")}}catch(e){}`
        }}
      />
      <div className="public-intro" data-phase={phase} role="presentation" aria-hidden="true">
        <div className="public-intro__inner">
          <span className="public-intro__seal">{displayName.trim().charAt(0) || "印"}</span>
          <span className="public-intro__progress">
            <i />
          </span>
          <span className="public-intro__label">LOADING · 载入中</span>
          <div className="public-intro__welcome">
            <span className="public-intro__name">{displayName}</span>
            <span className="public-intro__rule" />
            {tagline ? <span className="public-intro__tagline">{tagline}</span> : null}
          </div>
        </div>
      </div>
    </>
  );
}
