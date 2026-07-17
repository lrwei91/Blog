import { promises as fs } from "fs";
import path from "path";
import type { SiteConfig } from "@/types/site-config";
import { validateSiteConfig } from "@/lib/validators";
import { BlobConfigError } from "@/lib/blob-config";

const CONFIG_DIR = path.join(process.cwd(), "local-data");
const CONFIG_PATH = path.join(CONFIG_DIR, "site-config.json");

/**
 * Local config errors share the BlobConfigError base so that callers can
 * catch the full hierarchy with a single instanceof check.
 */
export class LocalConfigError extends BlobConfigError {
  constructor(message: string) {
    super(message);
    this.name = "LocalConfigError";
  }
}

export function hasLocalConfigEnabled() {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

export async function readConfigFromLocal(): Promise<SiteConfig | null> {
  let raw: string;
  try {
    raw = await fs.readFile(CONFIG_PATH, "utf-8");
  } catch (err) {
    // ENOENT (file not found) is an expected condition – signal "no local
    // config" by returning null rather than throwing.
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") {
      return null;
    }
    throw new LocalConfigError(
      `Failed to read local config file "${CONFIG_PATH}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new LocalConfigError(
      `Failed to parse JSON from local config "${CONFIG_PATH}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = validateSiteConfig(parsed);
  if (!result.success) {
    throw new LocalConfigError(
      `Local config validation failed for "${CONFIG_PATH}": ${result.error}`
    );
  }

  return result.data;
}

export async function writeConfigToLocal(config: SiteConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
