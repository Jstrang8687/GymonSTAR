"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logWorkout, getPreviousExercise, type LogWorkoutResult } from "./actions";
import { ProofUpload } from "./ProofUpload";
import {
  MUSCLE_REGIONS,
  MUSCLE_TYPE_META,
  monsterNameForLevel,
  typesForRegion,
  type MuscleType,
} from "@/lib/muscleTypes";
import { EXERCISE_LIBRARY, isTimeBasedExercise, hasMileage, type LibraryExercise } from "@/lib/exerciseLibrary";
import type { ExerciseInput, SetDetail } from "@/lib/game";

interface ExerciseRow extends ExerciseInput {
  key: number;
  /** Set when picked from the library, so we know whether to show sets/reps/weight. */
  pickedMuscleType?: MuscleType;
  /** What you logged for this exact exercise name last time, if ever. */
  prevSets?: SetDetail[] | null;
}

let nextKey = 1;

function emptyRow(): ExerciseRow {
  return { key: nextKey++, name: "", category: "strength" };
}

function formatPrevSet(s: SetDetail | undefined): string {
  if (!s || (s.weight === undefined && s.reps === undefined)) return "—";
  if (s.weight !== undefined && s.reps !== undefined) return `${s.weight}×${s.reps}`;
  if (s.reps !== undefined) return `${s.reps} reps`;
  return `${s.weight} lbs`;
}

