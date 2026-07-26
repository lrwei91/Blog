"use client";

import { useEffect, useLayoutEffect } from "react";

export function PublicSiteEffects({ enabled }: { enabled: boolean }) {
  useLayoutEffect(() => {
    if (window.location.hash) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    const resetScrollPosition = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    window.history.scrollRestoration = "manual";
    resetScrollPosition();
    const frame = window.requestAnimationFrame(resetScrollPosition);
    window.addEventListener("pageshow", resetScrollPosition);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", resetScrollPosition);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>("[data-public-nav]");
    const backToTop = document.querySelector<HTMLElement>("[data-back-to-top]");
    const floatingTools = document.querySelector<HTMLElement>("[data-floating-tools]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".public-site [data-reveal]"));
    const continuousMotionItems = Array.from(
      document.querySelectorAll<HTMLElement>(".public-site [data-continuous-motion]")
    );

    const updateScrollUi = () => {
      nav?.classList.toggle("is-floating", window.scrollY > 18);
      backToTop?.classList.toggle("is-visible", window.scrollY > 520);
      floatingTools?.classList.toggle("is-page-ready", window.scrollY > Math.max(180, window.innerHeight * 0.45));
    };
    const scrollToAnchor = (event: MouseEvent) => {
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>(".public-site a[href^='#']")
        : null;
      if (!link) return;
      const anchorId = link.getAttribute("href")?.slice(1);
      const target = anchorId ? document.getElementById(anchorId) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", `#${anchorId}`);
    };
    const cleanupBaseEffects = () => {
      window.removeEventListener("scroll", updateScrollUi);
      document.removeEventListener("click", scrollToAnchor);
    };

    updateScrollUi();
    window.addEventListener("scroll", updateScrollUi, { passive: true });
    document.addEventListener("click", scrollToAnchor);

    if (!enabled || reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      continuousMotionItems.forEach((item) => item.classList.remove("is-motion-active"));
      return cleanupBaseEffects;
    }

    root.classList.add("site-motion-ready");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    const visibleMotionItems = new Set<Element>();
    const syncContinuousMotion = () => {
      const pageIsVisible = document.visibilityState === "visible";
      continuousMotionItems.forEach((item) => {
        item.classList.toggle("is-motion-active", pageIsVisible && visibleMotionItems.has(item));
      });
    };
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleMotionItems.add(entry.target);
          else visibleMotionItems.delete(entry.target);
        });
        syncContinuousMotion();
      },
      { threshold: 0.05 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
    continuousMotionItems.forEach((item) => motionObserver.observe(item));
    document.addEventListener("visibilitychange", syncContinuousMotion);

    return () => {
      revealObserver.disconnect();
      motionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncContinuousMotion);
      continuousMotionItems.forEach((item) => item.classList.remove("is-motion-active"));
      root.classList.remove("site-motion-ready");
      cleanupBaseEffects();
    };
  }, [enabled]);

  return null;
}
