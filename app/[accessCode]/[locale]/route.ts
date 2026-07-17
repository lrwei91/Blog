import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";
import {
  publicLanguageTransitionCookieName,
  publicLocaleCookieName,
  publicVariantCookieName
} from "@/lib/public-variant-cookies";
import { findAvailableLocaleForVariant, findVariantByAccessCode } from "@/lib/utils";
import { signVariantCookie, getVariantCookieExpiresAt, getVariantCookieMaxAge } from "@/lib/variant-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ accessCode: string; locale: string }> }
) {
  const { accessCode, locale } = await context.params;
  const config = await getSiteConfig(request.headers.get("accept-language"));
  const variant = findVariantByAccessCode(config, accessCode);

  if (!variant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const matchedLocale = findAvailableLocaleForVariant(config, variant.id, locale);
  if (!matchedLocale) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2026-07-17 P0: variant Cookie 使用 HMAC 签名
  const expiresAt = getVariantCookieExpiresAt();
  const remaining = 10;
  const signedCookie = signVariantCookie(variant.id, remaining, expiresAt);

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(publicVariantCookieName, signedCookie, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getVariantCookieMaxAge()
  });
  response.cookies.set(publicLocaleCookieName, matchedLocale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  response.cookies.set(publicLanguageTransitionCookieName, matchedLocale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60
  });

  return response;
}