function formatPrevSummary(sets: SetDetail[] | null | undefined): string | null {
  if (!sets || sets.length === 0) return null;
  return `Last time: ${sets.map(formatPrevSet).join(", ")}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function LogWorkoutForm() {
  const router = useRouter();
  const [muscleTypes, setMuscleTypes] = useState<MuscleType[]>([]);
  const [exercises, setExercises] = useState<ExerciseRow[]>([emptyRow()]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LogWorkoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestKey, setSuggestKey] = useState<number | null>(null);

  function toggleType(type: MuscleType) {
    setMuscleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function updateRow(key: number, patch: Partial<ExerciseRow>) {
    setExercises((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  // Drops a muscle-group chip that got auto-selected by picking an exercise,
  // once nothing else in the list still needs it -- mirrors the auto-select
  // on the way in.
  function deselectIfUnused(remainingRows: ExerciseRow[], muscleType: MuscleType | undefined) {
    if (!muscleType) return;
    const stillNeeded = remainingRows.some((r) => r.pickedMuscleType === muscleType);
    if (!stillNeeded) {
      setMuscleTypes((prev) => prev.filter((t) => t !== muscleType));
    }
  }

  function handleNameChange(key: number, name: string) {
    setExercises((prev) => {
      const row = prev.find((r) => r.key === key);
      const next = prev.map((r) =>
        r.key === key
          ? { ...r, name, pickedMuscleType: undefined, durationMinutes: undefined, distanceMiles: undefined }
          : r
      );
      deselectIfUnused(next, row?.pickedMuscleType);
      return next;
    });
  }

  function suggestionsFor(query: string): LibraryExercise[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    // Search the whole library, not just already-selected muscle groups — picking
    // an exercise is what selects its muscle group now, not the other way around.
    return EXERCISE_LIBRARY.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }

  function pickSuggestion(key: number, exercise: LibraryExercise) {
    const timeBased = isTimeBasedExercise(exercise.muscleType);
    setExercises((prev) => {
      const row = prev.find((r) => r.key === key);
      const oldMuscleType = row?.pickedMuscleType;
      const next = prev.map((r) =>
        r.key === key
          ? {
              ...r,
              name: exercise.name,
              category: exercise.category,
              pickedMuscleType: exercise.muscleType,
              // Time-based cardio doesn't use sets/reps, but weight still applies
              // (weighted vest, weighted incline walk, etc.), so leave it.
              sets: timeBased ? undefined : 3,
              reps: timeBased ? undefined : 10,
              weight: 0,
              setDetails: undefined,
              durationMinutes: timeBased ? 20 : undefined,
              distanceMiles: undefined,
            }
          : r
      );
      // Switching from one exercise to a different-type one: drop the old
      // chip if nothing else needs it, same as clearing the field would.
      if (oldMuscleType && oldMuscleType !== exercise.muscleType) {
        deselectIfUnused(next, oldMuscleType);
      }
      return next;
    });
    setSuggestKey(null);
    // Auto-select the matching muscle group so you don't have to pick it separately.
    setMuscleTypes((prev) => (prev.includes(exercise.muscleType) ? prev : [...prev, exercise.muscleType]));
    fetchPrevious(key, exercise.name);
  }

  async function fetchPrevious(key: number, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      updateRow(key, { prevSets: null });
      return;
    }
    const prev = await getPreviousExercise(trimmed);
    updateRow(key, { prevSets: prev });
  }

  function removeRow(key: number) {
    setExercises((prev) => {
      if (prev.length <= 1) return prev;
      const removed = prev.find((r) => r.key === key);
      const next = prev.filter((row) => row.key !== key);
      deselectIfUnused(next, removed?.pickedMuscleType);
      return next;
    });
  }

  function toggleMultiSet(key: number, enable: boolean) {
    setExercises((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        if (enable) {
          return {
            ...row,
            setDetails: [{ weight: row.weight, reps: row.reps }],
            sets: undefined,
            reps: undefined,
            weight: undefined,
          };
        }
        const first = row.setDetails?.[0];
        return {
          ...row,
          setDetails: undefined,
          sets: row.setDetails?.length ?? 3,
          reps: first?.reps,
          weight: first?.weight,
        };
      })
    );
  }

  function addSetRow(key: number) {
    setExercises((prev) =>
      prev.map((row) => {
        if (row.key !== key || !row.setDetails) return row;
        // Pre-fill the new set with the previous set's numbers as a starting point.
        const last = row.setDetails[row.setDetails.length - 1];
        return { ...row, setDetails: [...row.setDetails, { weight: last?.weight, reps: last?.reps }] };
      })
    );
  }

  function updateSetRow(key: number, index: number, patch: Partial<SetDetail>) {
    setExercises((prev) =>
      prev.map((row) => {
        if (row.key !== key || !row.setDetails) return row;
        return { ...row, setDetails: row.setDetails.map((s, i) => (i === index ? { ...s, ...patch } : s)) };
      })
    );
  }

  function removeSetRow(key: number, index: number) {
    setExercises((prev) =>
      prev.map((row) => {
        if (row.key !== key || !row.setDetails || row.setDetails.length <= 1) return row;
        return { ...row, setDetails: row.setDetails.filter((_, i) => i !== index) };
      })
    );
  }

  function submit() {
    setError(null);
    if (muscleTypes.length === 0) {
      setError("Pick at least one muscle group you trained.");
      return;
    }
    const cleanExercises: ExerciseInput[] = exercises
      .filter((row) => row.name.trim().length > 0)
      .map((row) =>
        row.setDetails
          ? { name: row.name, category: row.category, setDetails: row.setDetails }
          : {
              name: row.name,
              category: row.category,
              sets: row.sets,
              reps: row.reps,
              weight: row.weight,
              durationMinutes: row.durationMinutes,
              distanceMiles: row.distanceMiles,
            }
      );
    if (cleanExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await logWorkout({
          muscleTypes,
          exercises: cleanExercises,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-amber-400/40 bg-slate-900 p-5 text-amber-200 shadow-2xl">
            <p className="text-lg font-bold">
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
            <ProofUpload workoutLogId={result.workoutLogId} onVerified={() => setResult(null)} />
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-4 w-full rounded-lg border border-white/10 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              No verification — I&apos;m done
            </button>
          </div>
        </div>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold text-white">Muscle groups trained</h2>
        <p className="mb-2 text-xs text-slate-500">Picking an exercise below selects this automatically.</p>
        <div className="space-y-3">
          {MUSCLE_REGIONS.map((region) => (
            <div key={region}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{region}</p>
              <div className="flex flex-wrap gap-2">
                {typesForRegion(region).map((type) => {
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
            </div>
          ))}
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
        <div className="space-y-3">
          {exercises.map((row) => {
            const timeBased = row.pickedMuscleType ? isTimeBasedExercise(row.pickedMuscleType) : false;
            const multiSet = !!row.setDetails;
            return (
              <div key={row.key} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                  <div className="relative col-span-2 sm:col-span-2">
                    <Field label="Exercise">
                      <input
                        placeholder="e.g. Barbell Bench Press"
                        value={row.name}
                        onChange={(e) => handleNameChange(row.key, e.target.value)}
                        onFocus={() => setSuggestKey(row.key)}
                        onBlur={() => {
                          setSuggestKey(null);
                          fetchPrevious(row.key, row.name);
                        }}
                        autoComplete="off"
                        className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                      />
                    </Field>
                    {suggestKey === row.key && suggestionsFor(row.name).length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-white/10 bg-slate-800 shadow-lg">
                        {suggestionsFor(row.name).map((ex) => (
                          <li key={ex.name}>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                pickSuggestion(row.key, ex);
                              }}
                              className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-slate-200 hover:bg-amber-400/20 hover:text-amber-200"
                            >
                              <span>{ex.name}</span>
                              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                                {MUSCLE_TYPE_META[ex.muscleType].icon} {MUSCLE_TYPE_META[ex.muscleType].label}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Field label="Type">
                    <select
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.key, { category: e.target.value as ExerciseInput["category"] })
                      }
                      className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                    >
                      <option value="strength">Strength</option>
                      <option value="endurance">Endurance</option>
                    </select>
                  </Field>

                  {timeBased ? (
                    <>
                      <Field label="Duration (min)">
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 20"
                          value={row.durationMinutes ?? ""}
                          onChange={(e) =>
                            updateRow(row.key, {
                              durationMinutes: e.target.value === "" ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                        />
                      </Field>
                      {hasMileage(row.name) && (
                        <Field label="Distance">
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            placeholder="optional, mi"
                            value={row.distanceMiles ?? ""}
                            onChange={(e) =>
                              updateRow(row.key, {
                                distanceMiles: e.target.value === "" ? undefined : Number(e.target.value),
                              })
                            }
                            className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </Field>
                      )}
                    </>
                  ) : (
                    !multiSet && (
                      <>
                        <Field label="Sets">
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 3"
                            value={row.sets ?? ""}
                            onChange={(e) =>
                              updateRow(row.key, { sets: e.target.value === "" ? undefined : Number(e.target.value) })
                            }
                            className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </Field>
                        <Field label="Reps">
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g. 10"
                            value={row.reps ?? ""}
                            onChange={(e) =>
                              updateRow(row.key, { reps: e.target.value === "" ? undefined : Number(e.target.value) })
                            }
                            className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                          />
                        </Field>
                      </>
                    )
                  )}
                  {!multiSet && (
                    <Field label="Weight">
                      <input
                        type="number"
                        min={0}
                        placeholder={timeBased ? "optional, lbs" : "e.g. 45, or 0"}
                        value={row.weight ?? ""}
                        onChange={(e) =>
                          updateRow(row.key, { weight: e.target.value === "" ? undefined : Number(e.target.value) })
                        }
                        className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                      />
                    </Field>
                  )}

                  {!multiSet && formatPrevSummary(row.prevSets) && (
                    <p className="col-span-2 text-xs text-slate-500 sm:col-span-6">
                      {formatPrevSummary(row.prevSets)}
                    </p>
                  )}

                  {!timeBased && (
                    <label className="col-span-2 mt-1 flex items-center gap-1.5 sm:col-span-6">
                      <input
                        type="checkbox"
                        checked={multiSet}
                        onChange={(e) => toggleMultiSet(row.key, e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-slate-900 accent-amber-400"
                      />
                      <span className="text-xs text-slate-400">
                        Multi-set (different weight/reps per set, e.g. pyramid sets)
                      </span>
                    </label>
                  )}

                  {multiSet && row.setDetails && (
                    <div className="col-span-2 mt-1 sm:col-span-6">
                      <div className="grid grid-cols-[2rem_3.5rem_1fr_1fr_1.5rem] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        <span>Set</span>
                        <span>Prev</span>
                        <span>Weight (lbs)</span>
                        <span>Reps</span>
                        <span />
                      </div>
                      <div className="mt-1 space-y-1.5">
                        {row.setDetails.map((s, i) => (
                          <div key={i} className="grid grid-cols-[2rem_3.5rem_1fr_1fr_1.5rem] items-center gap-2">
                            <span className="text-center text-sm font-semibold text-slate-400">{i + 1}</span>
                            <span className="text-center text-xs text-slate-500">{formatPrevSet(row.prevSets?.[i])}</span>
                            <input
                              type="number"
                              min={0}
                              placeholder="e.g. 45"
                              value={s.weight ?? ""}
                              onChange={(e) =>
                                updateSetRow(row.key, i, {
                                  weight: e.target.value === "" ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                            />
                            <input
                              type="number"
                              min={0}
                              placeholder="e.g. 5"
                              value={s.reps ?? ""}
                              onChange={(e) =>
                                updateSetRow(row.key, i, {
                                  reps: e.target.value === "" ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => removeSetRow(row.key, i)}
                              disabled={row.setDetails!.length <= 1}
                              className="text-slate-500 hover:text-red-400 disabled:opacity-30"
                              aria-label={`Remove set ${i + 1}`}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addSetRow(row.key)}
                        className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
                      >
                        + Add Set
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  className="mt-2 text-xs font-semibold text-slate-500 hover:text-red-400"
                >
                  ✕ Remove exercise
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setExercises((prev) => [...prev, emptyRow()])}
          className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
        >
          + Add exercise
        </button>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Logging..." : "Log Workout"}
      </button>
      <p className="text-center text-xs text-slate-500">
        You can attach a verification video or screenshot right after logging.
      </p>
    </div>
  );
}
