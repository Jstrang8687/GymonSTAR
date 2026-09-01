// Client-side video compression, run entirely in the browser before a proof
// video is uploaded -- shrinks phone-recorded clips enough that a slow
// mobile upload finishes before any host-side request timeout kills the
// connection mid-transfer. Never touches a server.
//
// Uses native browser APIs (HTMLVideoElement + <canvas> + MediaRecorder)
// rather than ffmpeg.wasm -- that path hit a reproducible bug baked into
// the published @ffmpeg/ffmpeg package's compiled worker (an unconditional
// "Cannot find module" thrown from its own bundle, confirmed across
// multiple versions), on top of real Turbopack/CDN/CORS friction getting a
// worker-based library loaded at all. This re-encodes by literally playing
// the source video into a canvas at a smaller size and re-recording it --
// less powerful than a real encoder, but zero dependencies and MediaRecorder
// has been well-supported on iOS Safari since iOS 14.3.

// Scale down to at most 480p on the long edge and re-encode at a modest
// bitrate -- audio is dropped entirely (not needed to verify a lift, and
// canvas.captureStream() carries video only, which sidesteps ever having to
// mux an audio track back in).
const MAX_DIMENSION = 854;
const TARGET_FPS = 24;
const TARGET_BITS_PER_SECOND = 1_500_000;

const CANDIDATE_MIME_TYPES = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];

function pickMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

function waitForEvent(target: EventTarget, event: string): Promise<void> {
  return new Promise((resolve) => {
    target.addEventListener(event, () => resolve(), { once: true });
  });
}

export interface CompressVideoOptions {
  onProgress?: (ratio: number) => void;
}

// Compresses a video file client-side. Falls back to returning the original
// file untouched if the browser lacks support or anything errors -- this is
// a best-effort optimization, not something that should ever block someone
// from uploading their proof.
export async function compressVideo(file: File, options: CompressVideoOptions = {}): Promise<File> {
  const mimeType = pickMimeType();
  if (!mimeType) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = objectUrl;

    await Promise.race([
      waitForEvent(video, "loadedmetadata"),
      waitForEvent(video, "error").then(() => {
        throw new Error("Could not read video metadata.");
      }),
    ]);

    const { videoWidth, videoHeight, duration } = video;
    if (!videoWidth || !videoHeight || !Number.isFinite(duration) || duration <= 0) {
      throw new Error("Video has no readable dimensions or duration.");
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(videoWidth, videoHeight));
    const outWidth = Math.max(2, Math.round((videoWidth * scale) / 2) * 2);
    const outHeight = Math.max(2, Math.round((videoHeight * scale) / 2) * 2);

    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");

    const stream = canvas.captureStream(TARGET_FPS);
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: TARGET_BITS_PER_SECOND });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const recordingStopped = waitForEvent(recorder, "stop");

    // A setInterval-driven draw loop rather than requestAnimationFrame --
    // rAF is tied to the page's paint schedule, and this is offscreen frame
    // sampling, not an on-screen animation, so it doesn't need (or want)
    // that dependency.
    const intervalId = setInterval(() => {
      if (video.ended) return;
      ctx!.drawImage(video, 0, 0, outWidth, outHeight);
      options.onProgress?.(duration > 0 ? video.currentTime / duration : 0);
    }, 1000 / TARGET_FPS);

    recorder.start();
    await video.play();
    await waitForEvent(video, "ended");
    clearInterval(intervalId);
    recorder.stop();
    await recordingStopped;

    const outputType = mimeType.split(";")[0];
    const blob = new Blob(chunks, { type: outputType });
    if (blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const ext = outputType === "video/mp4" ? "mp4" : "webm";
    return new File([blob], `compressed.${ext}`, { type: outputType });
  } catch (e) {
    console.error("[compressVideo] falling back to uncompressed upload:", e);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
