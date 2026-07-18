import { CalendarDays, MapPin, Smile, Sparkles } from "lucide-react";
import type { Block } from "@/types/block";
import { readNowStatus } from "@/lib/life-modules";

export function NowStatus({ block }: { block: Block }) {
  const status = readNowStatus(block.metadata?.nowStatus);
  const hasContent = status.headline || status.body || status.mood || status.location || status.tags.length > 0;

  return (
    <section className="now-status" aria-label="此刻状态">
      <div className="now-status__eyebrow"><Sparkles aria-hidden="true" /> NOW · 此刻</div>
      {hasContent ? (
        <div className="now-status__layout">
          <div>
            <h3>{status.headline}</h3>
            {status.body ? <p>{status.body}</p> : null}
          </div>
          <aside className="now-status__meta">
            {status.mood ? <span><Smile aria-hidden="true" /><small>心情</small><b>{status.mood}</b></span> : null}
            {status.location ? <span><MapPin aria-hidden="true" /><small>所在</small><b>{status.location}</b></span> : null}
            {status.updatedAt ? <span><CalendarDays aria-hidden="true" /><small>更新</small><b>{formatDate(status.updatedAt)}</b></span> : null}
          </aside>
        </div>
      ) : (
        <p className="life-module-empty">还没有写下此刻的状态。</p>
      )}
      {status.tags.length > 0 ? (
        <div className="now-status__tags">{status.tags.map((tag) => <span key={tag}># {tag}</span>)}</div>
      ) : null}
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
