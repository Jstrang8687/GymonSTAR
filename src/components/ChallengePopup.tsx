"use client";

import { useEffect, useState } from "react";
import { exercisesForType } from "@/lib/exerciseLibrary";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { CoachAvatar } from "@/components/CoachAvatar";

export interface PendingChallengeDto {
  id: string;
  challengerName: string;
  muscleType: MuscleType;
  muscleTypeLabel: string;
  gymName: string | null;
  msRemaining: number;
}

interface CoachInfo {
  name: string;
  icon: string;
  title: string;
}

const DISMISSED_KEY = "gm_dismissed_challenges";

function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function addDismissed(id: string) {
  try {
    const current = readDismissed();
    current.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current]));
  } catch {
    // Best-effort only -- worst case the popup shows again next visit.
  }
}

// A coach-voiced list of exercises for the muscle type under dispute, split
// into "no equipment" and "with weights" -- for whoever hits "I need help"
// because they don't actually know how to train that muscle group yet.
function CoachExercisePanel({ muscleType, coach }: { muscleType: MuscleType; coach: CoachInfo }) {
  const pool = exercisesForType(muscleType);
  const noEquipment = pool.filter((e) => e.equipment === null || e.equipment === "body only").slice(0, 5);
  const withWeights = pool.filter((e) => e.equipment !== null && e.equipment !== "body only").slice(0, 5);
  const label = MUSCLE_TYPE_META[muscleType].label;

  return (
    <div>
      <div className="flex items-center gap-2">
        <CoachAvatar src={coach.icon} alt={coach.name} width="2.5rem" />
        <p className="text-sm font-bold text-white">{coach.name} says:</p>
      </div>
      <p className="mt-1 text-sm text-slate-300">
        &ldquo;Alright, let&apos;s get that {label} duel won. Here&apos;s where to start.&rdquo;
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">No equipment</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-200">
            {noEquipment.length === 0 ? (
              <li className="text-slate-500">—</li>
            ) : (
              noEquipment.map((e) => <li key={e.name}>• {e.name}</li>)
            )}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">With weights</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-200">
            {withWeights.length === 0 ? (
              <li className="text-slate-500">—</li>
            ) : (
              withWeights.map((e) => <li key={e.name}>• {e.name}</li>)
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ChallengePopup({ challenges, coach }: { challenges: PendingChallengeDto[]; coach: CoachInfo }) {
  const [queue, setQueue] = useState<PendingChallengeDto[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      const dismissed = readDismissed();
      setQueue(challenges.filter((c) => !dismissed.has(c.id)));
    });
  }, [challenges]);

  if (!queue || queue.length === 0) return null;
  const current = queue[0];

  function dismiss() {
    addDismissed(current.id);
    setShowHelp(false);
    setQueue((prev) => (prev ? prev.filter((c) => c.id !== current.id) : prev));
  }

  const where = current.gymName ? ` for ${current.gymName}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-400/40 bg-slate-900 p-5 text-amber-200 shadow-2xl">
        <p className="text-lg font-black text-white">⚔️ You&apos;ve been challenged!</p>
        <p className="mt-2 text-sm text-slate-300">
          <strong className="text-white">{current.challengerName}</strong> challenged you to a{" "}
          {current.muscleTypeLabel} duel{where}.
        </p>
        <p className="mt-1 text-sm text-slate-300">
          Log real {current.muscleTypeLabel} workouts in the next <strong>48 hours</strong> — most{" "}
          {current.muscleTypeLabel} XP wins.
        </p>
        <p className="mt-1 text-xs text-slate-500">⏱ {formatCountdown(current.msRemaining)} left</p>

        {showHelp ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
            <CoachExercisePanel muscleType={current.muscleType} coach={coach} />
            <button
              type="button"
              onClick={dismiss}
              className="mt-3 w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-lg bg-amber-400 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              💪 I know what to do
            </button>
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-bold text-white transition hover:border-amber-400/50"
            >
              🤔 I need help
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
