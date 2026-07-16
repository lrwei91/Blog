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
  Github,
  Globe2,
  Instagram,
  LinkIcon,
  Mail,
  Map,
  Sparkles,
  TerminalSquare,
  Twitter,
  User,
  Users,
  Youtube,
  Linkedin,
  Zap
} from "lucide-react";
import type { CSSProperties } from "react";

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
  "linkedin",
  "website",
  "mail"
] as const;

export type BlockIconName = (typeof blockIconPresets)[number];

export function getBlockIconColor(value: unknown) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#1677FF";
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
  if (name === "github") return <Github className={className} style={style} />;
  if (name === "x" || name === "twitter") return <Twitter className={className} style={style} />;
  if (name === "instagram") return <Instagram className={className} style={style} />;
  if (name === "youtube") return <Youtube className={className} style={style} />;
  if (name === "linkedin") return <Linkedin className={className} style={style} />;
  if (name === "website" || name === "globe") return <Globe2 className={className} style={style} />;
  if (name === "mail" || name === "email") return <Mail className={className} style={style} />;
  return <LinkIcon className={className} style={style} />;
}
