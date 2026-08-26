import type { MuscleType } from "./muscleTypes";

export const PROGRAM_TYPES = [
  "UPPER_LOWER",
  "BRO_SPLIT",
  "PUSH_PULL_LEGS",
  "CUSTOM",
] as const;

export type ProgramType = (typeof PROGRAM_TYPES)[number];

export interface ProgramInfo {
  label: string;
  days: number;
  description: string;
  defaultSchedule: MuscleType[][]; // index 0 = day 1 of the cycle
}

export const PROGRAM_INFO: Record<ProgramType, ProgramInfo> = {
  UPPER_LOWER: {
    label: "Upper / Lower",
    days: 4,
    description: "Classic 4-day split alternating upper and lower body.",
    defaultSchedule: [
      ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS"],
      ["QUADS", "HAMSTRINGS_GLUTES", "CORE"],
      ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS"],
      ["QUADS", "HAMSTRINGS_GLUTES", "CARDIO"],
    ],
  },
  BRO_SPLIT: {
    label: "Bro Split",
    days: 5,
    description: "One muscle group a day: chest, back, legs, arms, cardio/abs.",
    defaultSchedule: [
      ["CHEST"],
      ["BACK"],
      ["QUADS", "HAMSTRINGS_GLUTES"],
      ["BICEPS", "TRICEPS"],
      ["CARDIO", "CORE"],
    ],
  },
  PUSH_PULL_LEGS: {
    label: "Push / Pull / Legs",
    days: 6,
    description: "6-day split, two full push/pull/legs cycles a week.",
    defaultSchedule: [
      ["CHEST", "SHOULDERS", "TRICEPS"],
      ["BACK", "BICEPS"],
      ["QUADS", "HAMSTRINGS_GLUTES", "CORE"],
      ["CHEST", "SHOULDERS", "TRICEPS"],
      ["BACK", "BICEPS"],
      ["QUADS", "HAMSTRINGS_GLUTES", "CARDIO"],
    ],
  },
  CUSTOM: {
    label: "Custom Build",
    days: 7,
    description: "Build your own day-by-day muscle group rotation.",
    defaultSchedule: [
      ["CHEST"],
      ["BACK"],
      ["QUADS", "HAMSTRINGS_GLUTES"],
      ["SHOULDERS", "CORE"],
      ["BICEPS", "TRICEPS"],
      ["CARDIO"],
      [],
    ],
  },
};

// Schedule is stored as JSON: MuscleType[][] indexed by day-of-cycle (0-based),
// cycling by days since the program's startDate.
export function dayIndexForDate(scheduleLength: number, startDate: Date, today: Date): number {
  if (scheduleLength === 0) return -1;
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / 86_400_000);
  return ((diffDays % scheduleLength) + scheduleLength) % scheduleLength;
}

export function scheduleForDay(schedule: MuscleType[][], startDate: Date, today: Date): MuscleType[] {
  const idx = dayIndexForDate(schedule.length, startDate, today);
  return idx >= 0 ? schedule[idx] : [];
}
