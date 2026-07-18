"use client";

import { ArrowUp, Check, Share2 } from "lucide-react";
import { useState } from "react";

export function PublicFloatingTools({ enableShare, title }: { enableShare: boolean; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <div className="public-floating-tools">
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
