const maxImageBytes = 5 * 1024 * 1024;

export async function GET(request: Request) {
  const remoteUrl = new URL(request.url).searchParams.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(remoteUrl);
  } catch {
    return new Response("Invalid image URL", { status: 400 });
  }

  const allowedHost =
    url.protocol === "https:" &&
    (url.hostname === "doubanio.com" ||
      url.hostname.endsWith(".doubanio.com") ||
      url.hostname === "douban.com" ||
      url.hostname.endsWith(".douban.com"));
  if (!allowedHost) {
    return new Response("Image host is not allowed", { status: 400 });
  }

  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif",
      Referer: "https://www.douban.com/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/135 Safari/537.36"
    },
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(12_000)
  });
  const contentType = response.headers.get("content-type") ?? "";
  const declaredSize = Number(response.headers.get("content-length") ?? "0");
  if (!response.ok || !contentType.startsWith("image/") || declaredSize > maxImageBytes) {
    return new Response("Image is unavailable", { status: 502 });
  }

  const image = await response.arrayBuffer();
  if (image.byteLength > maxImageBytes) {
    return new Response("Image is too large", { status: 413 });
  }

  return new Response(image, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    }
  });
}
