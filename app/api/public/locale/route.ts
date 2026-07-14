import { NextResponse, type NextRequest } from "next/server";
import { publicLocaleCookieName } from "@/lib/public-variant-cookies";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { locale?: unknown } | null;
  const locale = typeof body?.locale === "string" ? body.locale.trim() : "";

  if (!locale) {
    return NextResponse.json({ error: "Missing locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(publicLocaleCookieName, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
