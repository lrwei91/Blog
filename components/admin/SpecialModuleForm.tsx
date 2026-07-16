"use client";

import { ArrowDown, ArrowUp, FolderKanban, MapPinned, Plus, Trash2 } from "lucide-react";
import type { Block } from "@/types/block";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import type { EditorLanguage } from "@/components/admin/editor-i18n";

export type TravelLocationEditorItem = {
  city: string;
  province: string;
  note: string;
  longitude: number;
  latitude: number;
};

export type PersonalProjectEditorItem = {
  title: string;
  description: string;
  eyebrow: string;
  href: string;
  liveHref?: string;
  icon: "film" | "market" | "data";
  tone: "mint" | "blue" | "yellow";
};

export function getSpecialModuleType(block: Block): "travel" | "projects" | null {
  if (Array.isArray(block.metadata?.travelLocations)) return "travel";
  if (Array.isArray(block.metadata?.projects)) return "projects";
  return null;
}

export function SpecialModuleForm({
  block,
  onPatch,
  editorLanguage
}: {
  block: Block;
  onPatch: (patch: Partial<Block>) => void;
  editorLanguage: EditorLanguage;
}) {
  const moduleType = getSpecialModuleType(block);
  if (!moduleType) return null;

  const isZh = editorLanguage === "zh-CN";
  const patchMetadata = (patch: Record<string, unknown>) =>
    onPatch({ metadata: { ...(block.metadata ?? {}), ...patch } });

  return (
    <div className="admin-special-form grid gap-6 text-[#333]">
      <section className="grid gap-4 rounded-2xl border border-[#E6EDF7] bg-[#F8FAFD] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#21B95B] shadow-sm">
            {moduleType === "travel" ? <MapPinned className="h-5 w-5" /> : <FolderKanban className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="font-bold text-[#111]">
              {moduleType === "travel" ? (isZh ? "旅行足迹设置" : "Travel footprint") : isZh ? "个人项目设置" : "Personal projects"}
            </h3>
            <p className="text-xs text-[#7A8190]">
              {isZh ? "这里的修改会直接同步到主页对应模块。" : "Changes here are reflected in the matching homepage module."}
            </p>
          </div>
        </div>

        {moduleType === "travel" ? (
          <>
            <Field label={isZh ? "模块引导标题" : "Module headline"}>
              <Input value={block.title} onChange={(event) => onPatch({ title: event.target.value })} />
            </Field>
            <Field label={isZh ? "模块说明" : "Module description"}>
              <Textarea value={block.description ?? ""} onChange={(event) => onPatch({ description: event.target.value })} />
            </Field>
          </>
        ) : null}

        <label className="flex items-center gap-2 text-sm font-medium text-[#475569]">
          <Checkbox checked={block.isVisible} onChange={(event) => onPatch({ isVisible: event.target.checked })} />
          {isZh ? "在主页显示此模块" : "Show this module on the homepage"}
        </label>
      </section>

      {moduleType === "travel" ? (
        <TravelLocationsEditor
          locations={readTravelLocations(block.metadata?.travelLocations)}
          onChange={(travelLocations) => patchMetadata({ travelLocations })}
          editorLanguage={editorLanguage}
        />
      ) : (
        <PersonalProjectsEditor
          projects={readPersonalProjects(block.metadata?.projects)}
          onChange={(projects) => patchMetadata({ projects })}
          editorLanguage={editorLanguage}
        />
      )}
    </div>
  );
}

export function SpecialModulePreview({ block }: { block: Block }) {
  const moduleType = getSpecialModuleType(block);
  if (moduleType === "travel") {
    const locations = readTravelLocations(block.metadata?.travelLocations);
    return (
      <div className="flex h-full min-h-48 flex-col justify-between overflow-hidden rounded-[20px] border border-emerald-200 bg-[#10201d] p-6 text-white">
        <div className="flex items-center justify-between font-mono text-xs tracking-[0.18em] text-emerald-300">
          <span className="flex items-center gap-2"><MapPinned className="h-4 w-4" /> TRAVEL LOG</span>
          <span>{String(locations.length).padStart(2, "0")} PLACES</span>
        </div>
        <div>
          <h3 className="mt-8 text-2xl font-black">{block.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-white/65">{block.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {locations.length > 0 ? locations.map((location, index) => (
            <span key={`${index}-${location.city}`} className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
              {location.city} · {location.province}
            </span>
          )) : <span className="text-sm text-white/45">暂无地点</span>}
        </div>
      </div>
    );
  }

  if (moduleType === "projects") {
    const projects = readPersonalProjects(block.metadata?.projects);
    return (
      <div className="h-full min-h-48 rounded-[20px] border border-[#D9E2F0] bg-[#F7F7F2] p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-[#64748B]"><FolderKanban className="h-4 w-4" /> PERSONAL PROJECTS</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#475569]">{projects.length} 项</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {projects.length > 0 ? projects.map((project, index) => (
            <div key={`${index}-${project.title}`} className="min-w-0 rounded-2xl border border-black/10 bg-white/70 p-4">
              <p className="truncate font-mono text-[10px] tracking-[0.12em] text-[#64748B]">{project.eyebrow}</p>
              <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-black text-[#111]">{project.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#64748B]">{project.description}</p>
            </div>
          )) : <div className="md:col-span-3 rounded-2xl border border-dashed border-[#CBD5E1] py-8 text-center text-sm text-[#7A8190]">暂无项目</div>}
        </div>
      </div>
    );
  }

  return null;
}

