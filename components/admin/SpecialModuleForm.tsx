"use client";

import { ArrowDown, ArrowUp, BookOpen, BriefcaseBusiness, Camera, ChevronDown, ChevronRight, ExternalLink, FolderKanban, MapPin, MapPinned, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Block } from "@/types/block";
import type { DoubanMediaSource, LifeModuleType, MediaItem, NowStatus, PhotoStory } from "@/types/life-modules";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import type { EditorLanguage } from "@/components/admin/editor-i18n";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { getDoubanWatchlistProgress, readDoubanMediaSource, readMediaItems, readNowStatus, readPhotoStories, sortMediaItemsByMarkedAt } from "@/lib/life-modules";
import { CHINA_MAP_VIEW_BOX, chinaProvincePaths } from "@/lib/china-map-paths";

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

export type SpecialModuleType = "experience" | "travel" | "projects" | LifeModuleType;

export function getSpecialModuleType(block: Block): Exclude<SpecialModuleType, "experience"> | null {
 if (Array.isArray(block.metadata?.travelLocations)) return "travel";
 if (Array.isArray(block.metadata?.projects)) return "projects";
 if (block.metadata?.nowStatus && typeof block.metadata.nowStatus === "object") return "now";
 if (Array.isArray(block.metadata?.mediaItems)) return "media";
 if (Array.isArray(block.metadata?.photoStories)) return "photos";
 return null;
}

