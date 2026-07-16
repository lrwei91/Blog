import type { CSSProperties } from "react";
import type { Block } from "@/types/block";
import { BlockCard } from "@/components/blocks/BlockCard";
import { getExperienceTimelineMeta } from "@/lib/experience-timeline";

export function ExperienceTimeline({ blocks }: { blocks: Block[] }) {
  return (
    <div className="experience-timeline" aria-label="工作经历时间线">
      {blocks.map((block, index) => {
        const timelineMeta = getExperienceTimelineMeta(block);

        return (
          <div key={block.id} className="experience-timeline__item" data-tone={index % 4}>
            <div
              className="experience-timeline__rail"
              data-reveal
              style={{ "--reveal-index": index } as CSSProperties}
              aria-hidden="true"
            >
              <span className="experience-timeline__node">
                <small>任职时间</small>
                <b>{timelineMeta.startLabel}</b>
                <i />
                <b>{timelineMeta.endLabel}</b>
              </span>
              {index < blocks.length - 1 ? <i className="experience-timeline__line" /> : null}
            </div>

            <BlockCard
              block={block}
              hidePlaceholderContent
              withLayout={false}
              timelineMeta={timelineMeta}
              revealIndex={index}
              className="experience-timeline__card"
            />
          </div>
        );
      })}
    </div>
  );
}
