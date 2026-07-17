import { NextResponse, type NextRequest } from "next/server";
import {
  publicLanguageTransitionCookieName,
  publicLocaleCookieName,
  publicVariantCookieName
} from "@/lib/public-variant-cookies";
import { signVariantCookie, verifyVariantCookie, getVariantCookieMaxAge } from "@/lib/variant-auth";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  if (request.nextUrl.searchParams.has("reset")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.search = "";
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(publicLanguageTransitionCookieName);
    response.cookies.delete(publicLocaleCookieName);
    response.cookies.delete(publicVariantCookieName);
    return response;
  }

  const cookieValue = request.cookies.get(publicVariantCookieName)?.value;
  const verified = verifyVariantCookie(cookieValue);
  const response = NextResponse.next();

  if (!verified) {
    // 验签失败或无 Cookie：清除残留，回主版本
    if (cookieValue) {
      response.cookies.delete(publicVariantCookieName);
    }
    return response;
  }

  // 签名有效但 remaining 已耗尽
  if (verified.remaining <= 1) {
    response.cookies.delete(publicVariantCookieName);
    return response;
  }

  // remaining - 1 并重新签名（保持原 expiresAt）
  const newRemaining = verified.remaining - 1;
  const renewedCookie = signVariantCookie(verified.variantId, newRemaining, verified.expiresAt);
  response.cookies.set(publicVariantCookieName, renewedCookie, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: getVariantCookieMaxAge()
  });

  return response;
}

export const config = {
  matcher: "/"
};