export function SpecialModuleForm({
 block,
 heading,
 onPatch,
 onPatchHeading,
 editorLanguage
}: {
 block: Block;
 heading?: Block;
 onPatch: (patch: Partial<Block>) => void;
 onPatchHeading?: (patch: Partial<Block>) => void;
 editorLanguage: EditorLanguage;
}) {
 const moduleType = getSpecialModuleType(block);
 if (!moduleType) return null;

 const isZh = editorLanguage === "zh-CN";
 const patchMetadata = (patch: Record<string, unknown>) =>
 onPatch({ metadata: { ...(block.metadata ?? {}), ...patch } });

 return (
 <div className="admin-special-form grid gap-6 text-[#1F2328]">
 <section className="grid gap-4 rounded-[12px] border border-[#FFF0EB] bg-[#FFF0EB] p-4">
 <div className="flex items-center gap-3">
 <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#FFFFFF] text-[#C0452A]">
 <SpecialModuleIcon type={moduleType} />
 </span>
 <div>
 <h3 className="font-bold text-[#1F2328]">
 {getModuleTitle(moduleType, editorLanguage)}
 </h3>
 <p className="text-xs text-[#62605B]">
 {isZh ? "这里的修改会直接同步到主页对应模块。" : "Changes here are reflected in the matching homepage module."}
 </p>
 </div>
 </div>

 {heading && onPatchHeading ? (
 <div className="grid gap-3 rounded-[12px] border border-[#E7E2D9] bg-[#FFFFFF] p-4 md:grid-cols-2">
 <Field label={isZh ? "主页模块标题" : "Homepage module title"}>
 <Input value={heading.title} onChange={(event) => onPatchHeading({ title: event.target.value })} />
 </Field>
 <Field label={isZh ? "英文眉题" : "Eyebrow"}>
 <Input value={heading.subtitle ?? ""} onChange={(event) => onPatchHeading({ subtitle: event.target.value })} />
 </Field>
 </div>
 ) : null}

 {moduleType === "travel" ? (
 <>
 <Field label={isZh ? "地图说明标题" : "Map headline"}>
 <Input value={block.title} onChange={(event) => onPatch({ title: event.target.value })} />
 </Field>
 <Field label={isZh ? "地图说明" : "Map description"}>
 <Textarea value={block.description ?? ""} onChange={(event) => onPatch({ description: event.target.value })} />
 </Field>
 </>
 ) : null}

 <label className="flex items-center gap-2 text-sm font-medium text-[#62605B]">
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
 ) : moduleType === "projects" ? (
 <PersonalProjectsEditor
 projects={readPersonalProjects(block.metadata?.projects)}
 onChange={(projects) => patchMetadata({ projects })}
 editorLanguage={editorLanguage}
 />
 ) : moduleType === "now" ? (
 <NowStatusEditor
 status={readNowStatus(block.metadata?.nowStatus)}
 onChange={(nowStatus) => patchMetadata({ nowStatus })}
 editorLanguage={editorLanguage}
 />
 ) : moduleType === "media" ? (
 <MediaItemsEditor
 items={readMediaItems(block.metadata?.mediaItems)}
 source={readDoubanMediaSource(block.metadata?.mediaSource)}
 onChange={(mediaItems) => patchMetadata({ mediaItems })}
 onSourceChange={(mediaSource) => patchMetadata({ mediaSource })}
 onSync={(mediaSource, mediaItems) => patchMetadata({ mediaSource, mediaItems })}
 editorLanguage={editorLanguage}
 />
 ) : (
 <PhotoStoriesEditor
 stories={readPhotoStories(block.metadata?.photoStories)}
 onChange={(photoStories) => patchMetadata({ photoStories })}
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
 <div className="relative flex h-full min-h-48 overflow-hidden rounded-[16px] border border-[#F1EEE8] bg-[#F1EEE8] p-5 text-[#1F2328]">
 <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between pr-4">
 <div className="flex items-center justify-between gap-3 text-[10px] font-bold tracking-[0.16em] text-[#C0452A]">
 <span className="flex min-w-0 items-center gap-2"><MapPinned className="h-4 w-4 shrink-0" /> <span className="truncate">TRAVEL FOOTPRINT</span></span>
 <span className="shrink-0 whitespace-nowrap rounded-[16px] border border-[#FFF0EB] bg-[#FFFFFF]/80 px-2.5 py-1">{String(locations.length).padStart(2, "0")} PLACES</span>
 </div>
 <div>
 <h3 className="mt-5 line-clamp-2 text-2xl font-bold tracking-[-0.03em]">{block.title}</h3>
 <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-[#62605B]">{block.description}</p>
 </div>
 <div className="mt-5 flex flex-wrap gap-1.5">
 {locations.length > 0 ? locations.slice(0, 5).map((location, index) => (
 <span key={`${index}-${location.city}`} className="whitespace-nowrap rounded-[16px] border border-[#F1EEE8] bg-[#FFFFFF]/85 px-2.5 py-1 text-[10px] font-bold text-[#62605B]">
 {location.city} · {location.province}
 </span>
 )) : <span className="text-sm text-[#62605B]">暂无地点</span>}
 </div>
 </div>
 <div className="relative hidden w-[34%] min-w-[180px] items-center justify-center overflow-hidden rounded-[12px] border border-[#F1EEE8] bg-[#FFFFFF]/65 md:flex">
 <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(#F3C8BA_1px,transparent_1px),linear-gradient(90deg,#F3C8BA_1px,transparent_1px)] [background-size:22px_22px]" />
 <svg viewBox={CHINA_MAP_VIEW_BOX} className="relative z-10 w-[88%] drop-" aria-hidden="true">
 <g>
 {chinaProvincePaths.map((province) => (
 <path
 key={province.adcode}
 d={province.d}
 fill={locations.some((location) => province.name.includes(location.province)) ? "#E45435" : "#F1EEE8"}
 stroke="#62605B"
 strokeWidth="1.2"
 />
 ))}
 </g>
 </svg>
 </div>
 </div>
 );
 }

 if (moduleType === "projects") {
 const projects = readPersonalProjects(block.metadata?.projects);
 return (
 <div className="h-full min-h-48 rounded-[16px] border border-[#FFF0EB] bg-[#F8F7F4] p-5">
 <div className="flex items-center justify-between gap-3">
 <span className="flex min-w-0 items-center gap-2 text-xs tracking-[0.16em] text-[#62605B]"><FolderKanban className="h-4 w-4 shrink-0" /> <span className="truncate">PERSONAL PROJECTS</span></span>
 <span className="shrink-0 whitespace-nowrap rounded-[16px] bg-[#FFFFFF] px-3 py-1 text-xs font-bold text-[#62605B]">{projects.length} 项</span>
 </div>
 <div className="mt-5 grid gap-3 md:grid-cols-3">
 {projects.length > 0 ? projects.map((project, index) => (
 <div key={`${index}-${project.title}`} className="min-w-0 rounded-[12px] border border-black/10 bg-[#FFFFFF]/70 p-4">
 <p className="truncate text-[10px] tracking-[0.12em] text-[#62605B]">{project.eyebrow}</p>
 <h3 className="mt-4 line-clamp-2 min-h-12 text-lg font-bold text-[#1F2328]">{project.title}</h3>
 <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#62605B]">{project.description}</p>
 </div>
 )) : <div className="md:col-span-3 rounded-[12px] border border-dashed border-[#E7E2D9] py-8 text-center text-sm text-[#62605B]">暂无项目</div>}
 </div>
 </div>
 );
 }

 if (moduleType === "now") {
 const status = readNowStatus(block.metadata?.nowStatus);
 return (
 <div className="min-h-48 rounded-[16px] border border-[#E7E2D9] bg-[#FFFFFF] p-6">
 <span className="flex items-center gap-2 text-xs tracking-[0.16em] text-[#C0452A]"><Sparkles className="h-4 w-4 shrink-0" /> <span className="whitespace-nowrap">NOW · 此刻</span></span>
 <h3 className="mt-8 text-2xl font-bold text-[#1F2328]">{status.headline || "尚未填写近况"}</h3>
 <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#62605B]">{status.body || "填写后再发布到主页。"}</p>
 <div className="mt-5 flex flex-wrap gap-2">{status.tags.map((tag) => <span key={tag} className="rounded-[16px] bg-[#FFFFFF] px-3 py-1 text-xs"># {tag}</span>)}</div>
 </div>
 );
 }

 if (moduleType === "media") {
 const items = sortMediaItemsByMarkedAt(readMediaItems(block.metadata?.mediaItems))
 .filter((item) => item.category === "movie" && getDoubanWatchlistProgress(item));
 const source = readDoubanMediaSource(block.metadata?.mediaSource);
 return (
 <div className="min-h-48 rounded-[16px] border border-[#E7E2D9] bg-[#FFFFFF] p-5">
 <div className="flex items-center justify-between gap-3">
 <span className="flex items-center gap-2 text-xs tracking-[0.16em] text-[#C0452A]"><BookOpen className="h-4 w-4 shrink-0" /> <span className="whitespace-nowrap">DOUBAN WATCHLIST · {items.length}</span></span>
 {source.lastSyncedAt ? <span className="text-[10px] text-[#62605B]">{formatAdminDate(source.lastSyncedAt)}</span> : null}
 </div>
 <div className="mt-5 grid gap-3 md:grid-cols-4">
 {items.length ? items.slice(0, 4).map((item) => (
 <div key={item.id} className="grid min-h-36 grid-rows-[7rem_1fr] overflow-hidden rounded-[12px] border border-[#E7E2D9] bg-[#FFFFFF]">
 <div className="relative overflow-hidden border-b border-[#E7E2D9] bg-[#F1EEE8]">
 {item.coverImage ? <img src={item.coverImage} alt="" className="h-full w-full object-contain" /> : <BookOpen className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-[#C0452A]" />}
 </div>
 <h3 className="line-clamp-2 p-3 text-sm font-bold text-[#1F2328]">{item.title}</h3>
 </div>
 )) : <EmptyState text="暂无豆瓣影视条目" />}
 </div>
 </div>
 );
 }

 if (moduleType === "photos") {
 const stories = readPhotoStories(block.metadata?.photoStories);
 return (
 <div className="min-h-48 rounded-[16px] border border-[#E7E2D9] bg-[#FFF0EB] p-5">
 <span className="flex items-center gap-2 text-xs tracking-[0.16em] text-[#C0452A]"><Camera className="h-4 w-4 shrink-0" /> <span className="whitespace-nowrap">PHOTO STORIES · {stories.length}</span></span>
 <div className="mt-5 grid gap-3 md:grid-cols-2">
 {stories.length ? stories.slice(0, 2).map((story) => <div key={story.id} className="rounded-[12px] bg-[#FFFFFF]/80 p-4"><p className="text-xs text-[#C0452A]">{story.date || "未填写日期"}</p><h3 className="mt-3 font-bold text-[#1F2328]">{story.title}</h3><p className="mt-2 text-xs text-[#62605B]">{story.photos.length} 张照片</p></div>) : <EmptyState text="暂无照片故事" />}
 </div>
 </div>
 );
 }

 return null;
}

function SpecialModuleIcon({ type }: { type: SpecialModuleType }) {
 if (type === "experience") return <BriefcaseBusiness className="h-5 w-5" />;
 if (type === "travel") return <MapPinned className="h-5 w-5" />;
 if (type === "projects") return <FolderKanban className="h-5 w-5" />;
 if (type === "now") return <Sparkles className="h-5 w-5" />;
 if (type === "media") return <BookOpen className="h-5 w-5" />;
 return <Camera className="h-5 w-5" />;
}

function getModuleTitle(type: SpecialModuleType, language: EditorLanguage) {
 const isZh = language === "zh-CN";
 if (type === "experience") return isZh ? "工作经历设置" : "Work experience";
 if (type === "travel") return isZh ? "旅行足迹设置" : "Travel footprint";
 if (type === "projects") return isZh ? "个人项目设置" : "Personal projects";
 if (type === "now") return isZh ? "此刻 NOW 设置" : "Now status";
 if (type === "media") return isZh ? "我的豆瓣片单" : "Douban watchlist";
 return isZh ? "照片故事设置" : "Photo stories";
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
 <h3 className="font-bold text-[#1F2328]">{isZh ? "地点列表" : "Locations"}</h3>
 <p className="text-xs text-[#62605B]">{isZh ? "经纬度用于在中国地图上定位标记。" : "Coordinates place each marker on the China map."}</p>
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
 <TravelLocationCard
 key={`${index}-${location.city}`}
 location={location}
 index={index}
 length={locations.length}
 editorLanguage={editorLanguage}
 onChange={(patch) => updateLocation(index, patch)}
 onMove={(direction) => onChange(moveItem(locations, index, direction))}
 onDelete={() => onChange(locations.filter((_, itemIndex) => itemIndex !== index))}
 />
 ))}
 </section>
 );
}

function TravelLocationCard({
 location,
 index,
 length,
 editorLanguage,
 onChange,
 onMove,
 onDelete
}: {
 location: TravelLocationEditorItem;
 index: number;
 length: number;
 editorLanguage: EditorLanguage;
 onChange: (patch: Partial<TravelLocationEditorItem>) => void;
 onMove: (direction: -1 | 1) => void;
 onDelete: () => void;
}) {
 const isZh = editorLanguage === "zh-CN";
 const [expanded, setExpanded] = useState(index === 0);

 return (
 <article className="overflow-hidden rounded-[12px] border border-[#E7E2D9] bg-[#FFFFFF]">
 <div className="flex items-center gap-3 p-3">
 <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#FFF0EB] bg-[#FFF0EB] text-[#C0452A]">
 <MapPin className="h-4 w-4" />
 </span>
 <button type="button" onClick={() => setExpanded((current) => !current)} className="min-w-0 flex-1 text-left">
 <p className="truncate text-sm font-bold text-[#1F2328]">{String(index + 1).padStart(2, "0")} · {location.city || (isZh ? "未命名地点" : "Untitled location")}</p>
 <p className="mt-0.5 truncate text-xs text-[#62605B]">{location.province}{location.note ? ` · ${location.note}` : ""}</p>
 </button>
 <div className="flex items-center gap-1">
 <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="grid h-8 w-8 place-items-center rounded-[10px] text-[#62605B] hover:bg-[#FFFFFF] disabled:opacity-25" title={isZh ? "上移" : "Move up"}><ArrowUp className="h-3.5 w-3.5" /></button>
 <button type="button" disabled={index === length - 1} onClick={() => onMove(1)} className="grid h-8 w-8 place-items-center rounded-[10px] text-[#62605B] hover:bg-[#FFFFFF] disabled:opacity-25" title={isZh ? "下移" : "Move down"}><ArrowDown className="h-3.5 w-3.5" /></button>
 <button type="button" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-[10px] text-red-500 hover:bg-red-50" title={isZh ? "删除地点" : "Delete location"}><Trash2 className="h-3.5 w-3.5" /></button>
 <button type="button" onClick={() => setExpanded((current) => !current)} className="grid h-8 w-8 place-items-center rounded-[10px] text-[#62605B] hover:bg-[#FFFFFF]" aria-label={expanded ? (isZh ? "收起地点" : "Collapse location") : (isZh ? "展开地点" : "Expand location")}>
 {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
 </button>
 </div>
 </div>

 {expanded ? (
 <div className="grid gap-3 border-t border-[#E7E2D9] bg-[#FFFFFF] p-4 md:grid-cols-2">
 <Field label={isZh ? "城市 / 地区" : "City / Area"}>
 <Input value={location.city} onChange={(event) => onChange({ city: event.target.value })} />
 </Field>
 <Field label={isZh ? "省份" : "Province"}>
 <Input value={location.province} onChange={(event) => onChange({ province: event.target.value })} />
 </Field>
 <Field label={isZh ? "足迹说明" : "Note"} className="md:col-span-2">
 <Input value={location.note} onChange={(event) => onChange({ note: event.target.value })} />
 </Field>
 <Field label={isZh ? "经度（73–135）" : "Longitude (73–135)"}>
 <Input type="number" min="73" max="135" step="0.01" value={location.longitude} onChange={(event) => onChange({ longitude: Number(event.target.value) })} />
 </Field>
 <Field label={isZh ? "纬度（17–54）" : "Latitude (17–54)"}>
 <Input type="number" min="17" max="54" step="0.01" value={location.latitude} onChange={(event) => onChange({ latitude: Number(event.target.value) })} />
 </Field>
 </div>
 ) : null}
 </article>
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
 <h3 className="font-bold text-[#1F2328]">{isZh ? "项目列表" : "Projects"}</h3>
 <p className="text-xs text-[#62605B]">{isZh ? "GitHub 链接必填，在线地址可选。" : "GitHub URL is required; live URL is optional."}</p>
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
 <article key={`${index}-${project.title}`} className="grid gap-4 rounded-[12px] border border-[#FFF0EB] bg-[#FFFFFF] p-4">
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

function NowStatusEditor({
 status,
 onChange,
 editorLanguage
}: {
 status: NowStatus;
 onChange: (status: NowStatus) => void;
 editorLanguage: EditorLanguage;
}) {
 const isZh = editorLanguage === "zh-CN";
 const patch = (next: Partial<NowStatus>) => onChange({ ...status, ...next });
 return (
 <section className="grid gap-4 rounded-[12px] border border-[#FFF0EB] bg-[#FFFFFF] p-4">
 <div>
 <h3 className="font-bold text-[#1F2328]">{isZh ? "近况内容" : "Current status"}</h3>
 <p className="text-xs text-[#62605B]">{isZh ? "适合记录近期状态、关注事项和生活关键词。" : "Share a concise current update."}</p>
 </div>
 <div className="grid gap-3 md:grid-cols-2">
 <Field label={isZh ? "近况标题" : "Headline"} className="md:col-span-2">
 <Input value={status.headline} onChange={(event) => patch({ headline: event.target.value })} placeholder={isZh ? "填写真实的近期状态" : "What is happening now?"} />
 </Field>
 <Field label={isZh ? "详细说明" : "Details"} className="md:col-span-2">
 <Textarea value={status.body} onChange={(event) => patch({ body: event.target.value })} className="min-h-28" />
 </Field>
 <Field label={isZh ? "心情（可选）" : "Mood (optional)"}>
 <Input value={status.mood ?? ""} onChange={(event) => patch({ mood: event.target.value })} />
 </Field>
 <Field label={isZh ? "所在地（可选）" : "Location (optional)"}>
 <Input value={status.location ?? ""} onChange={(event) => patch({ location: event.target.value })} />
 </Field>
 <Field label={isZh ? "标签（使用逗号分隔）" : "Tags (comma separated)"}>
 <Input value={status.tags.join(", ")} onChange={(event) => patch({ tags: event.target.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) })} />
 </Field>
 <Field label={isZh ? "更新时间" : "Updated at"}>
 <Input type="date" value={toDateInputValue(status.updatedAt)} onChange={(event) => patch({ updatedAt: event.target.value })} />
 </Field>
 </div>
 </section>
 );
}

function MediaItemsEditor({
 items,
 source,
 onChange,
 onSourceChange,
 onSync,
 editorLanguage
}: {
 items: MediaItem[];
 source: DoubanMediaSource;
 onChange: (items: MediaItem[]) => void;
 onSourceChange: (source: DoubanMediaSource) => void;
 onSync: (source: DoubanMediaSource, items: MediaItem[]) => void;
 editorLanguage: EditorLanguage;
}) {
 const isZh = editorLanguage === "zh-CN";
 const [isSyncing, setIsSyncing] = useState(false);
 const updateItem = (index: number, patch: Partial<MediaItem>) => onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

 async function syncFromDouban() {
 if (!source.profileUrl.trim()) {
 toast.error(isZh ? "请先填写豆瓣个人主页 URL" : "Enter a Douban profile URL first");
 return;
 }

 setIsSyncing(true);
 try {
 const response = await fetch("/api/admin/douban-media", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ profileUrl: source.profileUrl })
 });
 const body = (await response.json().catch(() => null)) as {
 items?: MediaItem[];
 source?: DoubanMediaSource;
 error?: string;
 } | null;

 if (!response.ok || !body?.items || !body.source) {
 toast.error(isZh ? "豆瓣同步失败" : "Douban sync failed", {
 description: body?.error ?? (isZh ? "请稍后重试" : "Try again later")
 });
 return;
 }

 onSync({ ...body.source, syncIntervalDays: source.syncIntervalDays }, body.items);
 toast.success(isZh ? `已同步 ${body.items.length} 条豆瓣记录` : `Synced ${body.items.length} Douban items`);
 } catch {
 toast.error(isZh ? "豆瓣同步失败" : "Douban sync failed", {
 description: isZh ? "网络请求未完成，请稍后重试" : "The request did not complete. Try again later."
 });
 } finally {
 setIsSyncing(false);
 }
 }

 return (
 <section className="grid gap-4">
 <div className="grid gap-4 rounded-[12px] border border-[#E7E2D9] bg-[#F8F7F4] p-4">
 <div>
 <h3 className="font-bold text-[#1F2328]">{isZh ? "豆瓣公开主页同步" : "Douban profile sync"}</h3>
 <p className="mt-1 text-xs leading-5 text-[#62605B]">
 {isZh ? "填写豆瓣个人主页 URL，同步影视类的在看和想看记录。同步结果会保存到本站，主页访问不依赖豆瓣实时响应。" : "Enter a public Douban profile URL to sync watching and wishlist movie records."}
 </p>
 </div>
 <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
 <Field label={isZh ? "豆瓣个人主页 URL" : "Douban profile URL"}>
 <Input
 type="url"
 value={source.profileUrl}
 onChange={(event) => onSourceChange({
 ...source,
 profileUrl: event.target.value,
 lastSyncedAt: undefined,
 totalItems: undefined,
 failedPages: undefined
 })}
 placeholder="https://www.douban.com/people/your-id/"
 />
 </Field>
 <Field label={isZh ? "自动抓取周期" : "Auto-sync interval"}>
 <Select
 value={String(source.syncIntervalDays)}
 onChange={(event) => onSourceChange({
 ...source,
 syncIntervalDays: Number(event.target.value) as DoubanMediaSource["syncIntervalDays"]
 })}
 >
 <option value="0">{isZh ? "不自动抓取" : "Disabled"}</option>
 <option value="1">{isZh ? "每天" : "Daily"}</option>
 <option value="3">{isZh ? "每 3 天" : "Every 3 days"}</option>
 <option value="7">{isZh ? "每 7 天" : "Every 7 days"}</option>
 <option value="14">{isZh ? "每 14 天" : "Every 14 days"}</option>
 <option value="30">{isZh ? "每 30 天" : "Every 30 days"}</option>
 </Select>
 </Field>
 <Button type="button" onClick={syncFromDouban} disabled={isSyncing} className="md:min-w-32">
 <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
 {isSyncing ? (isZh ? "同步中" : "Syncing") : (isZh ? "立即同步" : "Sync now")}
 </Button>
 </div>
 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#62605B]">
 <span>{isZh ? "当前条目" : "Items"}：{items.length}</span>
 <span>{isZh ? "自动抓取" : "Auto sync"}：{formatSyncInterval(source.syncIntervalDays, isZh)}</span>
 {source.lastSyncedAt ? <span>{isZh ? "上次同步" : "Last sync"}：{formatAdminDate(source.lastSyncedAt)}</span> : null}
 {source.failedPages ? <span className="text-amber-700">{source.failedPages} {isZh ? "个分类页暂未读取" : "pages unavailable"}</span> : null}
 {source.profileUrl ? <a href={source.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#C0452A] hover:underline">{isZh ? "打开豆瓣主页" : "Open profile"} <ExternalLink className="h-3 w-3" /></a> : null}
 </div>
 </div>

 <details className="rounded-[12px] border border-[#E7E2D9] bg-[#FFFFFF]">
 <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-[#1F2328]">
 <span>{isZh ? "手动调整同步结果" : "Manually edit synced items"}</span>
 <span className="text-xs font-normal text-[#62605B]">{items.length} {isZh ? "条" : "items"}</span>
 </summary>
 <div className="grid gap-4 border-t border-[#E7E2D9] p-4">
 <div className="flex items-center justify-between gap-3">
 <p className="text-xs text-[#62605B]">{isZh ? "可调整同步后的影视标题、状态与短评；下次同步会替换这里的内容。" : "Adjust synced movie content. The next sync replaces this list."}</p>
 <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, { id: crypto.randomUUID(), category: "movie", title: isZh ? "新条目" : "New item", status: isZh ? "想看" : "Wishlist", progress: "wishlist", source: "manual" }])}><Plus className="h-4 w-4" /> {isZh ? "添加条目" : "Add item"}</Button>
 </div>
 {items.length === 0 ? <EmptyState text={isZh ? "暂无内容，请先同步豆瓣或手动添加。" : "Sync Douban or add an item manually."} /> : null}
 {items.map((item, index) => (
 <article key={item.id} className="grid gap-4 rounded-[12px] border border-[#FFF0EB] bg-[#FFFFFF] p-4">
 <ItemToolbar label={`${String(index + 1).padStart(2, "0")} · ${item.title}`} index={index} length={items.length} onMove={(direction) => onChange(moveItem(items, index, direction))} onDelete={() => onChange(items.filter((candidate) => candidate.id !== item.id))} editorLanguage={editorLanguage} />
 <div className="grid gap-3 md:grid-cols-2">
 <Field label={isZh ? "分类" : "Category"}>
 <Select value="movie" disabled>
 <option value="movie">{isZh ? "影视" : "Movie / TV"}</option>
 </Select>
 </Field>
 <Field label={isZh ? "片单分类" : "Watchlist group"}>
 <Select
 value={getDoubanWatchlistProgress(item) ?? "wishlist"}
 onChange={(event) => {
 const progress = event.target.value as "active" | "wishlist";
 updateItem(index, {
 category: "movie",
 progress,
 status: progress === "active" ? "在看" : "想看"
 });
 }}
 >
 <option value="active">{isZh ? "在看" : "Watching"}</option>
 <option value="wishlist">{isZh ? "想看" : "Wishlist"}</option>
 </Select>
 </Field>
 <Field label={isZh ? "名称" : "Title"}><Input value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} /></Field>
 <Field label={isZh ? "作者 / 主创（可选）" : "Creator (optional)"}><Input value={item.creator ?? ""} onChange={(event) => updateItem(index, { creator: event.target.value })} /></Field>
 <Field label={isZh ? "评分（0–5，可选）" : "Rating (0–5, optional)"}><Input type="number" min="0" max="5" step="0.1" value={item.rating ?? ""} onChange={(event) => updateItem(index, { rating: event.target.value === "" ? undefined : Number(event.target.value) })} /></Field>
 <Field label={isZh ? "外部链接（可选）" : "External URL (optional)"}><Input type="url" value={item.href ?? ""} onChange={(event) => updateItem(index, { href: event.target.value })} placeholder="https://..." /></Field>
 <Field label={isZh ? "短评（可选）" : "Note (optional)"} className="md:col-span-2"><Textarea value={item.note ?? ""} onChange={(event) => updateItem(index, { note: event.target.value })} /></Field>
 <Field label={isZh ? "封面地址（可选）" : "Cover URL (optional)"} className="md:col-span-2"><Input value={item.coverImage ?? ""} onChange={(event) => updateItem(index, { coverImage: event.target.value })} placeholder="https://..." /></Field>
 <div className="md:col-span-2"><MediaUploader folder="gallery" onUploaded={(url) => updateItem(index, { coverImage: url })} /></div>
 </div>
 </article>
 ))}
 </div>
 </details>
 </section>
 );
}

