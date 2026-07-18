import type { Block } from "@/types/block";
import type { ContentOrderItem } from "@/lib/utils";
import type { PublicDesktopContentColumns } from "@/lib/public-content-layout";
import { BlockGrid } from "@/components/site/BlockGrid";
import { BlockCard } from "@/components/blocks/BlockCard";
import { ExperienceTimeline } from "@/components/site/ExperienceTimeline";
import { TravelFootprint } from "@/components/site/TravelFootprint";
import { PersonalProjects } from "@/components/site/PersonalProjects";
import { NowStatus } from "@/components/site/NowStatus";
import { MediaShelf } from "@/components/site/MediaShelf";
import { PhotoStories } from "@/components/site/PhotoStories";

export function ContentArea({
  topLevelBlocks = [],
  orderedContentItems,
  desktopContentColumns = 3,
  enableImagePreview = true
}: {
  topLevelBlocks?: Block[];
  orderedContentItems?: ContentOrderItem[];
  desktopContentColumns?: PublicDesktopContentColumns;
  enableImagePreview?: boolean;
}) {
  const contentItems =
    orderedContentItems ??
    (topLevelBlocks.length > 0
      ? [{ id: "top-level-blocks" as const, type: "top-level-blocks" as const, blocks: topLevelBlocks, sortOrder: 0 }]
      : []);

  return (
    <section
      data-desktop-content-columns={desktopContentColumns}
      className="content-grid-container public-content min-w-0 lg:w-full lg:max-w-[var(--site-content-max-width)] lg:justify-self-center"
    >
      {contentItems.map((item, itemIndex) => {
        if (item.type === "top-level-blocks") {
          if (item.blocks.length === 0) return null;
          const previousItem = contentItems[itemIndex - 1];
          const sourceSectionId = previousItem?.type === "text-block" ? getSourceSectionId(previousItem.block) : "";
          const isExperienceGroup = sourceSectionId === "experience";
          const isTravelGroup = sourceSectionId === "travel";
          const isProjectsGroup = sourceSectionId === "projects";
          const isNowGroup = sourceSectionId === "now";
          const isMediaGroup = sourceSectionId === "media";
          const isPhotosGroup = sourceSectionId === "photos";

          return (
            <div key={item.id} className="public-content__block-group">
              {isExperienceGroup ? (
                <ExperienceTimeline blocks={item.blocks} />
              ) : isTravelGroup ? (
                <TravelFootprint block={item.blocks[0]} />
              ) : isProjectsGroup && previousItem?.type === "text-block" ? (
                <PersonalProjects block={item.blocks[0]} />
              ) : isNowGroup ? (
                <NowStatus block={item.blocks[0]} />
              ) : isMediaGroup ? (
                <MediaShelf block={item.blocks[0]} />
              ) : isPhotosGroup ? (
                <PhotoStories block={item.blocks[0]} enablePreview={enableImagePreview} />
              ) : (
                <BlockGrid
                  blocks={item.blocks}
                  layout="grid"
                  gap="md"
                  desktopContentColumns={desktopContentColumns}
                  hidePlaceholderContent
                />
              )}
            </div>
          );
        }

        return (
          <BlockCard
            key={item.id}
            block={item.block}
            disableActions
            hidePlaceholderContent
            withLayout={false}
            sectionNumber={contentItems.slice(0, itemIndex + 1).filter((contentItem) => contentItem.type === "text-block").length}
            className="min-h-0"
          />
        );
      })}
    </section>
  );
}

function getSourceSectionId(block: Block) {
  return typeof block.metadata?.sourceSectionId === "string" ? block.metadata.sourceSectionId : "";
}
