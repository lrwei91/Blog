import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { publicVariantCookieName } from "@/lib/public-variant-cookies";
import { getVariantCookieExpiresAt, signVariantCookie, verifyVariantCookie } from "@/lib/variant-auth";

describe("public variant view counting", () => {
  beforeAll(() => {
    process.env.ADMIN_PASSWORD = "proxy-test-password";
  });

  afterAll(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("does not consume a view on the welcome route", () => {
    const token = signVariantCookie("private", 10, getVariantCookieExpiresAt());
    const response = proxy(createRequest("/", token));
    expect(response.cookies.get(publicVariantCookieName)).toBeUndefined();
  });

  it("consumes one view when the visitor opens the profile route", () => {
    const token = signVariantCookie("private", 10, getVariantCookieExpiresAt());
    const response = proxy(createRequest("/profile", token));
    const renewed = response.cookies.get(publicVariantCookieName)?.value;
    expect(renewed).toBeTruthy();
    expect(verifyVariantCookie(renewed)?.remaining).toBe(9);
  });
});

function createRequest(pathname: string, token: string) {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: { cookie: `${publicVariantCookieName}=${token}` }
  });
}
