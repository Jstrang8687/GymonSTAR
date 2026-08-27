import "server-only";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "workout-videos");

export const MAX_VIDEO_BYTES = 75 * 1024 * 1024; // 75MB
export const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);

export interface SavedVideo {
  filename: string;
  mimeType: string;
}

export async function saveWorkoutVideo(file: File): Promise<SavedVideo> {
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    throw new Error("Unsupported video format. Use MP4, MOV, or WebM.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`Video is too large (max ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)}MB).`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { filename, mimeType: file.type };
}

export async function readWorkoutVideo(filename: string): Promise<Buffer> {
  // Reject anything that isn't a bare filename (defense against path traversal).
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid filename.");
  }
  return readFile(path.join(UPLOAD_DIR, filename));
}

export async function deleteWorkoutVideo(filename: string): Promise<void> {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) return;
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}
