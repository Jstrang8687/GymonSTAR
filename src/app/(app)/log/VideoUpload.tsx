"use client";

import { useRef, useState, useTransition } from "react";
import { attachWorkoutVideo } from "./actions";

export function VideoUpload({ workoutLogId }: { workoutLogId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done">("idle");
  const [bonusXp, setBonusXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setFileName(file.name);
    const formData = new FormData();
    formData.set("video", file);

    startTransition(async () => {
      try {
        const res = await attachWorkoutVideo(workoutLogId, formData);
        setBonusXp(res.bonusXp);
        setStatus("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
    });
  }

  if (status === "done") {
    return (
      <p className="mt-3 text-sm font-semibold text-emerald-400">
        ✅ Video verified{bonusXp > 0 ? ` — +${bonusXp} bonus Trainer XP` : ""}
      </p>
    );
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300 disabled:opacity-60"
      >
        {pending ? `Uploading ${fileName ?? "video"}...` : "📹 Verify with video"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
