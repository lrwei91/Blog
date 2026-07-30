"use client";

import Image from "next/image";
import { ArrowUpRight, BookOpen, Film, Gamepad2, Headphones, List, Sparkles, Star, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { Block } from "@/types/block";
import { buildDoubanWatchlistGroups, readDoubanMediaSource, readMediaItems } from "@/lib/life-modules";
import type { DoubanWatchlistProgress, MediaCategory, MediaItem } from "@/types/life-modules";
import { useAccessibleDialog } from "@/components/ui/useAccessibleDialog";

const categoryMeta: Record<MediaCategory, { label: string; icon: typeof Film }> = {
  movie: { label: "影像", icon: Film },
  book: { label: "阅读", icon: BookOpen },
  game: { label: "游戏", icon: Gamepad2 },
  music: { label: "音乐", icon: Headphones },
  other: { label: "收藏", icon: Sparkles }
};

export function MediaShelf({ block }: { block: Block }) {
  const items = useMemo(() => readMediaItems(block.metadata?.mediaItems), [block.metadata?.mediaItems]);
  const source = readDoubanMediaSource(block.metadata?.mediaSource);
  const [activeProgress, setActiveProgress] = useState<DoubanWatchlistProgress>("active");
  const [dialogProgress, setDialogProgress] = useState<DoubanWatchlistProgress | null>(null);
  const [dialogContainer, setDialogContainer] = useState<Element | null>(null);
  const groups = useMemo(() => buildDoubanWatchlistGroups(items), [items]);
  const displayedCount = groups.reduce((total, group) => total + group.items.length, 0);
  const activeGroup = groups.find((group) => group.progress === activeProgress) ?? groups[0];
  const dialogGroup = groups.find((group) => group.progress === dialogProgress);

  return (
    <section className="media-shelf" aria-label="我的豆瓣片单">
      <header className="media-shelf__header">
        <div>
          <p className="media-shelf__eyebrow">
            <span>DOUBAN WATCHLIST</span>
            <i aria-hidden="true" />
            <span>{String(displayedCount).padStart(2, "0")} ENTRIES</span>
          </p>
          <p className="media-shelf__intro">正在看的故事与准备打开的下一部，按最近标记时间依次陈列。</p>
        </div>
        <div className="media-shelf__source">
          {source.lastSyncedAt ? (
            <span>
              <small>LAST SYNC</small>
              <time dateTime={source.lastSyncedAt}>{formatPublicDate(source.lastSyncedAt)}</time>
            </span>
          ) : null}
          {source.profileUrl ? (
            <a href={source.profileUrl} target="_blank" rel="noreferrer">
              豆瓣主页 <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </header>

      <div className="media-shelf__tabs" role="tablist" aria-label="豆瓣片单分类">
        {groups.map((group) => (
          <button
            id={`media-shelf-tab-${group.progress}`}
            key={group.progress}
            type="button"
            role="tab"
            aria-selected={activeProgress === group.progress}
            aria-controls={`media-shelf-panel-${group.progress}`}
            tabIndex={activeProgress === group.progress ? 0 : -1}
            data-progress={group.progress}
            onClick={() => setActiveProgress(group.progress)}
            onKeyDown={handleTabKeyDown}
          >
            <span>{group.label}</span>
            <small>{String(group.items.length).padStart(2, "0")}</small>
          </button>
        ))}
      </div>

      <section
        className="media-shelf__tab-panel"
        id={`media-shelf-panel-${activeGroup.progress}`}
        role="tabpanel"
        aria-labelledby={`media-shelf-tab-${activeGroup.progress}`}
      >
        {activeGroup.items.length > 0 ? (
          <>
            <div className="media-shelf__grid">
              {activeGroup.visibleItems.map((item) => (
                <MediaShelfCard item={item} key={item.id} />
              ))}
            </div>
            {activeGroup.items.length > 8 ? (
              <footer className="media-shelf__panel-footer">
                <button
                  type="button"
                  onClick={(event) => {
                    setDialogContainer(event.currentTarget.closest(".public-site"));
                    setDialogProgress(activeGroup.progress);
                  }}
                >
                  <List aria-hidden="true" />
                  查看更多
                  <ArrowUpRight aria-hidden="true" />
                </button>
              </footer>
            ) : null}
          </>
        ) : (
          <p className="life-module-empty">这个分类暂时没有记录。</p>
        )}
      </section>

      {dialogGroup ? (
        <MediaShelfDialog
          title={`${dialogGroup.label} · 全部记录`}
          items={dialogGroup.items}
          container={dialogContainer}
          onClose={() => setDialogProgress(null)}
        />
      ) : null}
    </section>
  );
}

function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const tabs = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']") ?? []
  );
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0 || tabs.length < 2) return;
  event.preventDefault();
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextTab = tabs[(currentIndex + direction + tabs.length) % tabs.length];
  nextTab.focus();
  nextTab.click();
}

