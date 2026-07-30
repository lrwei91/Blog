import { getCurrentSessionIsValid } from "@/lib/auth";
import { syncDoubanMedia } from "@/lib/douban-media";

export async function POST(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const profileUrl =
    body && typeof body === "object" && typeof body.profileUrl === "string"
      ? body.profileUrl
      : "";

  try {
    return Response.json(await syncDoubanMedia(profileUrl));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "豆瓣同步失败" },
      { status: 400 }
    );
  }
}
