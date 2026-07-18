import { describe, expect, it } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";
import {
  applyContentOutlineGroupOrder,
  buildContentOutlineGroups,
  moveContentOutlineGroup,
  reorderContentOutlineGroups,
  setContentOutlineGroupVisibility
} from "@/lib/admin-content-outline";

describe("admin content outline", () => {
  it("groups a heading with every block until the next heading", () => {
    const groups = buildContentOutlineGroups(defaultSiteConfig.blocks);
    const experience = groups.find((group) => group.moduleType === "experience");
    expect(experience?.blockIds).toEqual(["text-experience", "job-baismgs", "job-zhuque", "job-tianshang"]);
    expect(experience?.primaryEditBlockId).toBe("job-baismgs");

    const travel = groups.find((group) => group.moduleType === "travel");
    expect(travel?.blockIds).toEqual(["text-travel", "travel-footprint"]);
    expect(travel?.primaryEditBlockId).toBe("travel-footprint");
  });

  it("keeps hidden special modules in the outline", () => {
    const groups = buildContentOutlineGroups(defaultSiteConfig.blocks);
    const now = groups.find((group) => group.moduleType === "now");
    expect(now).toBeDefined();
    expect(now?.isVisible).toBe(false);
  });

  it("moves complete groups and keeps sequential sort orders", () => {
    const groups = buildContentOutlineGroups(defaultSiteConfig.blocks);
    const travel = groups.find((group) => group.moduleType === "travel");
    const projects = groups.find((group) => group.moduleType === "projects");
    expect(travel && projects).toBeTruthy();
    if (!travel || !projects) return;

    const moved = reorderContentOutlineGroups(defaultSiteConfig.blocks, projects.id, travel.id, "now");
    const nextGroups = buildContentOutlineGroups(moved);
    expect(nextGroups.findIndex((group) => group.id === projects.id)).toBe(nextGroups.findIndex((group) => group.id === travel.id) - 1);
    [...moved].sort((a, b) => a.sortOrder - b.sortOrder).forEach((block, index) => expect(block.sortOrder).toBe(index + 1));
  });

  it("supports positional moves and restoring an earlier group order", () => {
    const groups = buildContentOutlineGroups(defaultSiteConfig.blocks);
    const originalOrder = groups.map((group) => group.id);
    const moved = moveContentOutlineGroup(defaultSiteConfig.blocks, groups.at(-1)!.id, 0, "move");
    expect(buildContentOutlineGroups(moved)[0].id).toBe(groups.at(-1)!.id);
    const restored = applyContentOutlineGroupOrder(moved, originalOrder, "restore");
    expect(buildContentOutlineGroups(restored).map((group) => group.id)).toEqual(originalOrder);
  });

  it("toggles every block in a module together", () => {
    const travel = buildContentOutlineGroups(defaultSiteConfig.blocks).find((group) => group.moduleType === "travel");
    expect(travel).toBeDefined();
    if (!travel) return;
    const hidden = setContentOutlineGroupVisibility(defaultSiteConfig.blocks, travel.id, false, "hide");
    expect(hidden.filter((block) => travel.blockIds.includes(block.id)).every((block) => !block.isVisible)).toBe(true);
  });
});
