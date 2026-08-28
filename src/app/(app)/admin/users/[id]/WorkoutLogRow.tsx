"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteWorkoutLog } from "../../actions";

interface WorkoutLogRowProps {
  logId: string;
  date: string;
  xpAwarded: number;
  muscleTypes: string[];
  hasProof: boolean;
}

export function WorkoutLogRow({ logId, date, xpAwarded, muscleTypes, hasProof }: WorkoutLogRowProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-200">
          {date} · {muscleTypes.join(", ")} {hasProof && "· 📎 has proof"}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-amber-400">+{xpAwarded} XP</span>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-xs font-semibold text-slate-500 hover:text-red-400"
            >
              Delete
            </button>
          ) : pending ? (
            <span className="text-xs text-slate-500">Deleting...</span>
          ) : (
            <span className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await adminDeleteWorkoutLog(logId);
                    router.refresh();
                  })
                }
                className="font-semibold text-red-400 hover:underline"
              >
                Confirm delete
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="text-slate-500 hover:text-white">
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        Deleting only removes this log — it does not reverse XP already awarded to the trainer or monSTARs.
      </p>
    </div>
  );
}
