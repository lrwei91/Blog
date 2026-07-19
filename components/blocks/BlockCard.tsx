"use client";

import { ArrowUpRight, Download, ExternalLink, ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { Block } from "@/types/block";
import { cn, getSectionAnchorId, isSectionTextBlock } from "@/lib/utils";
import type { ExperienceTimelineMeta } from "@/lib/experience-timeline";
import { getPublicBlockPlacementStyle, getPublicBlockSizeClass } from "@/constants/block-layout";
import { BlockIcon } from "@/components/blocks/BlockIcon";
import { ProjectBlock } from "@/components/blocks/ProjectBlock";
import { TextBlock } from "@/components/blocks/TextBlock";

export function BlockCard({
 block,
 compact = false,
 disableActions = false,
 disableHoverReveal = false,
 hidePlaceholderContent = false,
 withLayout = true,
 layoutStyle,
 className,
 revealIndex = 0,
 sectionNumber,
 timelineMeta
}: {
 block: Block;
 compact?: boolean;
 disableActions?: boolean;
 disableHoverReveal?: boolean;
 hidePlaceholderContent?: boolean;
 withLayout?: boolean;
 layoutStyle?: React.CSSProperties & Record<string, string | number | undefined>;
 className?: string;
 revealIndex?: number;
 sectionNumber?: number;
 timelineMeta?: ExperienceTimelineMeta;
}) {
 const [previewOpen, setPreviewOpen] = useState(false);
 const [modalOpen, setModalOpen] = useState(false);
 const displayBlock = hidePlaceholderContent ? getDisplayBlock(block) : block;

 if (isSectionTextBlock(displayBlock)) {
 return (
 <SectionTextCard
 block={displayBlock}
 withLayout={withLayout}
 compact={compact}
 layoutStyle={layoutStyle}
 className={className}
 sectionNumber={sectionNumber}
 />
 );
 }

 function runAction() {
 if (disableActions) return;
 if (block.actionType === "none") return;
 if (block.actionType === "link" && block.href) {
 window.open(block.href, block.openInNewTab === false ? "_self" : "_blank", "noreferrer");
 }
 if (block.actionType === "image-preview") {
 setPreviewOpen(true);
 }
 if (block.actionType === "modal") {
 setModalOpen(true);
 }
 if (block.actionType === "copy") {
 const copyText =
 typeof block.metadata?.copyText === "string" ? block.metadata.copyText : block.href ?? block.title;
 void navigator.clipboard.writeText(copyText);
 toast.success("Copied");
 }
 if (block.actionType === "download" && block.href) {
 const link = document.createElement("a");
 link.href = block.href;
 link.download = block.title;
 link.click();
 }
 }

 const clickable = !disableActions && block.actionType !== "none";
 const hasCover = Boolean(block.coverImage);
 const isPlainTextCard = block.metadata?.textVariant === "plain";
 const hasHoverContent = Boolean(displayBlock.subtitle?.trim() || displayBlock.description?.trim());
 const shouldRevealCoverContent = hasCover && hasHoverContent && !disableHoverReveal;
 const showFooter = timelineMeta ? block.actionType !== "none" : Boolean(block.badge) || block.actionType !== "none";
 const accentIndex = getAccentIndex(block.id);
 const contentBlock = timelineMeta ? { ...displayBlock, subtitle: timelineMeta.role } : displayBlock;

 return (
 <>
 <article
 role={clickable ? "button" : undefined}
 tabIndex={clickable ? 0 : undefined}
 onClick={runAction}
 onKeyDown={(event) => {
 if (clickable && (event.key === "Enter" || event.key === " ")) {
 event.preventDefault();
 runAction();
 }
 }}
 style={{
 backgroundColor: block.backgroundColor || undefined,
 color: block.textColor || undefined,
 "--reveal-index": revealIndex,
 ...(withLayout && !compact ? layoutStyle ?? getPublicBlockPlacementStyle(block) : {})
 } as React.CSSProperties & Record<string, string | number | undefined>}
 data-reveal
 data-accent={accentIndex}
 data-action={block.actionType}
 data-plain-text={isPlainTextCard ? "true" : undefined}
 data-timeline={timelineMeta ? "true" : undefined}
 className={cn(
 "public-block-card group relative overflow-hidden rounded-[8px] border border-[var(--site-border)] p-4 transition",
 "focus:outline-none",
 clickable && "cursor-pointer",
 withLayout && !compact && getPublicBlockSizeClass(),
 compact && "min-h-36",
 className
 )}
 >
 {block.coverImage ? (
 <img
 src={block.coverImage}
 alt=""
 className={cn(
 "absolute inset-0 h-full w-full object-cover opacity-100 transition duration-200",
 shouldRevealCoverContent && "group-hover:opacity-0"
 )}
 />
 ) : null}
 {hasCover ? (
 <div
 className={cn(
 "public-cover-title pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-3 transition duration-200",
 shouldRevealCoverContent && "group-hover:opacity-0"
 )}
 >
 <span className="line-clamp-2 max-w-full rounded-[4px] border px-3 py-1.5 text-sm font-semibold leading-5">
 {block.title}
 </span>
 </div>
 ) : null}
 <div
 className={cn(
 "public-block-card__body relative z-30 flex h-full flex-col gap-4 transition duration-200",
 isPlainTextCard ? "justify-center" : "justify-between",
 hasCover && (shouldRevealCoverContent ? "opacity-0 group-hover:opacity-100" : "opacity-0")
 )}
 >
 <div className={cn("min-h-0", isPlainTextCard && "flex flex-1")}>
 {renderBlock(contentBlock, hasCover)}
 </div>
 {showFooter ? <div className={cn("public-block-card__footer flex items-center gap-3", timelineMeta ? "justify-start" : "justify-between")}>
 {!timelineMeta ? <div className="flex min-w-0 flex-wrap gap-2">
 {block.badge ? <span className="public-block-card__badge line-clamp-2 max-w-full rounded-[4px] border px-3 py-1.5 text-xs font-semibold leading-5">{block.badge}</span> : <span />}
 </div> : null}
 <div className="shrink-0">
 {block.actionType === "link" ? <ExternalLink className="h-4 w-4 text-[var(--ink-2)]" /> : null}
 {block.actionType === "download" ? <Download className="h-4 w-4 text-[var(--ink-2)]" /> : null}
 {block.actionType === "image-preview" ? <ImageIcon className="h-4 w-4 text-[var(--ink-2)]" /> : null}
 {block.actionType === "modal" ? <span className="public-block-card__details">DETAILS <ArrowUpRight /></span> : null}
 </div>
 </div> : null}
 </div>
 {timelineMeta ? (
 <div className="experience-timeline__aside">
 <span className="experience-timeline__tenure">
 <small>在职时长</small>
 <b>{timelineMeta.tenure}</b>
 </span>
 <div className="experience-timeline__art" aria-hidden="true">
 <span>{block.title.trim().charAt(0) || "·"}</span>
 </div>
 </div>
 ) : null}
 </article>

 {previewOpen ? (
 <Dialog onClose={() => setPreviewOpen(false)}>
 {block.coverImage ? (
 <img src={block.coverImage} alt={block.title} className="max-h-[78vh] w-full rounded-[8px] object-contain" />
 ) : (
 <p>No image configured.</p>
 )}
 </Dialog>
 ) : null}
 {modalOpen ? (
 <Dialog onClose={() => setModalOpen(false)} variant="content">
 <article className="public-dialog__content">
 <header className="public-dialog__header">
 <p className="public-dialog__eyebrow">工作经历 <span>WORK EXPERIENCE</span></p>
 <div className="public-dialog__resume-heading">
 <h3>{getModalTitle(displayBlock)}</h3>
 <p className="public-dialog__period">{getModalSubtitle(displayBlock)}</p>
 </div>
 </header>
 <ModalBody body={getModalBody(displayBlock)} />
 </article>
 </Dialog>
 ) : null}
 </>
 );
}

function getDisplayBlock(block: Block): Block {
 if (!isPlaceholderHandle(block.subtitle)) return block;
 return { ...block, subtitle: "" };
}

function isPlaceholderHandle(value?: string) {
 return value?.trim().replace(/^@/, "").toLowerCase() === "your-handle";
}

function renderBlock(block: Block, hideTitle = false) {
 const displayBlock = hideTitle ? { ...block, title: "" } : block;
 if (block.metadata?.textVariant === "plain") return <TextBlock block={displayBlock} />;
 return <ProjectBlock block={displayBlock} />;
}

const sectionTitleSize = {
 sm: "text-lg",
 md: "text-2xl",
 lg: "text-3xl"
};

const sectionTextAlign = {
 left: "text-left",
 center: "text-center",
 right: "text-right"
};

function SectionTextCard({
 block,
 compact,
 withLayout,
 layoutStyle,
 className,
 sectionNumber
}: {
 block: Block;
 compact: boolean;
 withLayout: boolean;
 layoutStyle?: React.CSSProperties & Record<string, string | number | undefined>;
 className?: string;
 sectionNumber?: number;
}) {
 const rawTitleSize = block.metadata?.titleSize;
 const rawTitleAlign = block.metadata?.titleAlign;
 const titleSize = rawTitleSize === "sm" || rawTitleSize === "lg" ? rawTitleSize : "md";
 const titleAlign = rawTitleAlign === "center" || rawTitleAlign === "right" ? rawTitleAlign : "left";
 const subtitle = block.subtitle || block.description;
 const resolvedSectionNumber = sectionNumber ?? block.sortOrder;
 const sectionAccent = ((resolvedSectionNumber - 1) % 4 + 4) % 4;

 return (
 <article
 id={getSectionAnchorId(block)}
 style={withLayout && !compact ? layoutStyle ?? getPublicBlockPlacementStyle(block) : undefined}
 data-reveal
 data-accent={sectionAccent}
 className={cn(
 "public-section-heading relative min-w-0 px-1 py-1",
 sectionTextAlign[titleAlign],
 withLayout && !compact && getPublicBlockSizeClass(),
 className
 )}
 >
 <p className="public-section-heading__label">
 <span /> <span className="min-w-0 truncate">{String(resolvedSectionNumber).padStart(2, "0")} / {subtitle || "SELECTED WORK"}</span>
 </p>
 <div className="public-section-heading__title-row">
 {block.icon ? <span className="public-section-heading__icon"><BlockIcon name={block.icon} /></span> : null}
 <h2 className={cn("font-bold leading-tight", sectionTitleSize[titleSize])}>{block.title.trim()}</h2>
 </div>
 </article>
 );
}

function Dialog({
 children,
 onClose,
 variant = "media"
}: {
 children: React.ReactNode;
 onClose: () => void;
 variant?: "content" | "media";
}) {
 const closeButtonRef = useRef<HTMLButtonElement>(null);

 useEffect(() => {
 const previousOverflow = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 closeButtonRef.current?.focus();

 function closeOnEscape(event: KeyboardEvent) {
 if (event.key === "Escape") onClose();
 }

 window.addEventListener("keydown", closeOnEscape);
 return () => {
 document.body.style.overflow = previousOverflow;
 window.removeEventListener("keydown", closeOnEscape);
 };
 }, [onClose]);

 return createPortal(
 <div className="public-dialog fixed inset-0 z-50 grid place-items-center p-5" onClick={onClose} role="presentation">
 <div
 className={cn("public-dialog__panel", `public-dialog__panel--${variant}`)}
 onClick={(event) => event.stopPropagation()}
 role="dialog"
 aria-modal="true"
 aria-label="详情"
 >
 <button ref={closeButtonRef} type="button" onClick={onClose} className="public-dialog__close" aria-label="关闭详情">
 <X />
 </button>
 {children}
 </div>
 </div>,
 document.body
 );
}

function ModalBody({ body }: { body: string }) {
 const sections = body.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);

 return (
 <div className="public-dialog__body">
 {sections.map((section, index) => {
 const key = `${index}-${section.slice(0, 18)}`;
 if (/^项目成果[：:]/.test(section)) {
 const [, content = section] = section.split(/[：:](.*)/);
 return (
 <aside key={key} className="public-dialog__result">
 <span>RESULT</span>
 <p>{content.trim()}</p>
 </aside>
 );
 }
 if (!section.startsWith("•") && section.length <= 20) {
 return <h4 key={key}><span />{section}</h4>;
 }
 if (section.startsWith("•")) {
 return (
 <p key={key} className="public-dialog__item">
 <span aria-hidden="true" />
 {section.replace(/^•\s*/, "")}
 </p>
 );
 }
 return <p key={key} className="public-dialog__paragraph">{section}</p>;
 })}
 </div>
 );
}

function getModalTitle(block: Block) {
 return typeof block.metadata?.modalTitle === "string" && block.metadata.modalTitle.trim()
 ? block.metadata.modalTitle
 : block.title;
}

function getModalSubtitle(block: Block) {
 return typeof block.metadata?.modalSubtitle === "string" && block.metadata.modalSubtitle.trim()
 ? block.metadata.modalSubtitle
 : block.subtitle;
}

function getModalBody(block: Block) {
 return typeof block.metadata?.modalBody === "string" && block.metadata.modalBody.trim()
 ? block.metadata.modalBody
 : block.description || "No additional details yet.";
}

function getAccentIndex(value: string) {
 let hash = 0;
 for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
 return Math.abs(hash) % 5;
}