function TravelLocationsEditor({
  locations,
  onChange,
  editorLanguage
}: {
  locations: TravelLocationEditorItem[];
  onChange: (locations: TravelLocationEditorItem[]) => void;
  editorLanguage: EditorLanguage;
}) {
  const isZh = editorLanguage === "zh-CN";
  const updateLocation = (index: number, patch: Partial<TravelLocationEditorItem>) =>
    onChange(locations.map((location, itemIndex) => (itemIndex === index ? { ...location, ...patch } : location)));

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#111]">{isZh ? "地点列表" : "Locations"}</h3>
          <p className="text-xs text-[#7A8190]">{isZh ? "经纬度用于在中国地图上定位标记。" : "Coordinates place each marker on the China map."}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange([
              ...locations,
              { city: isZh ? "新地点" : "New place", province: isZh ? "省份" : "Province", note: isZh ? "已到访" : "Visited", longitude: 119.3, latitude: 26.08 }
            ])
          }
        >
          <Plus className="h-4 w-4" /> {isZh ? "添加地点" : "Add location"}
        </Button>
      </div>

      {locations.length === 0 ? (
        <EmptyState text={isZh ? "暂无地点，添加后会显示在地图和足迹列表中。" : "No locations yet."} />
      ) : null}

      {locations.map((location, index) => (
        <article key={`${index}-${location.city}`} className="grid gap-4 rounded-2xl border border-[#E6EDF7] bg-white p-4 shadow-sm">
          <ItemToolbar
            label={`${String(index + 1).padStart(2, "0")} · ${location.city || (isZh ? "未命名地点" : "Untitled location")}`}
            index={index}
            length={locations.length}
            onMove={(direction) => onChange(moveItem(locations, index, direction))}
            onDelete={() => onChange(locations.filter((_, itemIndex) => itemIndex !== index))}
            editorLanguage={editorLanguage}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={isZh ? "城市 / 地区" : "City / Area"}>
              <Input value={location.city} onChange={(event) => updateLocation(index, { city: event.target.value })} />
            </Field>
            <Field label={isZh ? "省份" : "Province"}>
              <Input value={location.province} onChange={(event) => updateLocation(index, { province: event.target.value })} />
            </Field>
            <Field label={isZh ? "足迹说明" : "Note"} className="md:col-span-2">
              <Input value={location.note} onChange={(event) => updateLocation(index, { note: event.target.value })} />
            </Field>
            <Field label={isZh ? "经度（73–135）" : "Longitude (73–135)"}>
              <Input type="number" min="73" max="135" step="0.01" value={location.longitude} onChange={(event) => updateLocation(index, { longitude: Number(event.target.value) })} />
            </Field>
            <Field label={isZh ? "纬度（17–54）" : "Latitude (17–54)"}>
              <Input type="number" min="17" max="54" step="0.01" value={location.latitude} onChange={(event) => updateLocation(index, { latitude: Number(event.target.value) })} />
            </Field>
          </div>
        </article>
      ))}
    </section>
  );
}

