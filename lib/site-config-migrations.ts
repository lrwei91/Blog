import type { Block } from "@/types/block";
import type { SiteConfig } from "@/types/site-config";

export const currentSiteConfigVersion = 2;

export function migrateSiteConfigV2(config: SiteConfig): SiteConfig {
  if (config.version >= currentSiteConfigVersion) return config;

  return {
    ...config,
    version: currentSiteConfigVersion,
    blocks: moveProjectGroupAfterSkills(config.blocks),
    contentVariants: Object.fromEntries(
      Object.entries(config.contentVariants ?? {}).map(([key, snapshot]) => [
        key,
        { ...snapshot, blocks: moveProjectGroupAfterSkills(snapshot.blocks) }
      ])
    )
  };
}

export function moveProjectGroupAfterSkills(blocks: Block[]) {
  const ordered = blocks
    .map((block, sourceIndex) => ({ block, sourceIndex }))
    .sort((left, right) => left.block.sortOrder - right.block.sortOrder || left.sourceIndex - right.sourceIndex)
    .map(({ block }) => block);
  const projectBlocks = ordered.filter(isProjectBlock);
  if (projectBlocks.length === 0) return blocks;

  const remaining = ordered.filter((block) => !isProjectBlock(block));
  const skillsIndex = remaining.findIndex((block) => getSourceSectionId(block) === "skills");
  const experienceIndex = remaining.findIndex((block) => getSourceSectionId(block) === "experience");
  let insertionIndex = remaining.length;

  if (skillsIndex >= 0) {
    insertionIndex = skillsIndex + 1;
    while (insertionIndex < remaining.length && !isSectionTextBlock(remaining[insertionIndex])) {
      insertionIndex += 1;
    }
  } else if (experienceIndex >= 0) {
    insertionIndex = experienceIndex;
  }

  return [
    ...remaining.slice(0, insertionIndex),
    ...projectBlocks,
    ...remaining.slice(insertionIndex)
  ].map((block, index) => ({ ...block, sortOrder: index + 1 }));
}

function isProjectBlock(block: Block) {
  return getSourceSectionId(block) === "projects" || Array.isArray(block.metadata?.projects);
}

function isSectionTextBlock(block: Block) {
  return block.size === "section-text" || block.responsiveSizes?.desktop === "section-text";
}

function getSourceSectionId(block: Block) {
  return typeof block.metadata?.sourceSectionId === "string" ? block.metadata.sourceSectionId : "";
}
