import { Github, Globe2, Instagram, LinkIcon, Linkedin, Twitter, Youtube } from "lucide-react";
import type { Block } from "@/types/block";

export function SocialBlock({ block }: { block: Block }) {
  const Icon =
    block.icon === "github"
      ? Github
      : block.icon === "twitter" || block.icon === "x"
        ? Twitter
        : block.icon === "instagram"
          ? Instagram
          : block.icon === "youtube"
            ? Youtube
            : block.icon === "linkedin"
              ? Linkedin
              : block.icon === "website"
                ? Globe2
                : LinkIcon;
  return (
    <div className="grid gap-2">
      <Icon className="h-6 w-6 text-[#1677FF]" />
      {block.title ? <h3 className="text-lg font-semibold">{block.title}</h3> : null}
      {block.subtitle ? <p className="text-sm text-[#64748B]">{block.subtitle}</p> : null}
    </div>
  );
}
