import type { Block } from "@/types/block";
import type { SiteConfig } from "@/types/site-config";
import { syncDoubanMedia, type DoubanMediaSyncResult } from "@/lib/douban-media";
import { readDoubanMediaSource } from "@/lib/life-modules";

const dayMs = 24 * 60 * 60 * 1000;

type DoubanSyncer = (profileUrl: string) => Promise<DoubanMediaSyncResult>;
type DoubanSyncEntry = { result: DoubanMediaSyncResult } | { error: unknown };

export type DoubanRefreshSummary = {
  dueBlocks: number;
  updatedBlocks: number;
  failedBlocks: number;
  failedProfileUrls: string[];
};

export function isDoubanSyncDue(
  value: unknown,
  now = new Date()
) {
  const source = readDoubanMediaSource(value);
  if (!source.profileUrl || source.syncIntervalDays === 0) return false;
  if (!source.lastSyncedAt) return true;

  const lastSyncedAt = new Date(source.lastSyncedAt);
  if (Number.isNaN(lastSyncedAt.getTime())) return true;
  return now.getTime() - lastSyncedAt.getTime() >= source.syncIntervalDays * dayMs;
}

export async function refreshDueDoubanMedia(
  config: SiteConfig,
  now = new Date(),
  syncer: DoubanSyncer = syncDoubanMedia
): Promise<{ config: SiteConfig; summary: DoubanRefreshSummary }> {
  const allBlockGroups = [
    config.blocks,
    ...Object.values(config.contentVariants ?? {}).map((snapshot) => snapshot.blocks)
  ];
  const dueProfileUrls = allBlockGroups
    .flatMap((blocks) => blocks)
    .filter((block) => isDoubanSyncDue(block.metadata?.mediaSource, now))
    .map((block) => readDoubanMediaSource(block.metadata?.mediaSource).profileUrl);
  const uniqueProfileUrls = [...new Set(dueProfileUrls)];
  const syncEntries: Array<readonly [string, DoubanSyncEntry]> = await Promise.all(
    uniqueProfileUrls.map(async (profileUrl) => {
      try {
        return [profileUrl, { result: await syncer(profileUrl) }] as const;
      } catch (error) {
        return [profileUrl, { error }] as const;
      }
    })
  );
  const syncResults = new Map<string, DoubanSyncEntry>(syncEntries);
  let updatedBlocks = 0;
  let failedBlocks = 0;

  const refreshBlocks = (blocks: Block[]) =>
    blocks.map((block) => {
      if (!isDoubanSyncDue(block.metadata?.mediaSource, now)) return block;

      const source = readDoubanMediaSource(block.metadata?.mediaSource);
      const synced = syncResults.get(source.profileUrl);
      if (!synced || "error" in synced) {
        failedBlocks += 1;
        return block;
      }

      updatedBlocks += 1;
      return {
        ...block,
        metadata: {
          ...block.metadata,
          mediaItems: synced.result.items,
          mediaSource: {
            ...synced.result.source,
            syncIntervalDays: source.syncIntervalDays
          }
        },
        updatedAt: now.toISOString()
      };
    });

  return {
    config: {
      ...config,
      blocks: refreshBlocks(config.blocks),
      contentVariants: config.contentVariants
        ? Object.fromEntries(
            Object.entries(config.contentVariants).map(([key, snapshot]) => [
              key,
              { ...snapshot, blocks: refreshBlocks(snapshot.blocks) }
            ])
          )
        : config.contentVariants
    },
    summary: {
      dueBlocks: dueProfileUrls.length,
      updatedBlocks,
      failedBlocks,
      failedProfileUrls: syncEntries
        .filter(([, value]) => "error" in value)
        .map(([profileUrl]) => profileUrl)
    }
  };
}
