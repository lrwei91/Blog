import { ArrowUpRight, BookOpen, Film, Gamepad2, Headphones, Sparkles, Star } from "lucide-react";
import type { Block } from "@/types/block";
import { readMediaItems } from "@/lib/life-modules";
import type { MediaCategory } from "@/types/life-modules";

const categoryMeta: Record<MediaCategory, { label: string; icon: typeof Film }> = {
  movie: { label: "在看", icon: Film },
  book: { label: "在读", icon: BookOpen },
  game: { label: "在玩", icon: Gamepad2 },
  music: { label: "在听", icon: Headphones },
  other: { label: "收藏", icon: Sparkles }
};

export function MediaShelf({ block }: { block: Block }) {
  const items = readMediaItems(block.metadata?.mediaItems);
  return (
    <section className="media-shelf" aria-label="最近在看、玩、听">
      {items.length > 0 ? (
        <div className="media-shelf__grid">
          {items.map((item) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;
            return (
              <article className="media-shelf__card" key={item.id}>
                <div className="media-shelf__visual">
                  {item.coverImage ? <img src={item.coverImage} alt={`${item.title}封面`} /> : <Icon aria-hidden="true" />}
                </div>
                <div className="media-shelf__body">
                  <p className="media-shelf__status">{item.status}</p>
                  <h3>{item.title}</h3>
                  {item.creator ? <p className="media-shelf__creator">{item.creator}</p> : null}
                  {typeof item.rating === "number" ? (
                    <p className="media-shelf__rating"><Star aria-hidden="true" /> {item.rating.toFixed(1)} / 5</p>
                  ) : null}
                  {item.note ? <p className="media-shelf__note">{item.note}</p> : null}
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">查看详情 <ArrowUpRight aria-hidden="true" /></a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : <p className="life-module-empty">最近的书影音与游戏清单还没有内容。</p>}
    </section>
  );
}
