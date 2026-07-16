import { ArrowUpRight, ChartCandlestick, Clapperboard, Dices, Github, Globe2 } from "lucide-react";
import type { Block } from "@/types/block";

type ProjectItem = {
  title: string;
  description: string;
  eyebrow: string;
  href: string;
  liveHref?: string;
  icon: "film" | "market" | "data";
  tone: "mint" | "blue" | "yellow";
};

const fallbackProjects: ProjectItem[] = [
  {
    title: "CineScope",
    description: "影视内容聚合展示平台，通过自动化数据管线持续更新分类、评分、票房、热度与预告片数据。",
    eyebrow: "FILM · 01",
    href: "https://github.com/lrwei91/CineScope",
    liveHref: "https://lrwei91.github.io/CineScope/#tv_cn",
    icon: "film",
    tone: "mint"
  },
  {
    title: "fund-tracker-desktop",
    description: "Electron 桌面行情与持仓工具，集成指数、自选股、资金流、研究卡、财经快讯和独立持仓浮窗。",
    eyebrow: "MARKET · 02",
    href: "https://github.com/lrwei91/fund-tracker-desktop",
    icon: "market",
    tone: "blue"
  },
  {
    title: "Lottery",
    description: "体彩可视化分析与智能预测工具，包含历史走势、Canvas 图表、多策略回测与世界杯预测。",
    eyebrow: "DATA · 03",
    href: "https://github.com/lrwei91/Lottery",
    liveHref: "https://bet.lrwei91.online/#dlt",
    icon: "data",
    tone: "yellow"
  }
];

const projectIcons = {
  film: Clapperboard,
  market: ChartCandlestick,
  data: Dices
};

export function PersonalProjects({ block }: { block: Block }) {
  const projects = getProjects(block);

  return (
    <section className="personal-projects" aria-label="个人项目列表">
      <div className="personal-projects__grid">
        {projects.map((project) => {
          const ProjectIcon = projectIcons[project.icon];
          return (
            <article
              key={project.title}
              className="personal-projects__card"
              data-tone={project.tone}
            >
              <div className="personal-projects__card-top">
                <span>{project.eyebrow}</span>
                <i><ProjectIcon aria-hidden="true" /></i>
              </div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="personal-projects__card-footer">
                <a className="personal-projects__link" href={project.href} target="_blank" rel="noreferrer">
                  <Github aria-hidden="true" /> GITHUB <ArrowUpRight aria-hidden="true" />
                </a>
                {project.liveHref ? (
                  <a className="personal-projects__link personal-projects__link--live" href={project.liveHref} target="_blank" rel="noreferrer">
                    <Globe2 aria-hidden="true" /> 在线访问 <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getProjects(block: Block): ProjectItem[] {
  const projects = block.metadata?.projects;
  if (!Array.isArray(projects)) return fallbackProjects;

  const validProjects = projects.flatMap((project) => {
    if (!project || typeof project !== "object") return [];
    const entry = project as Record<string, unknown>;
    if (
      typeof entry.title !== "string" ||
      typeof entry.description !== "string" ||
      typeof entry.eyebrow !== "string" ||
      typeof entry.href !== "string" ||
      (entry.liveHref !== undefined && typeof entry.liveHref !== "string") ||
      (entry.icon !== "film" && entry.icon !== "market" && entry.icon !== "data") ||
      (entry.tone !== "mint" && entry.tone !== "blue" && entry.tone !== "yellow")
    ) return [];

    return [{
      title: entry.title,
      description: entry.description,
      eyebrow: entry.eyebrow,
      href: entry.href,
      liveHref: typeof entry.liveHref === "string" ? entry.liveHref : undefined,
      icon: entry.icon as ProjectItem["icon"],
      tone: entry.tone as ProjectItem["tone"]
    }];
  });

  return validProjects.length > 0 ? validProjects : fallbackProjects;
}
