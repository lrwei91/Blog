"use client";

import { ArrowUp, Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function PublicFloatingTools({ enableShare, title }: { enableShare: boolean; title: string }) {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
  }, []);

  function showCopiedState() {
    setCopied(true);
    if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      showCopiedState();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(window.location.href);
        showCopiedState();
      } catch {
        setCopied(false);
        toast.error("分享失败，请复制浏览器地址");
      }
    }
  }

  return (
    <div className="public-floating-tools" data-floating-tools>
      {enableShare ? (
        <button className="public-share" type="button" onClick={share} aria-label="分享当前页面" title={copied ? "链接已复制" : "分享页面"}>
          {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
          <span>{copied ? "COPIED" : "SHARE"}</span>
        </button>
      ) : null}
      <a className="public-back-to-top" href="#top" data-back-to-top aria-label="返回顶部">
        <ArrowUp aria-hidden="true" />
        <span>TOP</span>
      </a>
    </div>
  );
}
