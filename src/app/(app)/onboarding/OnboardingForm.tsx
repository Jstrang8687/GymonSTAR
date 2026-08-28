"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "./actions";
import { PROGRAM_INFO, PROGRAM_TYPES, type ProgramType } from "@/lib/programs";
import { MUSCLE_REGIONS, MUSCLE_TYPE_META, typesForRegion, type MuscleType } from "@/lib/muscleTypes";
import { CoachAvatar } from "@/components/CoachAvatar";
import type { Coach } from "@prisma/client";

const DAY_LABELS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export function OnboardingForm({ coaches }: { coaches: Coach[] }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [programType, setProgramType] = useState<ProgramType>("UPPER_LOWER");
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
    if (!coachId) return;
    startTransition(() => {
      completeOnboarding({
        coachId,
        programType,
        customSchedule: programType === "CUSTOM" ? customSchedule : undefined,
      });
    });
  }

  if (step === 1) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white">Choose your coach</h2>
        <p className="mt-1 text-sm text-slate-400">
          Your gym rat trainer guides your programs. Flavor only — pick who you vibe with.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <button
              key={coach.id}
              type="button"
              onClick={() => setCoachId(coach.id)}
              className={`rounded-xl border p-4 text-left transition ${
                coachId === coach.id
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <CoachAvatar src={coach.icon} alt={coach.name} width="5rem" />
              <div className="mt-2 text-center font-bold text-white">{coach.name}</div>
              <div className="text-center text-xs font-semibold uppercase tracking-wide text-amber-400">
                {coach.title}
              </div>
              <p className="mt-2 text-sm text-slate-400">{coach.description}</p>
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!coachId}
          onClick={() => setStep(2)}
          className="mt-6 w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next: Pick a program
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white">Pick your training program</h2>
      <p className="mt-1 text-sm text-slate-400">
        This drives your daily target. You can change it later, and logging isn&apos;t locked to it.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
        <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-bold text-white">Build your custom week</h3>
          {customSchedule.map((day, dayIdx) => (
            <div key={dayIdx}>
              <span className="text-xs font-semibold text-slate-400">{DAY_LABELS[dayIdx]}</span>
              <div className="mt-1 space-y-1.5">
                {MUSCLE_REGIONS.map((region) => (
                  <div key={region} className="flex flex-wrap items-center gap-1.5">
                    <span className="w-16 shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                      {region}
                    </span>
                    {typesForRegion(region).map((type) => {
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
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:border-white/30"
        >
          Back
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="flex-1 rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {pending ? "Setting up..." : "Start Training"}
        </button>
      </div>
    </div>
  );
}
