import {
  AtSign,
  BookHeart,
  CirclePlay,
  Cloud,
  Gamepad2,
  Github,
  Globe2,
  Instagram,
  LinkIcon,
  Linkedin,
  Mail,
  MessageCircle,
  MessagesSquare,
  Music2,
  Radio,
  Send,
  TvMinimalPlay,
  Twitter,
  Youtube
} from "lucide-react";
import type { CSSProperties } from "react";

function BrandGlyph({ children, className, style }: { children: string; className: string; style?: CSSProperties }) {
  return (
    <span aria-hidden="true" className={`${className} inline-flex items-center justify-center font-sans font-semibold leading-none`} style={style}>
      {children}
    </span>
  );
}

export function SocialIcon({ name, className = "h-4 w-4", style }: { name?: string; className?: string; style?: CSSProperties }) {
  if (name === "github") return <Github className={className} style={style} />;
  if (name === "twitter" || name === "x") return <Twitter className={className} style={style} />;
  if (name === "weibo") return <Radio className={className} style={style} />;
  if (name === "wechat") return <MessagesSquare className={className} style={style} />;
  if (name === "telegram") return <Send className={className} style={style} />;
  if (name === "douban") return <BrandGlyph className={className} style={style}>豆</BrandGlyph>;
  if (name === "instagram") return <Instagram className={className} style={style} />;
  if (name === "youtube") return <Youtube className={className} style={style} />;
  if (name === "bilibili") return <TvMinimalPlay className={className} style={style} />;
  if (name === "tiktok") return <Music2 className={className} style={style} />;
  if (name === "xiaohongshu") return <BookHeart className={className} style={style} />;
  if (name === "zhihu") return <BrandGlyph className={className} style={style}>知</BrandGlyph>;
  if (name === "qq") return <MessageCircle className={className} style={style} />;
  if (name === "discord") return <Gamepad2 className={className} style={style} />;
  if (name === "facebook") return <BrandGlyph className={className} style={style}>f</BrandGlyph>;
  if (name === "threads") return <AtSign className={className} style={style} />;
  if (name === "bluesky") return <Cloud className={className} style={style} />;
  if (name === "mastodon") return <MessagesSquare className={className} style={style} />;
  if (name === "spotify") return <CirclePlay className={className} style={style} />;
  if (name === "linkedin") return <Linkedin className={className} style={style} />;
  if (name === "website" || name === "globe") return <Globe2 className={className} style={style} />;
  if (name === "mail" || name === "email") return <Mail className={className} style={style} />;
  return <LinkIcon className={className} style={style} />;
}
