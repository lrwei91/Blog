import { describe, expect, it } from "vitest";
import {
  getSocialIconLabel,
  inferSocialIconFromUrl,
  inferSocialLabelFromUrl,
  socialIconPresets
} from "@/lib/social-links";

describe("social link presets", () => {
  it("includes common Chinese and international social platforms", () => {
    expect(socialIconPresets).toEqual(expect.arrayContaining([
      "telegram",
      "douban",
      "bilibili",
      "xiaohongshu",
      "zhihu",
      "discord",
      "facebook",
      "threads"
    ]));
  });

  it.each([
    ["https://t.me/example", "telegram", "Telegram"],
    ["https://www.douban.com/people/example/", "douban", "豆瓣"],
    ["https://space.bilibili.com/123", "bilibili", "哔哩哔哩"],
    ["https://www.xiaohongshu.com/user/profile/example", "xiaohongshu", "小红书"],
    ["https://www.zhihu.com/people/example", "zhihu", "知乎"],
    ["https://discord.gg/example", "discord", "Discord"],
    ["https://www.threads.net/@example", "threads", "Threads"]
  ])("recognizes %s", (url, icon, label) => {
    expect(inferSocialIconFromUrl(url)).toBe(icon);
    expect(inferSocialLabelFromUrl(url)).toBe(label);
    expect(getSocialIconLabel(icon)).toBe(label);
  });

  it("keeps WeChat recognition ahead of QQ domains", () => {
    expect(inferSocialIconFromUrl("https://weixin.qq.com/example")).toBe("wechat");
  });
});
