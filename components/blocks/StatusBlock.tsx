import { Activity } from "lucide-react";
import type { Block } from "@/types/block";

export function StatusBlock({ block }: { block: Block }) {
 return (
 <div className="grid gap-2">
 <Activity className="h-6 w-6 text-[var(--block-accent-deep)]" />
 {block.title ? <h3 className="text-xl font-semibold">{block.title}</h3> : null}
 {block.subtitle ? <p className="text-sm font-medium text-[var(--ink-2)]">{block.subtitle}</p> : null}
 {block.description ? <p className="text-sm leading-6 text-[var(--ink-2)]">{block.description}</p> : null}
 </div>
 );
}