function PersonalProjectsEditor({
  projects,
  onChange,
  editorLanguage
}: {
  projects: PersonalProjectEditorItem[];
  onChange: (projects: PersonalProjectEditorItem[]) => void;
  editorLanguage: EditorLanguage;
}) {
  const isZh = editorLanguage === "zh-CN";
  const updateProject = (index: number, patch: Partial<PersonalProjectEditorItem>) =>
    onChange(projects.map((project, itemIndex) => (itemIndex === index ? { ...project, ...patch } : project)));

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#111]">{isZh ? "项目列表" : "Projects"}</h3>
          <p className="text-xs text-[#7A8190]">{isZh ? "GitHub 链接必填，在线地址可选。" : "GitHub URL is required; live URL is optional."}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange([
              ...projects,
              {
                title: isZh ? "新项目" : "New project",
                description: isZh ? "补充项目简介" : "Add a short project description",
                eyebrow: `PROJECT · ${String(projects.length + 1).padStart(2, "0")}`,
                href: "https://github.com/",
                liveHref: "",
                icon: "data",
                tone: "mint"
              }
            ])
          }
        >
          <Plus className="h-4 w-4" /> {isZh ? "添加项目" : "Add project"}
        </Button>
      </div>

      {projects.length === 0 ? <EmptyState text={isZh ? "暂无项目，添加后会显示为主页项目卡片。" : "No projects yet."} /> : null}

      {projects.map((project, index) => (
        <article key={`${index}-${project.title}`} className="grid gap-4 rounded-2xl border border-[#E6EDF7] bg-white p-4 shadow-sm">
          <ItemToolbar
            label={`${String(index + 1).padStart(2, "0")} · ${project.title || (isZh ? "未命名项目" : "Untitled project")}`}
            index={index}
            length={projects.length}
            onMove={(direction) => onChange(moveItem(projects, index, direction))}
            onDelete={() => onChange(projects.filter((_, itemIndex) => itemIndex !== index))}
            editorLanguage={editorLanguage}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={isZh ? "项目名称" : "Project name"}>
              <Input value={project.title} onChange={(event) => updateProject(index, { title: event.target.value })} />
            </Field>
            <Field label={isZh ? "卡片眉题" : "Eyebrow"}>
              <Input value={project.eyebrow} onChange={(event) => updateProject(index, { eyebrow: event.target.value })} />
            </Field>
            <Field label={isZh ? "项目简介" : "Description"} className="md:col-span-2">
              <Textarea value={project.description} onChange={(event) => updateProject(index, { description: event.target.value })} />
            </Field>
            <Field label="GitHub URL">
              <Input type="url" value={project.href} onChange={(event) => updateProject(index, { href: event.target.value })} placeholder="https://github.com/..." />
            </Field>
            <Field label={isZh ? "在线访问 URL（可选）" : "Live URL (optional)"}>
              <Input type="url" value={project.liveHref ?? ""} onChange={(event) => updateProject(index, { liveHref: event.target.value })} placeholder="https://..." />
            </Field>
            <Field label={isZh ? "图标" : "Icon"}>
              <Select value={project.icon} onChange={(event) => updateProject(index, { icon: event.target.value as PersonalProjectEditorItem["icon"] })}>
                <option value="film">{isZh ? "影视" : "Film"}</option>
                <option value="market">{isZh ? "行情" : "Market"}</option>
                <option value="data">{isZh ? "数据" : "Data"}</option>
              </Select>
            </Field>
            <Field label={isZh ? "配色" : "Color"}>
              <Select value={project.tone} onChange={(event) => updateProject(index, { tone: event.target.value as PersonalProjectEditorItem["tone"] })}>
                <option value="mint">{isZh ? "薄荷绿" : "Mint"}</option>
                <option value="blue">{isZh ? "天蓝" : "Blue"}</option>
                <option value="yellow">{isZh ? "暖黄" : "Yellow"}</option>
              </Select>
            </Field>
          </div>
        </article>
      ))}
    </section>
  );
}

function ItemToolbar({
  label,
  index,
  length,
  onMove,
  onDelete,
  editorLanguage
}: {
  label: string;
  index: number;
  length: number;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  editorLanguage: EditorLanguage;
}) {
  const isZh = editorLanguage === "zh-CN";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F7] pb-3">
      <strong className="min-w-0 truncate text-sm text-[#111]">{label}</strong>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon" disabled={index === 0} title={isZh ? "上移" : "Move up"} onClick={() => onMove(-1)}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={index === length - 1} title={isZh ? "下移" : "Move down"} onClick={() => onMove(1)}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" title={isZh ? "删除" : "Delete"} className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[#D9E2F0] bg-[#F8FAFD] px-4 py-8 text-center text-sm text-[#7A8190]">{text}</div>;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function readTravelLocations(value: unknown): TravelLocationEditorItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    return [{
      city: typeof entry.city === "string" ? entry.city : "",
      province: typeof entry.province === "string" ? entry.province : "",
      note: typeof entry.note === "string" ? entry.note : "",
      longitude: typeof entry.longitude === "number" ? entry.longitude : 119.3,
      latitude: typeof entry.latitude === "number" ? entry.latitude : 26.08
    }];
  });
}

function readPersonalProjects(value: unknown): PersonalProjectEditorItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    return [{
      title: typeof entry.title === "string" ? entry.title : "",
      description: typeof entry.description === "string" ? entry.description : "",
      eyebrow: typeof entry.eyebrow === "string" ? entry.eyebrow : "",
      href: typeof entry.href === "string" ? entry.href : "",
      liveHref: typeof entry.liveHref === "string" ? entry.liveHref : "",
      icon: entry.icon === "film" || entry.icon === "market" || entry.icon === "data" ? entry.icon : "data",
      tone: entry.tone === "mint" || entry.tone === "blue" || entry.tone === "yellow" ? entry.tone : "mint"
    }];
  });
}
