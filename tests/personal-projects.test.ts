import { describe, expect, it } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { restoreMissingPersonalProjectLiveLinks } from "@/lib/personal-projects";

describe("restoreMissingPersonalProjectLiveLinks", () => {
  it("restores a known deployment URL when an older project entry lacks liveHref", () => {
    const defaults = structuredClone(defaultSiteConfig);
    const config = structuredClone(defaultSiteConfig);
    const project = getProject(config, "CineScope");
    delete project.liveHref;

    const restored = restoreMissingPersonalProjectLiveLinks(config, defaults);

    expect(getProject(restored, "CineScope").liveHref).toBe(
      "https://lrwei91.github.io/CineScope/#tv_cn"
    );
  });

  it("preserves an explicitly empty liveHref", () => {
    const defaults = structuredClone(defaultSiteConfig);
    const config = structuredClone(defaultSiteConfig);
    getProject(config, "CineScope").liveHref = "";

    const restored = restoreMissingPersonalProjectLiveLinks(config, defaults);

    expect(getProject(restored, "CineScope").liveHref).toBe("");
  });
});

function getProject(config: typeof defaultSiteConfig, title: string) {
  const block = config.blocks.find((item) => Array.isArray(item.metadata?.projects));
  const projects = block?.metadata?.projects;
  if (!Array.isArray(projects)) throw new Error("Personal projects block not found");

  const project = projects.find(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (item as Record<string, unknown>).title === title
  );
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error(`Project "${title}" not found`);
  }

  return project as Record<string, unknown>;
}
