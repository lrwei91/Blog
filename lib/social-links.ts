export const socialIconPresets = [
  "link",
  "github",
  "x",
  "weibo",
  "wechat",
  "telegram",
  "douban",
  "instagram",
  "youtube",
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

export type SocialIconName = (typeof socialIconPresets)[number];

const socialIconLabels: Record<SocialIconName, string> = {
  link: "Link",
  github: "GitHub",
  x: "X",
  weibo: "Weibo",
  wechat: "WeChat",
  telegram: "Telegram",
  douban: "豆瓣",
  instagram: "Instagram",
  youtube: "YouTube",
  bilibili: "哔哩哔哩",
  tiktok: "TikTok / 抖音",
  xiaohongshu: "小红书",
  zhihu: "知乎",
  qq: "QQ",
  discord: "Discord",
  facebook: "Facebook",
  threads: "Threads",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  spotify: "Spotify",
  linkedin: "LinkedIn",
  website: "Website",
  mail: "Email"
};

export function getSocialIconLabel(icon?: string) {
  if (icon === "twitter") return socialIconLabels.x;
  if (icon === "email") return socialIconLabels.mail;
  if (icon === "globe") return socialIconLabels.website;
  return socialIconLabels[icon as SocialIconName] ?? socialIconLabels.link;
}

export function inferSocialIconFromUrl(value: string, currentIcon?: string) {
  if (!value || value === "https://") return currentIcon || "link";
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes("github.com")) return "github";
  if (lowerValue.includes("twitter.com") || lowerValue.includes("x.com")) return "x";
  if (lowerValue.includes("weibo.com")) return "weibo";
  if (lowerValue.includes("weixin.qq.com") || lowerValue.includes("wechat.com")) return "wechat";
  if (lowerValue.includes("t.me/") || lowerValue.includes("telegram.me/") || lowerValue.includes("telegram.org")) return "telegram";
  if (lowerValue.includes("douban.com")) return "douban";
  if (lowerValue.includes("instagram.com")) return "instagram";
  if (lowerValue.includes("youtube.com") || lowerValue.includes("youtu.be")) return "youtube";
  if (lowerValue.includes("bilibili.com") || lowerValue.includes("b23.tv")) return "bilibili";
  if (lowerValue.includes("tiktok.com") || lowerValue.includes("douyin.com")) return "tiktok";
  if (lowerValue.includes("xiaohongshu.com") || lowerValue.includes("xhslink.com")) return "xiaohongshu";
  if (lowerValue.includes("zhihu.com")) return "zhihu";
  if (lowerValue.includes("qzone.qq.com") || lowerValue.includes("im.qq.com")) return "qq";
  if (lowerValue.includes("discord.com") || lowerValue.includes("discord.gg")) return "discord";
  if (lowerValue.includes("facebook.com") || lowerValue.includes("fb.com")) return "facebook";
  if (lowerValue.includes("threads.net")) return "threads";
  if (lowerValue.includes("bsky.app")) return "bluesky";
  if (lowerValue.includes("mastodon.social")) return "mastodon";
  if (lowerValue.includes("spotify.com")) return "spotify";
  if (lowerValue.includes("linkedin.com")) return "linkedin";
  if (lowerValue.startsWith("mailto:")) return "mail";
  return currentIcon || "website";
}

export function inferSocialLabelFromUrl(value: string) {
  return getSocialIconLabel(inferSocialIconFromUrl(value));
}
