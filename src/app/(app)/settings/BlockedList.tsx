"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unblockTrainer } from "../moderation/actions";

export interface BlockedTrainerDto {
  userId: string;
  name: string;
}

export function BlockedList({ blocked }: { blocked: BlockedTrainerDto[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function unblock(userId: string) {
    setBusyId(userId);
    startTransition(async () => {
      await unblockTrainer(userId);
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-bold text-white">Blocked trainers</p>
      {blocked.length === 0 ? (
        <p className="mt-1 text-sm text-slate-400">
          Nobody. You can block someone from their duel or gym card on the Battle page.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {blocked.map((b) => (
            <li key={b.userId} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{b.name}</span>
              <button
                type="button"
                disabled={pending && busyId === b.userId}
                onClick={() => unblock(b.userId)}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:border-amber-400/50 disabled:opacity-50"
              >
                {pending && busyId === b.userId ? "..." : "Unblock"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
