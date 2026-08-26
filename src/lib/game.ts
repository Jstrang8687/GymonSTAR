// Core game formulas shared by server actions and UI display.
// Kept pure/deterministic so the dashboard can preview XP math client-side too.

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

export function xpProgress(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, into: remaining, need: xpForLevel(level) };
}

export function hpForLevel(level: number): number {
  return 20 + level * 5;
}

export const STREAK_XP_BONUS_PER_DAY = 0.05;
export const STREAK_XP_BONUS_CAP = 0.5;

export function streakMultiplier(loginStreak: number): number {
  return 1 + Math.min(loginStreak * STREAK_XP_BONUS_PER_DAY, STREAK_XP_BONUS_CAP);
}

export interface ExerciseInput {
  name: string;
  category: "strength" | "endurance";
  sets?: number;
  reps?: number;
  weight?: number;
}

// Base XP per logged exercise, plus a small volume bonus for strength work
// (sets*reps, capped so nobody games it with absurd rep counts) and a
// duration bonus applied once per workout for endurance-heavy sessions.
const BASE_XP_PER_EXERCISE = 15;
const MAX_VOLUME_BONUS = 20;
const XP_PER_DURATION_MINUTE = 1;

export function computeExerciseXp(exercise: ExerciseInput): number {
  let xp = BASE_XP_PER_EXERCISE;
  if (exercise.category === "strength" && exercise.sets && exercise.reps) {
    xp += Math.min(exercise.sets * exercise.reps, MAX_VOLUME_BONUS);
  }
  return xp;
}

export interface WorkoutXpResult {
  totalXp: number;
  strengthXp: number;
  enduranceXp: number;
  multiplier: number;
}

export function computeWorkoutXp(
  exercises: ExerciseInput[],
  durationMinutes: number,
  loginStreak: number
): WorkoutXpResult {
  const multiplier = streakMultiplier(loginStreak);
  let strengthXp = 0;
  let enduranceXp = 0;

  for (const exercise of exercises) {
    const xp = computeExerciseXp(exercise);
    if (exercise.category === "strength") {
      strengthXp += xp;
    } else {
      enduranceXp += xp;
    }
  }

  const hasEndurance = exercises.some((e) => e.category === "endurance");
  if (hasEndurance) {
    enduranceXp += durationMinutes * XP_PER_DURATION_MINUTE;
  }

  strengthXp = Math.round(strengthXp * multiplier);
  enduranceXp = Math.round(enduranceXp * multiplier);

  return {
    totalXp: strengthXp + enduranceXp,
    strengthXp,
    enduranceXp,
    multiplier,
  };
}

// Trainer (account) level uses the same curve, fed by a flat daily login
// bonus plus milestone bumps so streaks feel rewarding early and often.
const DAILY_LOGIN_XP = 10;
const STREAK_MILESTONES: Record<number, number> = {
  3: 15,
  7: 40,
  14: 100,
  30: 250,
};

export function computeLoginXp(newStreak: number): number {
  return DAILY_LOGIN_XP + (STREAK_MILESTONES[newStreak] ?? 0);
}

// Given "today", the profile's lastLoginDate (YYYY-MM-DD strings) and the
// current streak, determine the new streak value. Caller must check
// lastLoginDate !== today before calling (same-day revisits are a no-op).
export function nextStreak(
  lastLoginDate: string | null,
  today: string,
  currentStreak: number
): number {
  if (!lastLoginDate) return 1;
  const last = new Date(lastLoginDate + "T00:00:00");
  const cur = new Date(today + "T00:00:00");
  const diffDays = Math.round((cur.getTime() - last.getTime()) / 86_400_000);
  if (diffDays === 1) return currentStreak + 1;
  return 1; // gap -> reset
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
