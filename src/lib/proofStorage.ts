import "server-only";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Jimp } from "jimp";

// Deliberately reusing the original "workout-videos" directory name (rather
// than renaming to "workout-proof") so existing uploaded files stay valid
// without needing to move anything on disk.
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "workout-videos");

export const MAX_PROOF_BYTES = 75 * 1024 * 1024; // 75MB

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Real minimums, not just "greater than zero" -- a screenshot of an actual
// fitness app is never a 2KB file, and a real workout video is never 20KB.
const MIN_IMAGE_BYTES = 8 * 1024;
const MIN_VIDEO_BYTES = 150 * 1024;
const MIN_IMAGE_DIMENSION = 200; // px, on the shorter side

export interface SavedProof {
  filename: string;
  mimeType: string;
}

export function isProofImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

// Checks the file's actual leading bytes against the signature its format
// requires, so a renamed/mislabeled file (wrong extension, spoofed MIME
// type from the browser) gets caught instead of trusted at face value.
function matchesFileSignature(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/png":
      return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/webp":
      return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
    case "video/webm":
      return buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    case "video/mp4":
    case "video/quicktime":
    case "video/x-m4v":
      // ISO base media file format (MP4/MOV/M4V): "ftyp" box at byte offset 4.
      return buffer.subarray(4, 8).toString("ascii") === "ftyp";
    default:
      return false;
  }
}

export async function saveWorkoutProof(file: File): Promise<SavedProof> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    throw new Error("Unsupported file. Use a video (MP4, MOV, WebM) or an image (PNG, JPG, WebP).");
  }

  const isImage = isProofImage(file.type);
  const minBytes = isImage ? MIN_IMAGE_BYTES : MIN_VIDEO_BYTES;
  if (file.size < minBytes) {
    throw new Error(
      `That file is too small to be a real ${isImage ? "screenshot" : "video"} (min ${Math.round(minBytes / 1024)}KB). Make sure you're uploading the actual file, not a thumbnail.`
    );
  }
  if (file.size > MAX_PROOF_BYTES) {
    throw new Error(`File is too large (max ${Math.round(MAX_PROOF_BYTES / 1024 / 1024)}MB).`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!matchesFileSignature(buffer, file.type)) {
    throw new Error("That file doesn't look like a real, unmodified " + (isImage ? "image" : "video") + " -- try re-exporting or re-uploading it.");
  }

  if (isImage) {
    let width: number;
    let height: number;
    try {
      const image = await Jimp.read(buffer);
      width = image.bitmap.width;
      height = image.bitmap.height;
    } catch {
      throw new Error("Couldn't read that image -- it may be corrupted.");
    }
    if (Math.min(width, height) < MIN_IMAGE_DIMENSION) {
      throw new Error(`Image is too small (${width}x${height}) to be a real screenshot -- upload the full-size image.`);
    }
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { filename, mimeType: file.type };
}

export async function readWorkoutProof(filename: string): Promise<Buffer> {
  // Reject anything that isn't a bare filename (defense against path traversal).
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid filename.");
  }
  return readFile(path.join(UPLOAD_DIR, filename));
}

export async function deleteWorkoutProof(filename: string): Promise<void> {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) return;
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
}
