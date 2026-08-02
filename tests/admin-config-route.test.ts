import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSiteConfig } from "@/lib/default-site-config";

const routeMocks = vi.hoisted(() => ({
  getCurrentSessionIsValid: vi.fn(),
  readConfigFromBlob: vi.fn(),
  writeConfigToBlob: vi.fn(),
  readConfigFromLocal: vi.fn(),
  writeConfigToLocal: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getCurrentSessionIsValid: routeMocks.getCurrentSessionIsValid
}));

vi.mock("@/lib/blob-config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/blob-config")>();
  return {
    ...actual,
    readConfigFromBlob: routeMocks.readConfigFromBlob,
    writeConfigToBlob: routeMocks.writeConfigToBlob
  };
});

vi.mock("@/lib/local-config", () => ({
  readConfigFromLocal: routeMocks.readConfigFromLocal,
  writeConfigToLocal: routeMocks.writeConfigToLocal
}));

import { PUT } from "@/app/api/admin/config/route";

const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "test-blob-token";
  routeMocks.getCurrentSessionIsValid.mockReset().mockResolvedValue(true);
  routeMocks.readConfigFromBlob.mockReset();
  routeMocks.writeConfigToBlob.mockReset().mockResolvedValue(undefined);
  routeMocks.readConfigFromLocal.mockReset();
  routeMocks.writeConfigToLocal.mockReset();
});

afterEach(() => {
  if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
});

describe("admin config route revision control", () => {
  it("requires the client to provide its expected revision", async () => {
    const response = await PUT(createRequest(defaultSiteConfig));

    expect(response.status).toBe(400);
    expect(routeMocks.readConfigFromBlob).not.toHaveBeenCalled();
    expect(routeMocks.writeConfigToBlob).not.toHaveBeenCalled();
  });

  it("rejects a stale editor snapshot before writing", async () => {
    routeMocks.readConfigFromBlob.mockResolvedValue({ ...defaultSiteConfig, revision: 4 });

    const response = await PUT(createRequest(defaultSiteConfig, 3));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ currentRevision: 4 });
    expect(routeMocks.writeConfigToBlob).not.toHaveBeenCalled();
  });

  it("increments and returns the authoritative revision after saving", async () => {
    routeMocks.readConfigFromBlob.mockResolvedValue({ ...defaultSiteConfig, revision: 4 });

    const response = await PUT(createRequest(defaultSiteConfig, 4));

    expect(response.status).toBe(200);
    expect(routeMocks.writeConfigToBlob).toHaveBeenCalledWith(
      expect.objectContaining({ revision: 5 })
    );
    await expect(response.json()).resolves.toMatchObject({ success: true, revision: 5 });
  });

  it("stops the save when the authoritative Blob revision is unavailable", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    routeMocks.readConfigFromBlob.mockRejectedValue(new Error("temporary Blob failure"));

    const response = await PUT(createRequest(defaultSiteConfig, defaultSiteConfig.revision ?? 0));

    expect(response.status).toBe(503);
    expect(routeMocks.readConfigFromLocal).not.toHaveBeenCalled();
    expect(routeMocks.writeConfigToBlob).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});

function createRequest(config: typeof defaultSiteConfig, expectedRevision?: number) {
  return new Request("http://localhost/api/admin/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...structuredClone(config),
      ...(expectedRevision === undefined ? {} : { expectedRevision })
    })
  });
}
