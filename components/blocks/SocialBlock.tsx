import { SocialIcon } from "@/components/site/SocialIcon";
import type { Block } from "@/types/block";

export function SocialBlock({ block }: { block: Block }) {
 return (
 <div className="grid gap-2">
 <SocialIcon name={block.icon} className="h-6 w-6 text-[var(--block-accent-deep)]" />
 {block.title ? <h3 className="text-lg font-semibold">{block.title}</h3> : null}
 {block.subtitle ? <p className="text-sm text-[var(--ink-2)]">{block.subtitle}</p> : null}
 </div>
 );
}
