import { describe, expect, it } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { migrateSiteConfigV2 } from "@/lib/site-config-migrations";
import type { SiteConfig } from "@/types/site-config";

describe("site config v2 migration", () => {
  it("moves the project group after skills and before experience in main and variant content", () => {
    const versionOne = structuredClone(defaultSiteConfig) as SiteConfig;
    versionOne.version = 1;
    versionOne.blocks = moveProjectsToEnd(versionOne.blocks);
    versionOne.contentVariants = {
      "main:en": {
        profile: versionOne.profile,
        sections: [],
        blocks: moveProjectsToEnd(structuredClone(versionOne.blocks)),
        theme: versionOne.theme
      }
    };

    const migrated = migrateSiteConfigV2(versionOne);
    expect(migrated.version).toBe(2);
    expectSectionOrder(migrated.blocks);
    expectSectionOrder(migrated.contentVariants!["main:en"].blocks);
  });

  it("preserves manual project ordering after version 2", () => {
    const versionTwo = structuredClone(defaultSiteConfig);
    versionTwo.version = 2;
    versionTwo.blocks = moveProjectsToEnd(versionTwo.blocks);
    const before = versionTwo.blocks.map((block) => block.id);

    expect(migrateSiteConfigV2(versionTwo).blocks.map((block) => block.id)).toEqual(before);
  });
});

function moveProjectsToEnd(blocks: SiteConfig["blocks"]) {
  const projectBlocks = blocks.filter((block) =>
    block.metadata?.sourceSectionId === "projects" || Array.isArray(block.metadata?.projects)
  );
  const otherBlocks = blocks.filter((block) => !projectBlocks.includes(block));
  return [...otherBlocks, ...projectBlocks].map((block, index) => ({ ...block, sortOrder: index + 1 }));
}

function expectSectionOrder(blocks: SiteConfig["blocks"]) {
  const ids = blocks.map((block) => block.id);
  const skills = ids.indexOf("text-skills");
  const projects = ids.indexOf("text-projects");
  const projectContent = ids.indexOf("personal-projects-showcase");
  const experience = ids.indexOf("text-experience");
  expect(skills).toBeGreaterThanOrEqual(0);
  expect(projects).toBeGreaterThan(skills);
  expect(projectContent).toBe(projects + 1);
  expect(experience).toBe(projectContent + 1);
}