function MediaShelfCard({ item }: { item: MediaItem }) {
  const meta = categoryMeta[item.category];
  const Icon = meta.icon;
  const content = (
    <>
      <div className="media-shelf__visual">
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={`${item.title}封面`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <Icon aria-hidden="true" />
        )}
      </div>
      <div className="media-shelf__body">
        <p className="media-shelf__category"><Icon aria-hidden="true" /> {meta.label}</p>
        <h3>{item.title}</h3>
        {item.creator ? <p className="media-shelf__creator">{item.creator}</p> : null}
        <div className="media-shelf__meta">
          {typeof item.rating === "number" ? (
            <span className="media-shelf__rating"><Star aria-hidden="true" /> {item.rating.toFixed(1)}</span>
          ) : null}
          {item.markedAt ? <time dateTime={item.markedAt}>{item.markedAt}</time> : null}
        </div>
        {item.note ? <p className="media-shelf__note">{item.note}</p> : null}
        {item.href ? <span className="media-shelf__link">查看条目 <ArrowUpRight aria-hidden="true" /></span> : null}
      </div>
    </>
  );

  return (
    <article className="media-shelf__card">
      {item.href ? (
        <a href={item.href} target="_blank" rel="noreferrer" aria-label={`在豆瓣查看${item.title}`}>
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </article>
  );
}

function MediaShelfDialog({
  title,
  items,
  container,
  onClose
}: {
  title: string;
  items: MediaItem[];
  container: Element | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { overlayRef, dialogRef } = useAccessibleDialog({
    onClose,
    portalRoot: container,
    initialFocusRef: closeButtonRef
  });

  return createPortal(
    <div
      ref={overlayRef}
      className="media-shelf-dialog"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="media-shelf-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="media-shelf-dialog__header">
          <div>
            <p>MEDIA ARCHIVE · {String(items.length).padStart(2, "0")}</p>
            <h3 id={titleId}>{title}</h3>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭全部记录">
            <X aria-hidden="true" />
          </button>
        </header>
        <ol className="media-shelf-dialog__list">
          {items.map((item, index) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;
            const content = (
              <>
                <span className="media-shelf-dialog__number">{String(index + 1).padStart(2, "0")}</span>
                <span className="media-shelf-dialog__main">
                  <small><Icon aria-hidden="true" /> {meta.label} · {item.status}</small>
                  <strong>{item.title}</strong>
                  {item.creator ? <em>{item.creator}</em> : null}
                </span>
                <span className="media-shelf-dialog__meta">
                  {typeof item.rating === "number" ? <b><Star aria-hidden="true" /> {item.rating.toFixed(1)}</b> : null}
                  {item.markedAt ? <time dateTime={item.markedAt}>{item.markedAt}</time> : null}
                  {item.href ? <ArrowUpRight aria-hidden="true" /> : null}
                </span>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" aria-label={`在豆瓣查看${item.title}`}>
                    {content}
                  </a>
                ) : (
                  <div>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>,
    container ?? document.body
  );
}

function formatPublicDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai"
  }).format(date);
}
