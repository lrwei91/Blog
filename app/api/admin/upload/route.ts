import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { allowedImageTypes, getFileExtensionForType, isUploadFolder, maxUploadSize } from "@/lib/upload";

const LOCAL_IMAGE_DIR = path.join(process.cwd(), "public", "images");

export async function POST(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!isUploadFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  if (!allowedImageTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only jpg, png, webp, and gif images are allowed" }, { status: 400 });
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  const extension = getFileExtensionForType(file.type);
  const filename = `${crypto.randomUUID()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const pathname = `images/${folder}/${filename}`;
    const blob = await put(pathname, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  }

  // Local fallback: save to public/images/{folder}/
  const dir = path.join(LOCAL_IMAGE_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ url: `/images/${folder}/${filename}` });
}
