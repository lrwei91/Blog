import type { Block } from "@/types/block";
import type { SiteConfig } from "@/types/site-config";

export function restoreMissingPersonalProjectLiveLinks(
  config: SiteConfig,
  defaults: SiteConfig
): SiteConfig {
  const defaultLiveHrefByProjectHref = collectDefaultLiveLinks(defaults.blocks);
  if (defaultLiveHrefByProjectHref.size === 0) return config;

  return {
    ...config,
    blocks: restoreBlockLiveLinks(config.blocks, defaultLiveHrefByProjectHref),
    contentVariants: config.contentVariants
      ? Object.fromEntries(
          Object.entries(config.contentVariants).map(([key, snapshot]) => [
            key,
            {
              ...snapshot,
              blocks: restoreBlockLiveLinks(snapshot.blocks, defaultLiveHrefByProjectHref)
            }
          ])
        )
      : config.contentVariants
  };
}

function collectDefaultLiveLinks(blocks: Block[]) {
  const liveHrefByProjectHref = new Map<string, string>();

  for (const block of blocks) {
    const projects = block.metadata?.projects;
    if (!Array.isArray(projects)) continue;

    for (const project of projects) {
      if (!project || typeof project !== "object" || Array.isArray(project)) continue;
      const entry = project as Record<string, unknown>;
      if (
        typeof entry.href === "string" &&
        typeof entry.liveHref === "string" &&
        entry.liveHref.trim()
      ) {
        liveHrefByProjectHref.set(entry.href, entry.liveHref);
      }
    }
  }

  return liveHrefByProjectHref;
}

function restoreBlockLiveLinks(
  blocks: Block[],
  defaultLiveHrefByProjectHref: Map<string, string>
) {
  return blocks.map((block) => {
    const projects = block.metadata?.projects;
    if (!Array.isArray(projects)) return block;

    let didRestoreLink = false;
    const restoredProjects = projects.map((project) => {
      if (!project || typeof project !== "object" || Array.isArray(project)) return project;
      const entry = project as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(entry, "liveHref")) return project;

      const defaultLiveHref =
        typeof entry.href === "string" ? defaultLiveHrefByProjectHref.get(entry.href) : undefined;
      if (!defaultLiveHref) return project;

      didRestoreLink = true;
      return { ...entry, liveHref: defaultLiveHref };
    });

    return didRestoreLink
      ? {
          ...block,
          metadata: {
            ...block.metadata,
            projects: restoredProjects
          }
        }
      : block;
  });
}
