"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logWorkout, type LogWorkoutResult } from "./actions";
import { MUSCLE_TYPES, MUSCLE_TYPE_META, monsterNameForLevel, type MuscleType } from "@/lib/muscleTypes";
import type { ExerciseInput } from "@/lib/game";

interface ExerciseRow extends ExerciseInput {
  key: number;
}

let nextKey = 1;

function emptyRow(): ExerciseRow {
  return { key: nextKey++, name: "", category: "strength", sets: 3, reps: 10, weight: 0 };
}

export function LogWorkoutForm() {
  const router = useRouter();
  const [muscleTypes, setMuscleTypes] = useState<MuscleType[]>([]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([emptyRow()]);
  const [duration, setDuration] = useState(30);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LogWorkoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleType(type: MuscleType) {
    setMuscleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function updateRow(key: number, patch: Partial<ExerciseRow>) {
    setExercises((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: number) {
    setExercises((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev));
  }

  function submit() {
    setError(null);
    if (muscleTypes.length === 0) {
      setError("Pick at least one muscle group you trained.");
      return;
    }
    const cleanExercises: ExerciseInput[] = exercises
      .filter((row) => row.name.trim().length > 0)
      .map((row) => ({
        name: row.name,
        category: row.category,
        sets: row.sets,
        reps: row.reps,
        weight: row.weight,
      }));
    if (cleanExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await logWorkout({
          muscleTypes,
          exercises: cleanExercises,
          durationMinutes: duration,
        });
        setResult(res);
        setMuscleTypes([]);
        setExercises([emptyRow()]);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {result && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-amber-200">
          <p className="font-bold">
            +{result.totalXp} XP{" "}
            {result.multiplier > 1 && (
              <span className="font-normal text-amber-300">
                (×{result.multiplier.toFixed(2)} streak bonus)
              </span>
            )}
          </p>
          {result.caughtNewMonster && result.caughtType && (
            <p className="mt-1 text-lg font-black text-white">
              🎉 New monSTAR! You caught {monsterNameForLevel(MUSCLE_TYPE_META[result.caughtType], 1)}{" "}
              {MUSCLE_TYPE_META[result.caughtType].icon}
            </p>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold text-white">Muscle groups trained</h2>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_TYPES.map((type) => {
            const meta = MUSCLE_TYPE_META[type];
            const active = muscleTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-amber-400 bg-amber-400/20 text-amber-300"
                    : "border-white/10 text-slate-400 hover:border-white/30"
                }`}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Exercises</h2>
          <button
            type="button"
            onClick={() => setExercises((prev) => [...prev, emptyRow()])}
            className="text-xs font-semibold text-amber-400 hover:underline"
          >
            + Add exercise
          </button>
        </div>
        <div className="space-y-2">
          {exercises.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 sm:grid-cols-6"
            >
              <input
                placeholder="Exercise name"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                className="col-span-2 rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400 sm:col-span-2"
              />
              <select
                value={row.category}
                onChange={(e) =>
                  updateRow(row.key, { category: e.target.value as ExerciseInput["category"] })
                }
                className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
              >
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
              </select>
              <input
                type="number"
                min={0}
                placeholder="Sets"
                value={row.sets ?? ""}
                onChange={(e) => updateRow(row.key, { sets: Number(e.target.value) || 0 })}
                className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
              />
              <input
                type="number"
                min={0}
                placeholder="Reps"
                value={row.reps ?? ""}
                onChange={(e) => updateRow(row.key, { reps: Number(e.target.value) || 0 })}
                className="rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Weight"
                  value={row.weight ?? ""}
                  onChange={(e) => updateRow(row.key, { weight: Number(e.target.value) || 0 })}
                  className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="text-slate-500 hover:text-red-400"
                  aria-label="Remove exercise"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-300" htmlFor="duration">
          Duration (minutes)
        </label>
        <input
          id="duration"
          type="number"
          min={0}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) || 0)}
          className="w-24 rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
        />
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="flex-1 rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {pending ? "Logging..." : "Log Workout"}
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="cursor-not-allowed rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          📹 Verify with video (coming soon)
        </button>
      </div>
    </div>
  );
}
