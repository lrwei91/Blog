"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

type AccessibleDialogOptions = {
  onClose: () => void;
  portalRoot?: Element | null;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

export function useAccessibleDialog({
  onClose,
  portalRoot,
  initialFocusRef
}: AccessibleDialogOptions) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const dialog = dialogRef.current;
    if (!overlay || !dialog) return;
    const overlayElement = overlay;
    const dialogElement = dialog;

    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = portalRoot instanceof HTMLElement ? portalRoot : document.body;
    const backgroundElements = Array.from(root.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== overlay);
    const previousBackgroundState = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden")
    }));
    const previousOverflow = document.body.style.overflow;
    const initialTarget = initialFocusRef?.current ?? getFocusableElements(overlayElement)[0] ?? dialogElement;

    initialTarget.focus({ preventScroll: true });
    backgroundElements.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(overlayElement);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousBackgroundState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      returnFocus?.focus({ preventScroll: true });
    };
  }, [initialFocusRef, portalRoot]);

  return { overlayRef, dialogRef };
}

function getFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.getClientRects().length > 0 && !element.closest("[inert]")
  );
}
