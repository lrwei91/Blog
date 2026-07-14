"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import type { SiteLanguage } from "@/types/site-config";
import { publicLanguageTransitionCookieName } from "@/lib/public-variant-cookies";
import { cn } from "@/lib/utils";

type PublicLanguageSwitcherProps = {
  currentLocale: string;
  languages: SiteLanguage[];
  accessCode: string;
  initialPreparingLocale?: string;
  className?: string;
  buttonClassName?: string;
};

type PreparingTransition = {
  locale: string;
  isExiting: boolean;
};

export function PublicLanguageSwitcher({
  currentLocale,
  languages,
  accessCode,
  initialPreparingLocale,
  className,
  buttonClassName
}: PublicLanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preparingTransition, setPreparingTransition] = useState<PreparingTransition | null>(() =>
    initialPreparingLocale ? { locale: initialPreparingLocale, isExiting: false } : null
  );
  const switcherRef = useRef<HTMLDivElement>(null);
  const visibleLanguages = languages.filter((language) => language.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const currentLanguage = visibleLanguages.find((language) => language.code === currentLocale) ?? visibleLanguages[0];

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !switcherRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  useEffect(() => {
    if (!initialPreparingLocale) return;

    document.cookie = `${publicLanguageTransitionCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
    const fadeTimer = window.setTimeout(() => {
      setPreparingTransition((current) => current ? { ...current, isExiting: true } : null);
    }, 280);
    const removeTimer = window.setTimeout(() => setPreparingTransition(null), 800);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [initialPreparingLocale]);

  if (visibleLanguages.length <= 1 || !currentLanguage) return null;

  function selectLanguage(locale: string) {
    if (locale === currentLanguage.code || preparingTransition) {
      setIsOpen(false);
      return;
    }

    setPreparingTransition({ locale, isExiting: false });
    setIsOpen(false);
    const encodedLocale = encodeURIComponent(locale);
    const languagePath = accessCode
      ? `/${encodeURIComponent(accessCode)}/${encodedLocale}`
      : `/${encodedLocale}`;
    window.setTimeout(() => window.location.assign(languagePath), 180);
  }

  return (
    <div ref={switcherRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="选择语言"
        title="选择语言"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--site-border)] bg-white/90 text-[var(--site-text)] shadow-soft transition hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]",
          buttonClassName
        )}
      >
        <Languages className="h-[18px] w-[18px]" />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full mt-2 w-[220px] origin-top-left rounded-[18px] border border-[#E5EAF2] bg-white/96 p-2 text-[#111827] shadow-[0_18px_54px_rgba(15,23,42,0.18)] backdrop-blur transition duration-200",
          isOpen ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        )}
      >
        <div className="grid gap-1.5">
          {visibleLanguages.map((language) => {
            const isActive = language.code === currentLanguage.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => selectLanguage(language.code)}
                disabled={Boolean(preparingTransition)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm font-medium transition",
                  isActive
                    ? "border-[#B7D8FF] bg-[#EFF6FF] text-[#1D4ED8]"
                    : "border-transparent bg-white text-[#334155] hover:border-[#BFDBFE] hover:bg-[#F8FBFF]"
                )}
              >
                <span>{language.label}</span>
                <span className={cn("text-xs", isActive ? "text-[#2563EB]" : "text-[#94A3B8]")}>{language.code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {preparingTransition ? (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 text-[#111827] backdrop-blur-[2px] transition-[opacity,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            initialPreparingLocale ? "" : "animate-in fade-in duration-300",
            preparingTransition.isExiting ? "pointer-events-none opacity-0 backdrop-blur-0" : "opacity-100"
          )}
          role="status"
          aria-live="polite"
          aria-label={getPreparingMessage(preparingTransition.locale)}
        >
          <div
            className={cn(
              "flex flex-col items-center transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              preparingTransition.isExiting ? "translate-y-1 scale-[0.98] opacity-0" : "translate-y-0 scale-100 opacity-100"
            )}
          >
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#111827]" aria-hidden="true" />
            <span className="mt-4 text-[13px] font-medium tracking-[0.08em] text-[#6B7280]">
              {getPreparingMessage(preparingTransition.locale)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getPreparingMessage(locale: string) {
  const normalizedLocale = locale.toLowerCase();
  if (normalizedLocale === "zh-cn") return "正在准备中";
  if (normalizedLocale === "zh-tw") return "正在準備中";
  if (normalizedLocale.startsWith("en")) return "Preparing…";
  if (normalizedLocale.startsWith("ja")) return "準備しています…";
  if (normalizedLocale.startsWith("ko")) return "준비 중…";
  if (normalizedLocale.startsWith("fr")) return "Préparation…";
  if (normalizedLocale.startsWith("de")) return "Wird vorbereitet…";
  if (normalizedLocale.startsWith("es")) return "Preparando…";
  if (normalizedLocale.startsWith("it")) return "Preparazione…";
  if (normalizedLocale.startsWith("pt")) return "A preparar…";
  return "Preparing…";
}
