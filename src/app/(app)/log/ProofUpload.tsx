"use client";

import { useRef, useState, useTransition } from "react";
import { attachWorkoutProof } from "./actions";

export function ProofUpload({ workoutLogId }: { workoutLogId: string }) {
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
    formData.set("proof", file);

    startTransition(async () => {
      try {
        const res = await attachWorkoutProof(workoutLogId, formData);
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
        ✅ Verified{bonusXp > 0 ? ` — +${bonusXp} bonus Trainer XP` : ""}
      </p>
    );
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-m4v,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300 disabled:opacity-60"
      >
        {pending ? `Uploading ${fileName ?? "file"}...` : "📹📸 Verify with video or screenshot"}
      </button>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
