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
    const sectionLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-section-link]"));
    const sectionTargets = sectionLinks.flatMap((link) => {
      const targetId = link.getAttribute("href")?.slice(1);
      const target = targetId ? document.getElementById(targetId) : null;
      return target ? [target] : [];
    }).filter((target, index, targets) => targets.indexOf(target) === index);
    const overflowNav = document.querySelector<HTMLDetailsElement>(".public-nav__more");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".public-site [data-reveal]"));
    const continuousMotionItems = Array.from(
      document.querySelectorAll<HTMLElement>(".public-site [data-continuous-motion]")
    );

    let scrollFrame = 0;
    const syncScrollUi = () => {
      nav?.classList.toggle("is-floating", window.scrollY > 18);
      backToTop?.classList.toggle("is-visible", window.scrollY > 520);
      floatingTools?.classList.toggle("is-page-ready", window.scrollY > Math.max(180, window.innerHeight * 0.45));
      const activationLine = window.scrollY + Math.min(220, window.innerHeight * 0.28);
      let activeId = "";
      sectionTargets.forEach((target) => {
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        if (targetTop <= activationLine) activeId = target.id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        activeId = sectionTargets.at(-1)?.id ?? activeId;
      }
      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      overflowNav?.classList.toggle(
        "has-active-link",
        Boolean(overflowNav.querySelector("[data-section-link].is-active"))
      );
    };
    const updateScrollUi = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        syncScrollUi();
      });
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
      window.removeEventListener("resize", updateScrollUi);
      document.removeEventListener("click", scrollToAnchor);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };

    syncScrollUi();
    window.addEventListener("scroll", updateScrollUi, { passive: true });
    window.addEventListener("resize", updateScrollUi);
    document.addEventListener("click", scrollToAnchor);

    if (!enabled || reduceMotion || typeof window.IntersectionObserver !== "function") {
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