function PhotoStoriesEditor({
 stories,
 onChange,
 editorLanguage
}: {
 stories: PhotoStory[];
 onChange: (stories: PhotoStory[]) => void;
 editorLanguage: EditorLanguage;
}) {
 const isZh = editorLanguage === "zh-CN";
 const updateStory = (index: number, patch: Partial<PhotoStory>) => onChange(stories.map((story, itemIndex) => itemIndex === index ? { ...story, ...patch } : story));
 return (
 <section className="grid gap-4">
 <div className="flex items-center justify-between gap-3">
 <div><h3 className="font-bold text-[#1F2328]">{isZh ? "故事列表" : "Stories"}</h3><p className="text-xs text-[#62605B]">{isZh ? "每个故事可以上传多张图片并单独填写说明。" : "Each story can contain multiple captioned photos."}</p></div>
 <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...stories, { id: crypto.randomUUID(), title: isZh ? "新照片故事" : "New photo story", photos: [] }])}><Plus className="h-4 w-4" /> {isZh ? "添加故事" : "Add story"}</Button>
 </div>
 {stories.length === 0 ? <EmptyState text={isZh ? "暂无照片故事，添加后再上传真实照片。" : "No stories yet."} /> : null}
 {stories.map((story, storyIndex) => (
 <article key={story.id} className="grid gap-4 rounded-[12px] border border-[#FFF0EB] bg-[#FFFFFF] p-4">
 <ItemToolbar label={`${String(storyIndex + 1).padStart(2, "0")} · ${story.title}`} index={storyIndex} length={stories.length} onMove={(direction) => onChange(moveItem(stories, storyIndex, direction))} onDelete={() => onChange(stories.filter((candidate) => candidate.id !== story.id))} editorLanguage={editorLanguage} />
 <div className="grid gap-3 md:grid-cols-2">
 <Field label={isZh ? "故事标题" : "Story title"}><Input value={story.title} onChange={(event) => updateStory(storyIndex, { title: event.target.value })} /></Field>
 <Field label={isZh ? "日期（可选）" : "Date (optional)"}><Input type="date" value={story.date ?? ""} onChange={(event) => updateStory(storyIndex, { date: event.target.value })} /></Field>
 <Field label={isZh ? "地点（可选）" : "Location (optional)"}><Input value={story.location ?? ""} onChange={(event) => updateStory(storyIndex, { location: event.target.value })} /></Field>
 <Field label={isZh ? "简介（可选）" : "Summary (optional)"} className="md:col-span-2"><Textarea value={story.summary ?? ""} onChange={(event) => updateStory(storyIndex, { summary: event.target.value })} /></Field>
 </div>
 <div className="grid gap-3 rounded-[12px] bg-[#FFF0EB] p-4">
 <div className="flex items-center justify-between"><div><h4 className="font-bold text-[#1F2328]">{isZh ? "照片" : "Photos"}</h4><p className="text-xs text-[#62605B]">{story.photos.length} {isZh ? "张" : "photos"}</p></div></div>
 <MediaUploader folder="gallery" onUploaded={(url) => updateStory(storyIndex, { photos: [...story.photos, { id: crypto.randomUUID(), url, alt: story.title || (isZh ? "照片" : "Photo"), caption: "" }] })} />
 {story.photos.map((photo, photoIndex) => (
 <div key={photo.id} className="grid gap-3 rounded-[10px] border border-[#FFF0EB] bg-[#FFFFFF] p-3 md:grid-cols-[88px_1fr]">
 <img src={photo.url} alt="" className="h-[88px] w-[88px] rounded-[10px] object-cover" />
 <div className="grid gap-2">
 <ItemToolbar label={`${isZh ? "照片" : "Photo"} ${photoIndex + 1}`} index={photoIndex} length={story.photos.length} onMove={(direction) => updateStory(storyIndex, { photos: moveItem(story.photos, photoIndex, direction) })} onDelete={() => updateStory(storyIndex, { photos: story.photos.filter((candidate) => candidate.id !== photo.id) })} editorLanguage={editorLanguage} />
 <div className="grid gap-2 md:grid-cols-2"><Field label={isZh ? "替代文本" : "Alt text"}><Input value={photo.alt} onChange={(event) => updateStory(storyIndex, { photos: story.photos.map((candidate) => candidate.id === photo.id ? { ...candidate, alt: event.target.value } : candidate) })} /></Field><Field label={isZh ? "图片说明（可选）" : "Caption (optional)"}><Input value={photo.caption ?? ""} onChange={(event) => updateStory(storyIndex, { photos: story.photos.map((candidate) => candidate.id === photo.id ? { ...candidate, caption: event.target.value } : candidate) })} /></Field></div>
 </div>
 </div>
 ))}
 </div>
 </article>
 ))}
 </section>
 );
}

function toDateInputValue(value: string) {
 if (!value) return "";
 return value.slice(0, 10);
}

function formatAdminDate(value: string) {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return value;
 return new Intl.DateTimeFormat("zh-CN", {
 year: "numeric",
 month: "2-digit",
 day: "2-digit",
 hour: "2-digit",
 minute: "2-digit"
 }).format(date);
}

function formatSyncInterval(intervalDays: DoubanMediaSource["syncIntervalDays"], isZh: boolean) {
 if (intervalDays === 0) return isZh ? "关闭" : "Disabled";
 if (intervalDays === 1) return isZh ? "每天" : "Daily";
 return isZh ? `每 ${intervalDays} 天` : `Every ${intervalDays} days`;
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
 <div className="flex items-center justify-between gap-3 border-b border-[#F1EEE8] pb-3">
 <strong className="min-w-0 truncate text-sm text-[#1F2328]">{label}</strong>
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
 return <div className="rounded-[12px] border border-dashed border-[#FFF0EB] bg-[#FFF0EB] px-4 py-8 text-center text-sm text-[#62605B]">{text}</div>;
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
