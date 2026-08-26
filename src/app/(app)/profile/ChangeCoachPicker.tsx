"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeCoach } from "./actions";
import { CoachAvatar } from "@/components/CoachAvatar";
import type { Coach } from "@prisma/client";

export function ChangeCoachPicker({ coaches, currentCoachId }: { coaches: Coach[]; currentCoachId: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(coachId: string) {
    startTransition(async () => {
      await changeCoach(coachId);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-amber-400 hover:underline"
      >
        Change coach
      </button>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400">Pick a new coach</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-slate-500 hover:text-white"
        >
          Cancel
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {coaches.map((coach) => (
          <button
            key={coach.id}
            type="button"
            disabled={pending}
            onClick={() => pick(coach.id)}
            className={`rounded-lg border p-3 text-left text-xs transition disabled:opacity-50 ${
              coach.id === currentCoachId
                ? "border-amber-400 bg-amber-400/10"
                : "border-white/10 bg-white/5 hover:border-white/30"
            }`}
          >
            <CoachAvatar src={coach.icon} alt={coach.name} className="h-12 w-12" />
            <div className="mt-1 font-bold text-white">{coach.name}</div>
            <div className="text-amber-400">{coach.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
