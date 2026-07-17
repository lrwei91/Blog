import { head, put } from "@vercel/blob";
import type { SiteConfig } from "@/types/site-config";
import { validateSiteConfig } from "@/lib/validators";

const CONFIG_PATH = "config/site-config.json";

/* ------------------------------------------------------------------ */
/* Blob error classification                                          */
/* ------------------------------------------------------------------ */

/** Base class for all blob/local config errors. */
export class BlobConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlobConfigError";
  }
}

/** Thrown when BLOB_READ_WRITE_TOKEN is absent. */
export class BlobTokenMissingError extends BlobConfigError {
  constructor() {
    super("Blob token is missing. Local preview works, but remote saving is disabled.");
    this.name = "BlobTokenMissingError";
  }
}

/** Thrown when the blob fetch / HTTP request itself fails. */
export class BlobFetchError extends BlobConfigError {
  constructor(message: string) {
    super(message);
    this.name = "BlobFetchError";
  }
}

/** Thrown when the fetched blob body cannot be parsed as JSON. */
export class ConfigParseError extends BlobConfigError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigParseError";
  }
}

/** Thrown when the parsed config fails schema validation. */
export class ConfigValidationError extends BlobConfigError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/* ------------------------------------------------------------------ */
/* Blob read / write                                                  */
/* ------------------------------------------------------------------ */

export async function readConfigFromBlob(): Promise<SiteConfig | null> {
  if (!hasBlobToken()) {
    return null;
  }

  let meta;
  try {
    meta = await head(CONFIG_PATH);
  } catch (err) {
    throw new BlobFetchError(
      `Failed to head blob "${CONFIG_PATH}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  let response: Response;
  try {
    response = await fetch(meta.url, { cache: "no-store" });
  } catch (err) {
    throw new BlobFetchError(
      `Failed to fetch blob "${CONFIG_PATH}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!response.ok) {
    throw new BlobFetchError(
      `Blob fetch returned HTTP ${response.status} for "${CONFIG_PATH}"`
    );
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (err) {
    throw new ConfigParseError(
      `Failed to parse JSON from blob "${CONFIG_PATH}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = validateSiteConfig(parsed);
  if (!result.success) {
    throw new ConfigValidationError(`Config validation failed for blob "${CONFIG_PATH}": ${result.error}`);
  }

  return result.data;
}

export async function writeConfigToBlob(config: SiteConfig): Promise<void> {
  if (!hasBlobToken()) {
    throw new BlobTokenMissingError();
  }

  await put(CONFIG_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true
  });
}
