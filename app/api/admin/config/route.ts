import { NextResponse } from "next/server";
import { BlobTokenMissingError, readConfigFromBlob, writeConfigToBlob } from "@/lib/blob-config";
import { readConfigFromLocal, writeConfigToLocal } from "@/lib/local-config";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import { defaultSiteConfig } from "@/lib/default-site-config";
import { normalizeContentFlowConfig } from "@/lib/utils";
import { validateSiteConfig } from "@/lib/validators";
import { hashAccessCode } from "@/lib/variant-auth";

export async function GET(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSiteConfig(request.headers.get("accept-language")));
}

/**
 * Resolve the *current* stored revision from whatever source holds the
 * authoritative config (Blob first, then local, then the built-in default).
 * Returns 0 when no revision is present (backward compatibility with older
 * config snapshots that predate the revision field).
 */
async function resolveCurrentRevision(): Promise<number> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const current = await readConfigFromBlob();
    if (!current) {
      throw new Error("Blob config is not initialized");
    }
    return current.revision ?? 0;
  }

  const current = await readConfigFromLocal();
  return current?.revision ?? defaultSiteConfig.revision ?? 0;
}

export async function PUT(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateSiteConfig(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // ── Optimistic concurrency control via revision ──────────────────────
  const expectedRevision = typeof body?.expectedRevision === "number" && Number.isInteger(body.expectedRevision) && body.expectedRevision >= 0
    ? body.expectedRevision
    : null;
  if (expectedRevision === null) {
    return NextResponse.json({ error: "Expected revision is required" }, { status: 400 });
  }
  let currentRevision: number;
  try {
    currentRevision = await resolveCurrentRevision();
  } catch (error) {
    console.error("Failed to resolve the current config revision", error);
    return NextResponse.json({ error: "Current config is unavailable" }, { status: 503 });
  }

  if (expectedRevision !== currentRevision) {
    return NextResponse.json(
      { error: "Config revision conflict", currentRevision },
      { status: 409 }
    );
  }

  // 2026-07-17 P0: 保存时自动将明文 accessCode 转为哈希，明文不再存入公共 Blob
  const configWithHashedCodes = {
    ...result.data,
    settings: {
      ...result.data.settings,
      variants: {
        ...result.data.settings.variants,
        variants: result.data.settings.variants.variants.map((variant) => {
          if (variant.accessCode && variant.accessCode.trim()) {
            return {
              ...variant,
              accessCodeHash: hashAccessCode(variant.accessCode),
              accessCode: "" // 清空明文，不再存入公共 Blob
            };
          }
          return variant;
        })
      }
    }
  };

  const updatedConfig = normalizeContentFlowConfig({
    ...configWithHashedCodes,
    updatedAt: new Date().toISOString(),
    revision: currentRevision + 1
  });

  try {
    await writeConfigToBlob(updatedConfig);
    return NextResponse.json({ success: true, updatedAt: updatedConfig.updatedAt, revision: updatedConfig.revision });
  } catch (error) {
    if (error instanceof BlobTokenMissingError) {
      try {
        await writeConfigToLocal(updatedConfig);
        return NextResponse.json({ success: true, updatedAt: updatedConfig.updatedAt, revision: updatedConfig.revision });
      } catch {
        return NextResponse.json({ error: "Local save failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
