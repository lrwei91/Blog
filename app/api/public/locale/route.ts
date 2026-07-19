import { NextResponse, type NextRequest } from "next/server";
import { publicLocaleCookieName } from "@/lib/public-variant-cookies";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { locale?: unknown } | null;
  const locale = typeof body?.locale === "string" ? body.locale.trim() : "";

  // 仅接受 BCP-47 形态的语言码，避免写入任意 Cookie 值
  if (!locale || !/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(publicLocaleCookieName, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
