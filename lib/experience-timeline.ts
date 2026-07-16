import type { Block } from "@/types/block";

export type ExperienceTimelineMeta = {
  role: string;
  period: string;
  startLabel: string;
  endLabel: string;
  tenure: string;
};

export function getExperienceTimelineMeta(block: Block, now = new Date()): ExperienceTimelineMeta {
  const subtitle = block.subtitle ?? "";
  const parts = subtitle.split(/\s*·\s*/).filter(Boolean);
  const role = parts[0] || subtitle;
  const period = parts.slice(1).join(" · ");
  const dates = parsePeriod(period, now);
  const configuredTenure =
    typeof block.metadata?.timelineTenure === "string" ? block.metadata.timelineTenure.trim() : "";
  const badgeTenure = /^\d+\s*年(?:\s*\d+\s*个月)?$/.test(block.badge?.trim() ?? "")
    ? block.badge?.trim() ?? ""
    : "";

  return {
    role,
    period,
    startLabel: dates?.startLabel ?? "任职",
    endLabel: dates?.endLabel ?? "时间",
    tenure: configuredTenure || badgeTenure || dates?.tenure || "—"
  };
}

function parsePeriod(period: string, now: Date) {
  const match = period.match(
    /(\d{4})\s*年\s*(\d{1,2})\s*月\s*[-–—]\s*(?:至今|(\d{4})\s*年\s*(\d{1,2})\s*月)/
  );
  if (!match) return null;

  const startYear = Number(match[1]);
  const startMonth = Number(match[2]);
  const isCurrent = period.includes("至今");
  const current = getShanghaiYearMonth(now);
  const endYear = isCurrent ? current.year : Number(match[3]);
  const endMonth = isCurrent ? current.month : Number(match[4]);
  const monthCount = Math.max(0, (endYear - startYear) * 12 + endMonth - startMonth);

  return {
    startLabel: `${startYear}.${String(startMonth).padStart(2, "0")}`,
    endLabel: isCurrent ? "至今" : `${endYear}.${String(endMonth).padStart(2, "0")}`,
    tenure: formatTenure(monthCount)
  };
}

function getShanghaiYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric"
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value)
  };
}

function formatTenure(monthCount: number) {
  if (monthCount < 1) return "不足 1 个月";
  const years = Math.floor(monthCount / 12);
  const months = monthCount % 12;
  if (!years) return `${months} 个月`;
  if (!months) return `${years} 年`;
  return `${years} 年 ${months} 个月`;
}
