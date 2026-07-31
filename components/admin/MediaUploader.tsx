"use client";

import { ImageUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { uploadFolders, type UploadFolder } from "@/lib/upload";

export function MediaUploader({
  folder = "blocks",
  onUploaded,
  label = "Upload",
  uploadingLabel = "Uploading...",
  help
}: {
  folder?: UploadFolder;
  onUploaded: (url: string) => void;
  label?: string;
  uploadingLabel?: string;
  help?: string;
}) {
  const [selectedFolder, setSelectedFolder] = useState<UploadFolder>(folder);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function upload() {
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", selectedFolder);

  setIsUploading(true);
  const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const body = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  setIsUploading(false);

  if (!response.ok || !body?.url) {
  toast.error("Upload failed", { description: body?.error ?? "Unknown error" });
  return;
  }

  onUploaded(body.url);
  toast.success("Image uploaded");
  }

  return (
  <div className="grid grid-cols-1 gap-2 rounded-[12px] border border-[var(--rule)] bg-[var(--paper-2)] p-3">
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
  <input
  type="file"
  accept="image/jpeg,image/png,image/webp,image/gif"
  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
  className="min-w-0 text-sm"
  />
  <Select value={selectedFolder} onChange={(event) => setSelectedFolder(event.target.value as UploadFolder)}>
  {uploadFolders.map((item) => (
  <option key={item} value={item}>
  {item}
  </option>
  ))}
  </Select>
  <Button type="button" variant="secondary" onClick={upload} disabled={!file || isUploading}>
  <ImageUp className="h-4 w-4" />
  {isUploading ? uploadingLabel : label}
  </Button>
  </div>
  {help ? <p className="text-xs text-[var(--ink-2)]">{help}</p> : null}
  </div>
  );
}
