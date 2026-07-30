import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/cron/douban-media/route";

const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalCronSecret;
  }
});

describe("Douban cron route", () => {
  it("rejects requests without the configured bearer secret", async () => {
    process.env.CRON_SECRET = "test-cron-secret";

    const response = await GET(new Request("http://localhost/api/cron/douban-media"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("stays closed when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(new Request("http://localhost/api/cron/douban-media", {
      headers: { Authorization: "Bearer undefined" }
    }));

    expect(response.status).toBe(401);
  });
});
