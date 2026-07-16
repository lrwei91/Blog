"use client";

import { useEffect } from "react";

export function PublicSiteEffects({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>("[data-public-nav]");
    const backToTop = document.querySelector<HTMLElement>("[data-back-to-top]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".public-site [data-reveal]"));

    const updateScrollUi = () => {
      nav?.classList.toggle("is-floating", window.scrollY > 18);
      backToTop?.classList.toggle("is-visible", window.scrollY > 520);
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
      return cleanupBaseEffects;
    }

    root.classList.add("site-motion-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      root.classList.remove("site-motion-ready");
      cleanupBaseEffects();
    };
  }, [enabled]);

  return null;
}
