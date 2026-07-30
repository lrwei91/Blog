"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useExitTransition(onClose: () => void, duration = 160) {
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const requestClose = useCallback(() => {
    if (timerRef.current) return;
    if (
      !document.documentElement.classList.contains("site-motion-ready") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onCloseRef.current();
      return;
    }

    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onCloseRef.current();
    }, duration);
  }, [duration]);

  return { isClosing, requestClose };
}
