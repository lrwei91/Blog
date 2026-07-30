import { readConfigFromBlob, writeConfigToBlob } from "@/lib/blob-config";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { refreshDueDoubanMedia } from "@/lib/douban-media-refresh";
import { readConfigFromLocal, writeConfigToLocal } from "@/lib/local-config";
import type { SiteConfig } from "@/types/site-config";

export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const currentConfig = await readWritableConfig();
  const currentRevision = currentConfig.revision ?? 0;
  const { config, summary } = await refreshDueDoubanMedia(currentConfig, startedAt);

  if (summary.updatedBlocks === 0) {
    return Response.json({
      ok: summary.failedBlocks === 0,
      ...summary,
      failedProfileUrls: undefined,
      saved: false,
      revision: currentRevision
    });
  }

  const latestConfig = await readWritableConfig();
  if (
    (latestConfig.revision ?? 0) !== currentRevision ||
    latestConfig.updatedAt !== currentConfig.updatedAt
  ) {
    return Response.json(
      {
        error: "Config changed during Douban sync; skipped saving to avoid overwriting newer edits",
        saved: false
      },
      { status: 409 }
    );
  }

  const updatedConfig: SiteConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    revision: currentRevision + 1
  };
  await writeWritableConfig(updatedConfig);

  return Response.json({
    ok: summary.failedBlocks === 0,
    ...summary,
    failedProfileUrls: undefined,
    saved: true,
    revision: updatedConfig.revision
  });
}

async function readWritableConfig() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const config = await readConfigFromBlob();
    if (!config) throw new Error("Blob config is not initialized");
    return config;
  }

  return (await readConfigFromLocal()) ?? defaultSiteConfig;
}

async function writeWritableConfig(config: SiteConfig) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeConfigToBlob(config);
    return;
  }
  await writeConfigToLocal(config);
}
