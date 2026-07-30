import {
 Award,
 BookOpen,
 Boxes,
 BriefcaseBusiness,
 Building2,
 CheckCircle2,
 ChefHat,
 Cpu,
 Database,
 Gamepad2,
 Map,
 Sparkles,
 TerminalSquare,
 User,
 Users,
 Zap
} from "lucide-react";
import type { CSSProperties } from "react";
import { SocialIcon } from "@/components/site/SocialIcon";
import { socialIconPresets } from "@/lib/social-links";

export const blockIconPresets = [
 "build",
 "building",
 "check",
 "briefcase",
 "cpu",
 "database",
 "gamepad",
 "terminal",
 "user",
 "users",
 "zap",
 "chef-hat",
 "book-open",
 "award",
 "map",
 "sparkle",
 "link",
 "github",
 "x",
 "instagram",
 "youtube",
 "telegram",
 "douban",
 "bilibili",
 "tiktok",
 "xiaohongshu",
 "zhihu",
 "qq",
 "discord",
 "facebook",
 "threads",
 "bluesky",
 "mastodon",
 "spotify",
 "linkedin",
 "website",
 "mail"
] as const;

export type BlockIconName = (typeof blockIconPresets)[number];

export function getBlockIconColor(value: unknown) {
 return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#B23C22";
}

export function BlockIcon({ name, className = "h-6 w-6", style }: { name?: string; className?: string; style?: CSSProperties }) {
 if (!name) return null;
 if (name === "build") return <Boxes className={className} style={style} />;
 if (name === "building") return <Building2 className={className} style={style} />;
 if (name === "check") return <CheckCircle2 className={className} style={style} />;
 if (name === "briefcase") return <BriefcaseBusiness className={className} style={style} />;
 if (name === "cpu") return <Cpu className={className} style={style} />;
 if (name === "database") return <Database className={className} style={style} />;
 if (name === "gamepad") return <Gamepad2 className={className} style={style} />;
 if (name === "terminal") return <TerminalSquare className={className} style={style} />;
 if (name === "user") return <User className={className} style={style} />;
 if (name === "users") return <Users className={className} style={style} />;
 if (name === "zap") return <Zap className={className} style={style} />;
 if (name === "chef-hat") return <ChefHat className={className} style={style} />;
 if (name === "book-open") return <BookOpen className={className} style={style} />;
 if (name === "award") return <Award className={className} style={style} />;
 if (name === "map") return <Map className={className} style={style} />;
 if (name === "sparkle") return <Sparkles className={className} style={style} />;
 if (socialIconPresets.includes(name as (typeof socialIconPresets)[number]) || name === "twitter" || name === "globe" || name === "email") {
  return <SocialIcon name={name} className={className} style={style} />;
 }
 return <SocialIcon name="link" className={className} style={style} />;
}
