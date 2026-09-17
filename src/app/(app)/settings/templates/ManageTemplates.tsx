"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTemplate, deleteTemplate } from "./actions";
import { MUSCLE_REGIONS, MUSCLE_TYPE_META, typesForRegion, type MuscleType } from "@/lib/muscleTypes";
import type { TemplateExercise, WorkoutTemplateData } from "@/lib/workoutTemplates";

let nextKey = 1;

interface EditableExercise extends TemplateExercise {
  key: number;
}

export function ManageTemplates({ templates }: { templates: WorkoutTemplateData[] }) {
  return (
    <div className="space-y-4">
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}

function TemplateCard({ template }: { template: WorkoutTemplateData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [muscleTypes, setMuscleTypes] = useState<MuscleType[]>(template.muscleTypes);
  const [exercises, setExercises] = useState<EditableExercise[]>(
    template.exercises.map((ex) => ({ ...ex, key: nextKey++ }))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  function toggleType(type: MuscleType) {
    setMuscleTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  function cancel() {
    setName(template.name);
    setMuscleTypes(template.muscleTypes);
    setExercises(template.exercises.map((ex) => ({ ...ex, key: nextKey++ })));
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give the template a name.");
      return;
    }
    const cleanExercises: TemplateExercise[] = exercises
      .filter((ex) => ex.name.trim().length > 0)
      .map((ex) => ({ name: ex.name.trim(), category: ex.category, muscleType: ex.muscleType }));
    if (cleanExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    startTransition(async () => {
      try {
        await updateTemplate(template.id, { name: trimmedName, muscleTypes, exercises: cleanExercises });
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save that template.");
      }
    });
  }

  function remove() {
    if (!confirm(`Delete "${template.name}"? This can't be undone.`)) return;
    startDeleteTransition(async () => {
      await deleteTemplate(template.id);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-white">{template.name}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {template.muscleTypes.map((t) => (
                <span key={t} className="text-xs" title={MUSCLE_TYPE_META[t].label}>
                  {MUSCLE_TYPE_META[t].icon}
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">{template.exercises.map((e) => e.name).join(", ")}</p>
          </div>
          <div className="flex shrink-0 gap-3 text-xs font-semibold">
            <button type="button" onClick={() => setEditing(true)} className="text-amber-400 hover:underline">
              Edit
            </button>
            <button
              type="button"
              disabled={deletePending}
              onClick={remove}
              className="text-red-400 hover:underline disabled:opacity-50"
            >
              {deletePending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-400/30 bg-white/5 p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm font-bold text-white outline-none focus:border-amber-400"
      />

      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Muscle groups</p>
        {MUSCLE_REGIONS.map((region) => (
          <div key={region} className="flex flex-wrap gap-1.5">
            {typesForRegion(region).map((type) => {
              const meta = MUSCLE_TYPE_META[type];
              const active = muscleTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-full border px-2 py-1 text-xs font-medium transition ${
                    active
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-white/10 text-slate-500 hover:border-white/30"
                  }`}
                >
                  {meta.icon} {meta.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Exercises</p>
        {exercises.map((ex) => (
          <div key={ex.key} className="flex items-center gap-1.5">
            <input
              placeholder="Exercise name"
              value={ex.name}
              onChange={(e) =>
                setExercises((prev) => prev.map((r) => (r.key === ex.key ? { ...r, name: e.target.value } : r)))
              }
              className="min-w-0 flex-1 rounded-md border border-white/10 bg-slate-900/60 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-400"
            />
            <select
              value={ex.category}
              onChange={(e) =>
                setExercises((prev) =>
                  prev.map((r) => (r.key === ex.key ? { ...r, category: e.target.value as TemplateExercise["category"] } : r))
                )
              }
              className="rounded-md border border-white/10 bg-slate-900/60 px-1.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            >
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
            </select>
            <button
              type="button"
              onClick={() => setExercises((prev) => prev.filter((r) => r.key !== ex.key))}
              disabled={exercises.length <= 1}
              className="text-slate-500 hover:text-red-400 disabled:opacity-30"
              aria-label="Remove exercise"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setExercises((prev) => [...prev, { key: nextKey++, name: "", category: "strength" }])}
          className="text-xs font-semibold text-amber-400 hover:underline"
        >
          + Add exercise
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={cancel} className="text-xs font-semibold text-slate-400 hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
