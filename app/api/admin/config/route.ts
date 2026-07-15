import { NextResponse } from "next/server";
import { BlobTokenMissingError, writeConfigToBlob } from "@/lib/blob-config";
import { writeConfigToLocal } from "@/lib/local-config";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import { normalizeContentFlowConfig } from "@/lib/utils";
import { validateSiteConfig } from "@/lib/validators";

export async function GET(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSiteConfig(request.headers.get("accept-language")));
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

  const updatedConfig = normalizeContentFlowConfig({ ...result.data, updatedAt: new Date().toISOString() });

  try {
    await writeConfigToBlob(updatedConfig);
    return NextResponse.json({ success: true, updatedAt: updatedConfig.updatedAt });
  } catch (error) {
    if (error instanceof BlobTokenMissingError) {
      try {
        await writeConfigToLocal(updatedConfig);
        return NextResponse.json({ success: true, updatedAt: updatedConfig.updatedAt });
      } catch {
        return NextResponse.json({ error: "Local save failed" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
