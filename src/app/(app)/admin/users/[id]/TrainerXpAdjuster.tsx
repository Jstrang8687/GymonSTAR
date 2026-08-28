"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminAdjustTrainerXp } from "../../actions";

export function TrainerXpAdjuster({ userId }: { userId: string }) {
  const router = useRouter();
  const [delta, setDelta] = useState("");
  const [pending, startTransition] = useTransition();

  function apply() {
    const value = Number(delta);
    if (!value) return;
    startTransition(async () => {
      await adminAdjustTrainerXp(userId, value);
      setDelta("");
      router.refresh();
    });
  }

  return (
    <div className="flex items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Adjust trainer XP (+/-)
        </span>
        <input
          type="number"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="e.g. 50 or -50"
          className="w-32 rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
        />
      </label>
      <button
        type="button"
        disabled={pending || !delta}
        onClick={apply}
        className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-900 hover:bg-amber-300 disabled:opacity-50"
      >
        {pending ? "Applying..." : "Apply"}
      </button>
    </div>
  );
}
