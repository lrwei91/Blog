import { ImageResponse } from "next/og";
import { getSiteConfig } from "@/lib/site-config";

// The site configuration can fall back to a local file in development.
// Keep this route on the Node.js runtime so that fallback remains supported.
// 2026-07-17: force-dynamic prevents build-time prerendering from triggering
// the production BLOB_READ_WRITE_TOKEN hard-fail (token is runtime-only on Vercel).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = {
  width: 64,
  height: 64
};
export const contentType = "image/png";

export default async function Icon() {
  const config = await getSiteConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const avatarUrl = config.profile.avatarUrl?.startsWith("/")
    ? `${siteUrl}${config.profile.avatarUrl}`
    : config.profile.avatarUrl || `${siteUrl}/default-avatar.svg`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "999px",
          overflow: "hidden",
          background: "#ffffff",
          display: "flex"
        }}
      >
        <img
          src={avatarUrl}
          alt=""
          width="64"
          height="64"
          style={{
            width: "64px",
            height: "64px",
            objectFit: "cover"
          }}
        />
      </div>
    ),
    size
  );
}
