import type { Block } from "@/types/block";
import { bySortOrder, isSectionTextBlock, topLevelBlockSectionId } from "@/lib/utils";

export type OutlineSpecialModuleType = "travel" | "projects" | "now" | "media" | "photos";

export type ContentOutlineGroup = {
  id: string;
  title: string;
  subtitle: string;
  blocks: Block[];
  blockIds: string[];
  headingId?: string;
  primaryEditBlockId: string;
  moduleType: OutlineSpecialModuleType | null;
  isVisible: boolean;
  visibleCount: number;
};

const specialModuleTypes = new Set<OutlineSpecialModuleType>(["travel", "projects", "now", "media", "photos"]);

export function isOutlineSpecialModuleType(value: unknown): value is OutlineSpecialModuleType {
  return typeof value === "string" && specialModuleTypes.has(value as OutlineSpecialModuleType);
}

export function getOutlineSpecialModuleType(block: Block): OutlineSpecialModuleType | null {
  const sourceSectionId = block.metadata?.sourceSectionId;
  if (isOutlineSpecialModuleType(sourceSectionId)) return sourceSectionId;
  if (Array.isArray(block.metadata?.travelLocations)) return "travel";
  if (Array.isArray(block.metadata?.projects)) return "projects";
  if (block.metadata?.nowStatus && typeof block.metadata.nowStatus === "object") return "now";
  if (Array.isArray(block.metadata?.mediaItems)) return "media";
  if (Array.isArray(block.metadata?.photoStories)) return "photos";
  return null;
}

export function buildContentOutlineGroups(blocks: Block[]): ContentOutlineGroup[] {
  const ordered = [...blocks]
    .filter((block) => block.sectionId === topLevelBlockSectionId)
    .sort(bySortOrder);
  const groupedBlocks: Block[][] = [];

  for (const block of ordered) {
    if (isSectionTextBlock(block)) {
      groupedBlocks.push([block]);
      continue;
    }

    const current = groupedBlocks.at(-1);
    if (current?.[0] && isSectionTextBlock(current[0])) {
      current.push(block);
    } else {
      groupedBlocks.push([block]);
    }
  }

  return groupedBlocks.map((groupBlocks) => {
    const heading = isSectionTextBlock(groupBlocks[0]) ? groupBlocks[0] : undefined;
    const moduleType = groupBlocks.map(getOutlineSpecialModuleType).find(Boolean) ?? null;
    const specialContent = moduleType
      ? groupBlocks.find((block) => !isSectionTextBlock(block) && getOutlineSpecialModuleType(block) === moduleType)
      : undefined;
    const primary = specialContent ?? heading ?? groupBlocks[0];
    const visibleCount = groupBlocks.filter((block) => block.isVisible).length;

    return {
      id: heading?.id ?? groupBlocks[0].id,
      title: heading?.title || primary.title || "未命名模块",
      subtitle: heading?.subtitle || primary.subtitle || "",
      blocks: groupBlocks,
      blockIds: groupBlocks.map((block) => block.id),
      headingId: heading?.id,
      primaryEditBlockId: primary.id,
      moduleType,
      isVisible: visibleCount === groupBlocks.length,
      visibleCount
    };
  });
}

export function reorderContentOutlineGroups(
  blocks: Block[],
  activeGroupId: string,
  overGroupId: string,
  updatedAt = new Date().toISOString()
) {
  if (activeGroupId === overGroupId) return blocks;
  const groups = buildContentOutlineGroups(blocks);
  const oldIndex = groups.findIndex((group) => group.id === activeGroupId);
  const newIndex = groups.findIndex((group) => group.id === overGroupId);
  if (oldIndex < 0 || newIndex < 0) return blocks;

  const next = [...groups];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, moved);
  return applyContentOutlineGroupOrder(blocks, next.map((group) => group.id), updatedAt);
}

export function moveContentOutlineGroup(
  blocks: Block[],
  groupId: string,
  targetIndex: number,
  updatedAt = new Date().toISOString()
) {
  const groups = buildContentOutlineGroups(blocks);
  const oldIndex = groups.findIndex((group) => group.id === groupId);
  if (oldIndex < 0) return blocks;
  const nextIndex = Math.max(0, Math.min(targetIndex, groups.length - 1));
  if (oldIndex === nextIndex) return blocks;

  const next = [...groups];
  const [moved] = next.splice(oldIndex, 1);
  next.splice(nextIndex, 0, moved);
  return applyContentOutlineGroupOrder(blocks, next.map((group) => group.id), updatedAt);
}

export function applyContentOutlineGroupOrder(
  blocks: Block[],
  orderedGroupIds: string[],
  updatedAt = new Date().toISOString()
) {
  const groups = buildContentOutlineGroups(blocks);
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const orderedGroups = orderedGroupIds.map((id) => groupById.get(id)).filter((group): group is ContentOutlineGroup => Boolean(group));
  for (const group of groups) {
    if (!orderedGroupIds.includes(group.id)) orderedGroups.push(group);
  }

  const sortOrderById = new Map<string, number>();
  orderedGroups.flatMap((group) => group.blocks).forEach((block, index) => sortOrderById.set(block.id, index + 1));

  return blocks.map((block) => {
    const sortOrder = sortOrderById.get(block.id);
    if (sortOrder === undefined || sortOrder === block.sortOrder) return block;
    return { ...block, sortOrder, updatedAt };
  });
}

export function setContentOutlineGroupVisibility(
  blocks: Block[],
  groupId: string,
  isVisible: boolean,
  updatedAt = new Date().toISOString()
) {
  const group = buildContentOutlineGroups(blocks).find((item) => item.id === groupId);
  if (!group) return blocks;
  const blockIds = new Set(group.blockIds);
  return blocks.map((block) => blockIds.has(block.id) ? { ...block, isVisible, updatedAt } : block);
}
