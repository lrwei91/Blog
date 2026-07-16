import type { Block } from "@/types/block";
import { BlockIcon, getBlockIconColor } from "@/components/blocks/BlockIcon";

export function ProjectBlock({ block }: { block: Block }) {
  const iconColor = getBlockIconColor(block.metadata?.iconColor);
  return (
    <div className="public-project-block grid gap-2">
      {block.icon ? <div className="public-project-block__icon"><BlockIcon name={block.icon} className="h-6 w-6" style={{ color: iconColor }} /></div> : null}
      {block.title ? <h3>{block.title}</h3> : null}
      {block.subtitle ? <p className="public-project-block__subtitle">{block.subtitle}</p> : null}
      {block.description ? <p className="public-project-block__description line-clamp-4">{block.description}</p> : null}
    </div>
  );
}
