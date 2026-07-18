"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Eye,
  EyeOff,
  GripVertical,
  Layers3,
  Pencil,
  RotateCcw,
  Search,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ContentOutlineGroup, OutlineSpecialModuleType } from "@/lib/admin-content-outline";
import type { EditorLanguage } from "@/components/admin/editor-i18n";
import { cn, isSectionTextBlock } from "@/lib/utils";

type VisibilityFilter = "all" | "visible" | "hidden";

export function PageStructurePanel({
  groups,
  selectedBlockId,
  isDocked,
  canUndo,
  editorLanguage,
  onClose,
  onSelect,
  onEdit,
  onEditBlock,
  onToggleVisibility,
  onReorder,
  onMove,
  onUndo
}: {
  groups: ContentOutlineGroup[];
  selectedBlockId: string | null;
  isDocked: boolean;
  canUndo: boolean;
  editorLanguage: EditorLanguage;
  onClose: () => void;
  onSelect: (group: ContentOutlineGroup) => void;
  onEdit: (group: ContentOutlineGroup) => void;
  onEditBlock: (blockId: string) => void;
  onToggleVisibility: (group: ContentOutlineGroup) => void;
  onReorder: (activeGroupId: string, overGroupId: string) => void;
  onMove: (groupId: string, targetIndex: number) => void;
  onUndo: () => void;
}) {
  const isZh = editorLanguage === "zh-CN";
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredGroups = useMemo(
    () => groups.filter((group) => {
      if (visibility === "visible" && !group.isVisible) return false;
      if (visibility === "hidden" && group.isVisible) return false;
      if (!normalizedQuery) return true;
      return [group.title, group.subtitle, getModuleTypeLabel(group.moduleType, editorLanguage)]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    }),
    [editorLanguage, groups, normalizedQuery, visibility]
  );
  const isFiltered = Boolean(normalizedQuery) || visibility !== "all";

  function handleDragEnd(event: DragEndEvent) {
    if (isFiltered || !event.over || event.active.id === event.over.id) return;
    onReorder(String(event.active.id), String(event.over.id));
  }

  function toggleExpanded(groupId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "admin-structure-panel fixed bottom-5 left-4 top-[76px] z-30 flex w-[304px] flex-col overflow-hidden rounded-[26px] border border-[#DAD8CF] bg-[#FBFAF4]/95 shadow-[0_28px_70px_rgba(16,22,25,0.18)] backdrop-blur-xl",
        !isDocked && "z-[45]"
      )}
      aria-label={isZh ? "页面结构" : "Page structure"}
    >
      <header className="border-b border-[#E5E1D6] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#208B49]">
              <Layers3 className="h-4 w-4" /> {isZh ? "页面结构" : "PAGE STRUCTURE"}
            </p>
            <p className="mt-1 text-xs text-[#77746C]">{isZh ? `${groups.length} 个模块 · 个人资料固定在顶部` : `${groups.length} modules · Profile stays first`}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-[#DEDCD4] bg-white text-[#68665F] hover:bg-[#F1EFE7]" aria-label={isZh ? "收起页面结构" : "Close page structure"}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-[#DDDAD0] bg-white px-3 text-[#77746C] focus-within:border-[#21B95B] focus-within:ring-4 focus-within:ring-[#5EDB88]/15">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="admin-structure-panel__search-input min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" placeholder={isZh ? "搜索模块" : "Search modules"} />
        </label>

        <div className="mt-3 flex items-center gap-1 rounded-xl bg-[#EFEEE7] p-1">
          {(["all", "visible", "hidden"] as VisibilityFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              className={cn("flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition", visibility === value ? "bg-white text-[#111] shadow-sm" : "text-[#77746C] hover:text-[#111]")}
            >
              {value === "all" ? (isZh ? "全部" : "All") : value === "visible" ? (isZh ? "已发布" : "Published") : (isZh ? "已隐藏" : "Hidden")}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setExpandedIds(new Set(groups.map((group) => group.id)))} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#66635C] hover:bg-white">
              {isZh ? "全部展开" : "Expand all"}
            </button>
            <button type="button" onClick={() => setExpandedIds(new Set())} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#66635C] hover:bg-white">
              {isZh ? "全部收起" : "Collapse all"}
            </button>
          </div>
          <button type="button" disabled={!canUndo} onClick={onUndo} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#208B49] hover:bg-[#E8F7E9] disabled:cursor-not-allowed disabled:opacity-35">
            <RotateCcw className="h-3.5 w-3.5" /> {isZh ? "撤销排序" : "Undo"}
          </button>
        </div>
        {isFiltered ? <p className="mt-2 text-[10px] leading-4 text-[#A06C16]">{isZh ? "筛选中仅支持定位和编辑；清除筛选后可排序。" : "Clear filters to reorder modules."}</p> : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D4C8] px-4 py-10 text-center text-sm text-[#8A877F]">{isZh ? "没有匹配的模块" : "No matching modules"}</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredGroups.map((group) => group.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-2">
                {filteredGroups.map((group) => {
                  const groupIndex = groups.findIndex((item) => item.id === group.id);
                  return (
                    <SortableOutlineGroup
                      key={group.id}
                      group={group}
                      index={groupIndex}
                      total={groups.length}
                      selected={selectedBlockId !== null && group.blockIds.includes(selectedBlockId)}
                      expanded={expandedIds.has(group.id)}
                      disabled={isFiltered}
                      editorLanguage={editorLanguage}
                      onToggleExpanded={() => toggleExpanded(group.id)}
                      onSelect={() => onSelect(group)}
                      onEdit={() => onEdit(group)}
                      onEditBlock={onEditBlock}
                      onToggleVisibility={() => onToggleVisibility(group)}
                      onMove={(targetIndex) => onMove(group.id, targetIndex)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </aside>
  );
}

function SortableOutlineGroup({
  group,
  index,
  total,
  selected,
  expanded,
  disabled,
  editorLanguage,
  onToggleExpanded,
  onSelect,
  onEdit,
  onEditBlock,
  onToggleVisibility,
  onMove
}: {
  group: ContentOutlineGroup;
  index: number;
  total: number;
  selected: boolean;
  expanded: boolean;
  disabled: boolean;
  editorLanguage: EditorLanguage;
  onToggleExpanded: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onEditBlock: (blockId: string) => void;
  onToggleVisibility: () => void;
  onMove: (targetIndex: number) => void;
}) {
  const isZh = editorLanguage === "zh-CN";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, disabled });
  const contentCount = group.headingId ? group.blocks.length - 1 : group.blocks.length;

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition",
        selected ? "border-[#21B95B] ring-4 ring-[#5EDB88]/12" : "border-[#E2DFD5]",
        isDragging && "z-10 opacity-55 shadow-xl"
      )}
    >
      <div className="flex items-start gap-1.5 p-2.5">
        <button
          type="button"
          disabled={disabled}
          className="mt-0.5 grid h-8 w-7 shrink-0 touch-none place-items-center rounded-lg text-[#A09C92] hover:bg-[#F1EFE7] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-30"
          title={disabled ? (isZh ? "清除筛选后可排序" : "Clear filters to reorder") : (isZh ? "拖动排序；也支持键盘操作" : "Drag or use keyboard to reorder")}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#A09C92]">{String(index + 1).padStart(2, "0")}</span>
            {group.moduleType ? <span className="rounded-full bg-[#E8F7E9] px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-[#208B49]">{getModuleTypeLabel(group.moduleType, editorLanguage)}</span> : null}
          </div>
          <p className="mt-1 truncate text-sm font-bold text-[#171714]">{group.title}</p>
          <p className="mt-0.5 text-[10px] text-[#89867E]">{isZh ? `${contentCount} 个内容 · ${group.visibleCount}/${group.blocks.length} 显示` : `${contentCount} items · ${group.visibleCount}/${group.blocks.length} visible`}</p>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onToggleVisibility} className={cn("grid h-8 w-8 place-items-center rounded-lg hover:bg-[#F1EFE7]", group.isVisible ? "text-[#208B49]" : "text-[#A09C92]")} title={group.isVisible ? (isZh ? "隐藏整个模块" : "Hide module") : (isZh ? "发布整个模块" : "Publish module")}>
            {group.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-lg text-[#4E4C46] hover:bg-[#EAF4FF] hover:text-[#1878C8]" title={isZh ? "编辑模块" : "Edit module"}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToggleExpanded} className="grid h-8 w-8 place-items-center rounded-lg text-[#77746C] hover:bg-[#F1EFE7]" title={expanded ? (isZh ? "收起" : "Collapse") : (isZh ? "展开" : "Expand")}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-[#ECE9DF] bg-[#F8F7F1] px-3 py-2.5">
          <div className="grid gap-1">
            {group.blocks.map((block) => (
              <button key={block.id} type="button" onClick={() => onEditBlock(block.id)} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-[#65625B] hover:bg-white hover:text-[#111]">
                <span className="truncate">{isSectionTextBlock(block) ? (isZh ? "标题" : "Heading") : (block.title || (isZh ? "未命名内容" : "Untitled"))}</span>
                <Pencil className="h-3 w-3 shrink-0 opacity-55" />
              </button>
            ))}
          </div>
          {!disabled ? (
            <div className="mt-2 grid grid-cols-4 gap-1 border-t border-[#E7E3D9] pt-2">
              <MoveButton icon={<ChevronsUp className="h-3.5 w-3.5" />} label={isZh ? "置顶" : "First"} disabled={index === 0} onClick={() => onMove(0)} />
              <MoveButton icon={<ArrowUp className="h-3.5 w-3.5" />} label={isZh ? "上移" : "Up"} disabled={index === 0} onClick={() => onMove(index - 1)} />
              <MoveButton icon={<ArrowDown className="h-3.5 w-3.5" />} label={isZh ? "下移" : "Down"} disabled={index === total - 1} onClick={() => onMove(index + 1)} />
              <MoveButton icon={<ChevronsDown className="h-3.5 w-3.5" />} label={isZh ? "置底" : "Last"} disabled={index === total - 1} onClick={() => onMove(total - 1)} />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function MoveButton({ icon, label, disabled, onClick }: { icon: React.ReactNode; label: string; disabled: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[9px] font-semibold text-[#6F6C64] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30">{icon}{label}</button>;
}

function getModuleTypeLabel(type: OutlineSpecialModuleType | null, language: EditorLanguage) {
  const isZh = language === "zh-CN";
  if (type === "experience") return isZh ? "经历" : "EXPERIENCE";
  if (type === "travel") return isZh ? "旅行" : "TRAVEL";
  if (type === "projects") return isZh ? "项目" : "PROJECTS";
  if (type === "now") return "NOW";
  if (type === "media") return isZh ? "书影音" : "MEDIA";
  if (type === "photos") return isZh ? "照片" : "PHOTOS";
  return isZh ? "普通" : "BLOCKS";
}
