import { promises as fs } from "fs";
import path from "path";
import type { SiteConfig } from "@/types/site-config";
import { validateSiteConfig } from "@/lib/validators";

const CONFIG_DIR = path.join(process.cwd(), "local-data");
const CONFIG_PATH = path.join(CONFIG_DIR, "site-config.json");

export class LocalConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocalConfigError";
  }
}

export function hasLocalConfigEnabled() {
  return !process.env.BLOB_READ_WRITE_TOKEN;
}

export async function readConfigFromLocal(): Promise<SiteConfig | null> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const result = validateSiteConfig(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function writeConfigToLocal(config: SiteConfig): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
