"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeProgram } from "./actions";
import { PROGRAM_INFO, PROGRAM_TYPES, type ProgramType } from "@/lib/programs";
import { MUSCLE_TYPES, MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";

const DAY_LABELS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export function ChangeProgramForm({ currentType }: { currentType: ProgramType }) {
  const router = useRouter();
  const [programType, setProgramType] = useState<ProgramType>(currentType);
  const [customSchedule, setCustomSchedule] = useState<MuscleType[][]>(
    () => PROGRAM_INFO.CUSTOM.defaultSchedule.map((day) => [...day])
  );
  const [pending, startTransition] = useTransition();

  function toggleCustomDay(dayIdx: number, type: MuscleType) {
    setCustomSchedule((prev) => {
      const next = prev.map((d) => [...d]);
      const day = next[dayIdx];
      const pos = day.indexOf(type);
      if (pos >= 0) day.splice(pos, 1);
      else day.push(type);
      return next;
    });
  }

  function submit() {
    startTransition(async () => {
      await changeProgram({
        programType,
        customSchedule: programType === "CUSTOM" ? customSchedule : undefined,
      });
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROGRAM_TYPES.map((type) => {
          const info = PROGRAM_INFO[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setProgramType(type)}
              className={`rounded-xl border p-4 text-left transition ${
                programType === type
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="font-bold text-white">{info.label}</div>
              <div className="text-xs text-slate-400">{info.days}-day cycle</div>
              <p className="mt-2 text-sm text-slate-400">{info.description}</p>
            </button>
          );
        })}
      </div>

      {programType === "CUSTOM" && (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-bold text-white">Build your custom week</h3>
          {customSchedule.map((day, dayIdx) => (
            <div key={dayIdx} className="flex flex-wrap items-center gap-2">
              <span className="w-14 shrink-0 text-xs font-semibold text-slate-400">
                {DAY_LABELS[dayIdx]}
              </span>
              {MUSCLE_TYPES.map((type) => {
                const active = day.includes(type);
                const meta = MUSCLE_TYPE_META[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCustomDay(dayIdx, type)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
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
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="mt-4 w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {pending ? "Saving..." : "Save Program"}
      </button>
    </div>
  );
}
