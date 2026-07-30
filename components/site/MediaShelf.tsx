import Image from "next/image";
import { ArrowUpRight, BookOpen, Film, Gamepad2, Headphones, Sparkles, Star } from "lucide-react";
import type { Block } from "@/types/block";
import { readDoubanMediaSource, readMediaItems } from "@/lib/life-modules";
import type { MediaCategory, MediaItem } from "@/types/life-modules";

const categoryMeta: Record<MediaCategory, { label: string; icon: typeof Film }> = {
  movie: { label: "影像", icon: Film },
  book: { label: "阅读", icon: BookOpen },
  game: { label: "游戏", icon: Gamepad2 },
  music: { label: "音乐", icon: Headphones },
  other: { label: "收藏", icon: Sparkles }
};

export function MediaShelf({ block }: { block: Block }) {
  const items = readMediaItems(block.metadata?.mediaItems);
  const source = readDoubanMediaSource(block.metadata?.mediaSource);

  return (
    <section className="media-shelf" aria-label="最近在看、玩、听">
      <header className="media-shelf__header">
        <div>
          <p className="media-shelf__eyebrow">
            <span>PERSONAL INDEX</span>
            <i aria-hidden="true" />
            <span>{String(items.length).padStart(2, "0")} ENTRIES</span>
          </p>
          <h3>正在进入我的生活</h3>
          <p className="media-shelf__intro">最近标记的影像、阅读、游戏与声音，按当下状态依次陈列。</p>
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

      {items.length > 0 ? (
        <div className="media-shelf__grid">
          {items.map((item, index) => (
            <MediaShelfCard item={item} index={index} key={item.id} />
          ))}
        </div>
      ) : (
        <p className="life-module-empty">同步豆瓣后，这里会出现最近的书影音与游戏记录。</p>
      )}
    </section>
  );
}

function MediaShelfCard({ item, index }: { item: MediaItem; index: number }) {
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
            sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <Icon aria-hidden="true" />
        )}
        <span className="media-shelf__number">{String(index + 1).padStart(2, "0")}</span>
        <span className="media-shelf__status">{item.status}</span>
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
