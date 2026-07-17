import { describe, expect, it, beforeAll, afterAll } from "vitest";
import {
  signVariantCookie,
  verifyVariantCookie,
  hashAccessCode,
  matchAccessCode,
  getVariantCookieExpiresAt
} from "@/lib/variant-auth";

describe("signVariantCookie / verifyVariantCookie", () => {
  beforeAll(() => {
    process.env.ADMIN_PASSWORD = "test-password-for-variant-auth-tests";
  });

  afterAll(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("round-trips a signed variant cookie", () => {
    const expiresAt = getVariantCookieExpiresAt();
    const token = signVariantCookie("resume", 10, expiresAt);
    expect(token).not.toBe("resume");
    expect(token).toContain(".");

    const verified = verifyVariantCookie(token);
    expect(verified).not.toBeNull();
    expect(verified!.variantId).toBe("resume");
    expect(verified!.remaining).toBe(10);
    expect(verified!.expiresAt).toBe(expiresAt);
  });

  it("rejects a tampered cookie (wrong signature)", () => {
    const expiresAt = getVariantCookieExpiresAt();
    const token = signVariantCookie("resume", 10, expiresAt);
    const tampered = token.slice(0, -4) + "AAAA";
    expect(verifyVariantCookie(tampered)).toBeNull();
  });

  it("rejects an expired cookie", () => {
    const pastExpiry = Math.floor(Date.now() / 1000) - 3600;
    const token = signVariantCookie("resume", 10, pastExpiry);
    expect(verifyVariantCookie(token)).toBeNull();
  });

  it("rejects remaining <= 0", () => {
    const expiresAt = getVariantCookieExpiresAt();
    const token = signVariantCookie("resume", 0, expiresAt);
    expect(verifyVariantCookie(token)).toBeNull();
  });

  it("rejects undefined / malformed cookies", () => {
    expect(verifyVariantCookie(undefined)).toBeNull();
    expect(verifyVariantCookie("")).toBeNull();
    expect(verifyVariantCookie("just-a-string")).toBeNull();
    expect(verifyVariantCookie("no.signature.here.extra")).toBeNull();
  });
});

describe("hashAccessCode / matchAccessCode", () => {
  it("hashes an access code deterministically", () => {
    const hash1 = hashAccessCode("my-secret-code");
    const hash2 = hashAccessCode("My-Secret-Code"); // case-insensitive
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it("matches accessCode via hash when accessCodeHash is present", () => {
    const hash = hashAccessCode("resume-2024");
    const variant = { accessCode: "", accessCodeHash: hash };
    expect(matchAccessCode("resume-2024", variant)).toBe(true);
    expect(matchAccessCode("wrong-code", variant)).toBe(false);
  });

  it("falls back to plaintext comparison for backward compatibility", () => {
    const variant = { accessCode: "legacy-code" };
    expect(matchAccessCode("legacy-code", variant)).toBe(true);
    expect(matchAccessCode("LEGACY-CODE", variant)).toBe(true); // case-insensitive
    expect(matchAccessCode("wrong", variant)).toBe(false);
  });

  it("rejects empty input", () => {
    expect(matchAccessCode("", { accessCode: "" })).toBe(false);
    expect(matchAccessCode("  ", { accessCode: "" })).toBe(false);
  });
});
