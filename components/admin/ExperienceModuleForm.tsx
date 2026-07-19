"use client";

import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2
} from "lucide-react";
import { type CSSProperties, useState } from "react";
import type { Block } from "@/types/block";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import type { EditorLanguage } from "@/components/admin/editor-i18n";
import { BlockIcon } from "@/components/blocks/BlockIcon";
import { getExperienceTimelineMeta } from "@/lib/experience-timeline";
import { cn } from "@/lib/utils";

const experienceTones = [
  { tone: "#B23C22", deep: "#7E2A16", tint: "#F4EBE6" },
  { tone: "#B23C22", deep: "#B23C22", tint: "#F4EBE6" },
  { tone: "#B23C22", deep: "#7E2A16", tint: "#F4EBE6" },
  { tone: "#B23C22", deep: "#7E2A16", tint: "#F4EBE6" }
];

export function ExperienceModuleForm({
  heading,
  experiences,
  onPatchHeading,
  onPatchExperience,
  onReplaceExperiences,
  onSetVisibility,
  editorLanguage
}: {
  heading: Block;
  experiences: Block[];
  onPatchHeading: (patch: Partial<Block>) => void;
  onPatchExperience: (blockId: string, patch: Partial<Block>) => void;
  onReplaceExperiences: (blocks: Block[]) => void;
  onSetVisibility: (isVisible: boolean) => void;
  editorLanguage: EditorLanguage;
}) {
  const isZh = editorLanguage === "zh-CN";
  const isVisible = heading.isVisible && experiences.every((block) => block.isVisible);

  function addExperience() {
    const now = new Date().toISOString();
    const period = isZh ? "2026 年 1 月 - 至今" : "Jan 2026 - Present";
    const role = isZh ? "职位名称" : "Role";
    const company = isZh ? "公司名称" : "Company";
    const nextBlock: Block = {
      id: crypto.randomUUID(),
      sectionId: heading.sectionId,
      title: company,
      subtitle: `${role} · ${period}`,
      description: isZh ? "补充这段工作经历的职责、成果与代表项目。" : "Add responsibilities, outcomes and representative projects.",
      size: "wide",
      responsiveSizes: { desktop: "wide", mobile: "full-wide" },
      coverImage: "",
      icon: "building",
      badge: "",
      href: "",
      actionType: "modal",
      openInNewTab: false,
      backgroundColor: "",
      textColor: "",
      metadata: {
        modalTitle: `${company} · ${role}`,
        modalSubtitle: period,
        modalBody: isZh ? "补充详细的工作职责、项目经历与成果。" : "Add detailed responsibilities, projects and outcomes."
      },
      isVisible: true,
      isFeatured: false,
      sortOrder: experiences.at(-1)?.sortOrder ?? heading.sortOrder + 1,
      createdAt: now,
      updatedAt: now
    };
    onReplaceExperiences([...experiences, nextBlock]);
  }

  return (
    <div className="admin-experience-form grid gap-6 text-[#333]">
      <section className="grid gap-4 rounded-2xl border border-[#DADDD4] bg-[#F7F7F2] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#CFE8D5] bg-[#F4EBE6] text-[#21A655] shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-[#111]">{isZh ? "工作经历设置" : "Work experience"}</h3>
            <p className="text-xs text-[#7A8190]">
              {isZh ? "整组维护时间轴标题、任职时间、职位、摘要与详情。" : "Manage the timeline heading, dates, roles, summaries and details as one module."}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-[#E6E2D8] bg-white p-4 md:grid-cols-2">
          <Field label={isZh ? "主页模块标题" : "Homepage module title"}>
            <Input value={heading.title} onChange={(event) => onPatchHeading({ title: event.target.value })} />
          </Field>
          <Field label={isZh ? "英文眉题" : "Eyebrow"}>
            <Input value={heading.subtitle ?? ""} onChange={(event) => onPatchHeading({ subtitle: event.target.value })} />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-[#475569]">
          <Checkbox checked={isVisible} onChange={(event) => onSetVisibility(event.target.checked)} />
          {isZh ? "在主页显示整个工作经历模块" : "Show the complete work experience module"}
        </label>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#111]">{isZh ? "经历时间轴" : "Experience timeline"}</h3>
            <p className="text-xs text-[#7A8190]">
              {isZh ? `${experiences.length} 段经历 · 列表顺序就是主页展示顺序` : `${experiences.length} entries · list order matches the homepage`}
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addExperience}>
            <Plus className="h-4 w-4" /> {isZh ? "添加经历" : "Add experience"}
          </Button>
        </div>

        {experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D7D4CA] bg-[#FBFAF5] px-4 py-10 text-center text-sm text-[#8A877F]">
            {isZh ? "暂无工作经历，添加后会生成第一段时间轴。" : "No experience entries yet."}
          </div>
        ) : null}

        <div className="grid gap-3">
          {experiences.map((block, index) => (
            <ExperienceEntryEditor
              key={block.id}
              block={block}
              index={index}
              length={experiences.length}
              editorLanguage={editorLanguage}
              onPatch={(patch) => onPatchExperience(block.id, patch)}
              onMove={(direction) => onReplaceExperiences(moveItem(experiences, index, direction))}
              onDelete={() => onReplaceExperiences(experiences.filter((item) => item.id !== block.id))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExperienceModulePreview({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#D7D4CA] bg-[#F7F7F2] px-5 py-12 text-center text-sm text-[#8A877F]">
        暂无工作经历
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-[22px] border border-[#DDDAD0] bg-[#F7F7F2] p-4 shadow-[0_14px_35px_rgba(42,49,38,0.07)]">
      <div className="flex items-center justify-between px-1 font-mono text-[10px] font-bold tracking-[0.14em] text-[#667069]">
        <span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-[#21A655]" /> WORK EXPERIENCE</span>
        <span className="rounded-full border border-[#D8DFD5] bg-white/85 px-2.5 py-1">{String(blocks.length).padStart(2, "0")} ROLES</span>
      </div>
      <div className="grid gap-3">
        {blocks.map((block, index) => <ExperiencePreviewRow key={block.id} block={block} index={index} />)}
      </div>
    </div>
  );
}

function ExperienceEntryEditor({
  block,
  index,
  length,
  editorLanguage,
  onPatch,
  onMove,
  onDelete
}: {
  block: Block;
  index: number;
  length: number;
  editorLanguage: EditorLanguage;
  onPatch: (patch: Partial<Block>) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  const isZh = editorLanguage === "zh-CN";
  const [expanded, setExpanded] = useState(index === 0);
  const timeline = getExperienceTimelineMeta(block);
  const modalTitle = readMetadataText(block, "modalTitle");
  const modalSubtitle = readMetadataText(block, "modalSubtitle");
  const modalBody = readMetadataText(block, "modalBody");
  const configuredTenure = readMetadataText(block, "timelineTenure");

  function patchTimeline(nextRole: string, nextPeriod: string) {
    onPatch({ subtitle: [nextRole.trim(), nextPeriod.trim()].filter(Boolean).join(" · ") });
  }

  function patchMetadata(patch: Record<string, unknown>) {
    onPatch({ metadata: { ...(block.metadata ?? {}), ...patch } });
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#DFDDD4] bg-[#FBFAF5] shadow-sm">
      <div className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3 p-3">
        <ExperienceDateNode block={block} index={index} />
        <button type="button" onClick={() => setExpanded((current) => !current)} className="min-w-0 text-left">
          <p className="truncate text-sm font-black text-[#171714]">{block.title || (isZh ? "未命名公司" : "Untitled company")}</p>
          <p className="mt-0.5 truncate text-xs font-semibold" style={{ color: experienceTones[index % experienceTones.length].deep }}>{timeline.role || (isZh ? "未填写职位" : "Role not set")}</p>
          <p className="mt-1 line-clamp-1 text-xs text-[#777A73]">{block.description || (isZh ? "尚未填写经历摘要" : "No summary yet")}</p>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="grid h-8 w-8 place-items-center rounded-lg text-[#77746C] hover:bg-white disabled:opacity-25" title={isZh ? "上移" : "Move up"}><ArrowUp className="h-3.5 w-3.5" /></button>
          <button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className="grid h-8 w-8 place-items-center rounded-lg text-[#77746C] hover:bg-white disabled:opacity-25" title={isZh ? "下移" : "Move down"}><ArrowDown className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50" title={isZh ? "删除经历" : "Delete experience"}><Trash2 className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => setExpanded((current) => !current)} className="grid h-8 w-8 place-items-center rounded-lg text-[#77746C] hover:bg-white" aria-label={expanded ? (isZh ? "收起经历" : "Collapse experience") : (isZh ? "展开经历" : "Expand experience")}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-4 border-t border-[#E6E3DA] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={isZh ? "公司名称" : "Company"}>
              <Input value={block.title} onChange={(event) => onPatch({ title: event.target.value })} />
            </Field>
            <Field label={isZh ? "职位" : "Role"}>
              <Input value={timeline.role} onChange={(event) => patchTimeline(event.target.value, timeline.period)} />
            </Field>
            <Field label={isZh ? "任职时间" : "Period"}>
              <Input value={timeline.period} onChange={(event) => patchTimeline(timeline.role, event.target.value)} placeholder={isZh ? "2024 年 8 月 - 至今" : "Aug 2024 - Present"} />
            </Field>
            <Field label={isZh ? "在职时长覆盖值" : "Tenure override"}>
              <Input value={configuredTenure} onChange={(event) => patchMetadata({ timelineTenure: event.target.value })} placeholder={timeline.tenure} />
            </Field>
          </div>

          <Field label={isZh ? "主页摘要" : "Homepage summary"}>
            <Textarea value={block.description ?? ""} onChange={(event) => onPatch({ description: event.target.value })} className="min-h-28" />
          </Field>

          <section className="grid gap-3 rounded-2xl border border-[#E6EDF7] bg-[#F8FAFD] p-4">
            <div>
              <h4 className="font-bold text-[#111]">{isZh ? "Details 详情弹窗" : "Details modal"}</h4>
              <p className="mt-1 text-xs text-[#7A8190]">{isZh ? "对应前台卡片左下角的 Details 按钮。" : "Shown by the Details button on the homepage card."}</p>
            </div>
            <Field label={isZh ? "弹窗标题" : "Modal title"}>
              <Input value={modalTitle} onChange={(event) => patchMetadata({ modalTitle: event.target.value })} />
            </Field>
            <Field label={isZh ? "弹窗时间说明" : "Modal period"}>
              <Input value={modalSubtitle} onChange={(event) => patchMetadata({ modalSubtitle: event.target.value })} />
            </Field>
            <Field label={isZh ? "详细内容" : "Details"}>
              <Textarea value={modalBody} onChange={(event) => patchMetadata({ modalBody: event.target.value })} className="min-h-64" />
            </Field>
          </section>

          <label className="flex items-center gap-2 text-sm font-medium text-[#475569]">
            <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
            {isZh ? "显示这段经历" : "Show this experience"}
          </label>
        </div>
      ) : null}
    </article>
  );
}

function ExperiencePreviewRow({ block, index }: { block: Block; index: number }) {
  const timeline = getExperienceTimelineMeta(block);
  const tone = experienceTones[index % experienceTones.length];
  return (
    <article className={cn("grid min-h-40 grid-cols-[5.4rem_minmax(0,1fr)] gap-3", !block.isVisible && "opacity-50 grayscale-[0.2]")}>
      <ExperienceDateNode block={block} index={index} />
      <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_7rem] gap-4 overflow-hidden rounded-[18px] border border-[#DDDAD0] bg-white p-4 shadow-[0_8px_22px_rgba(28,34,24,0.06)]">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-black tracking-[-0.035em] text-[#111]">{block.title}</h3>
          <p className="mt-1 text-xs font-bold" style={{ color: tone.deep }}>{timeline.role}</p>
          <p className="mt-4 line-clamp-3 text-xs leading-5 text-[#666B65]">{block.description}</p>
          <span className="mt-4 inline-flex rounded-full px-3 py-1 font-mono text-[9px] font-bold tracking-[0.12em]" style={{ backgroundColor: tone.tint, color: tone.deep }}>DETAILS ↗</span>
        </div>
        <div className="flex flex-col items-end justify-between">
          <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold text-[#4E554E]" style={{ borderColor: tone.tone, backgroundColor: tone.tint }}>{timeline.tenure}</span>
          <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl" style={{ backgroundColor: tone.tint, color: tone.deep }}>
            <BlockIcon name={block.icon || "briefcase"} className="h-8 w-8" />
          </span>
        </div>
      </div>
    </article>
  );
}

function ExperienceDateNode({ block, index }: { block: Block; index: number }) {
  const timeline = getExperienceTimelineMeta(block);
  const tone = experienceTones[index % experienceTones.length];
  return (
    <span
      className="grid min-h-[5rem] content-center justify-items-center gap-1 rounded-2xl px-2 text-center shadow-[0_4px_0_-1px_var(--experience-deep)]"
      style={{ backgroundColor: tone.tone, color: "#111", "--experience-deep": tone.deep } as CSSProperties}
    >
      <small className="font-mono text-[8px] font-bold tracking-[0.08em] opacity-70">任职时间</small>
      <b className="text-[11px] leading-none">{timeline.startLabel}</b>
      <i className="h-px w-6 bg-current opacity-35" />
      <b className="text-[11px] leading-none">{timeline.endLabel}</b>
    </span>
  );
}

function readMetadataText(block: Block, key: string) {
  const value = block.metadata?.[key];
  return typeof value === "string" ? value : "";
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}
