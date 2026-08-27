"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkoutProof } from "../log/actions";

export function DeleteProofButton({
  workoutLogId,
  willLoseXp,
  bonusXp,
}: {
  workoutLogId: string;
  willLoseXp: boolean;
  bonusXp: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (pending) {
    return <span className="text-xs text-slate-500">Deleting...</span>;
  }

  if (confirming) {
    return (
      <span className="flex flex-col items-end gap-1 text-xs">
        {willLoseXp && (
          <span className="max-w-[14rem] text-right text-amber-400">
            This will take back the +{bonusXp} XP verification bonus. Can&apos;t be undone.
          </span>
        )}
        <span className="flex items-center gap-2">
          <span className="text-slate-400">Delete this proof?</span>
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await deleteWorkoutProof(workoutLogId);
                router.refresh();
              })
            }
            className="font-semibold text-red-400 hover:underline"
          >
            Yes, delete
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-slate-500 hover:text-white">
            Cancel
          </button>
        </span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-semibold text-slate-500 hover:text-red-400"
    >
      Delete
    </button>
  );
}
