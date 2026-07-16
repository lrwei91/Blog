import { ImageIcon } from "lucide-react";
import type { Block } from "@/types/block";

export function ImageBlock({ block }: { block: Block }) {
  return (
    <div className="grid gap-2">
      <ImageIcon className="h-5 w-5 text-[var(--block-accent-deep)]" />
      {block.title ? <h3 className="text-lg font-semibold">{block.title}</h3> : null}
      {block.subtitle ? <p className="text-sm text-[var(--ink-2)]">{block.subtitle}</p> : null}
    </div>
  );
}
