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

// trainerXp in the DB is progress *within* the current level, not a lifetime
// total (it resets down on level-up). This reconstructs the lifetime total
// so a delta (like reversing a bonus) can be applied correctly and then
// re-split back into (level, into-level xp) via xpProgress.
export function totalTrainerXp(level: number, intoLevelXp: number): number {
  let total = intoLevelXp;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

export const PROOF_VERIFY_BONUS_XP = 15;

// Deleting proof normally claws back its verification bonus, but once a
// verification is a year+ old it's treated as permanent history -- old
// cleanup shouldn't cost XP earned that long ago.
export const PROOF_BONUS_REVERSAL_WINDOW_DAYS = 365;

export function proofBonusIsReversible(verifiedAt: Date): boolean {
  const ageMs = Date.now() - verifiedAt.getTime();
  return ageMs < PROOF_BONUS_REVERSAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export const STREAK_XP_BONUS_PER_DAY = 0.05;
export const STREAK_XP_BONUS_CAP = 0.5;

export function streakMultiplier(loginStreak: number): number {
  return 1 + Math.min(loginStreak * STREAK_XP_BONUS_PER_DAY, STREAK_XP_BONUS_CAP);
}

export interface SetDetail {
  reps?: number;
  weight?: number;
}

export interface ExerciseInput {
  name: string;
  category: "strength" | "endurance";
  sets?: number;
  reps?: number;
  weight?: number;
  // When present (multi-set mode), this is the source of truth for volume
  // instead of the flat sets/reps pair -- each set can have its own
  // weight/reps (pyramid sets, drop sets, etc.) under one exercise entry.
  setDetails?: SetDetail[];
  // Minutes for a time-based (cardio machine) exercise -- these don't use
  // sets/reps, so duration is their own volume measure instead.
  durationMinutes?: number;
  // Optional distance for cardio exercises where mileage is a natural unit
  // (running, walking, cycling). Record-keeping only, doesn't affect XP.
  distanceMiles?: number;
}

// Base XP per logged exercise, plus a small volume bonus for strength work
// (total reps across all sets, capped so nobody games it with absurd rep
// counts) or a duration bonus for time-based endurance work, per exercise.
const BASE_XP_PER_EXERCISE = 15;
const MAX_VOLUME_BONUS = 20;
const XP_PER_DURATION_MINUTE = 1;

export function computeExerciseXp(exercise: ExerciseInput): number {
  let xp = BASE_XP_PER_EXERCISE;
  if (exercise.category === "strength") {
    if (exercise.setDetails && exercise.setDetails.length > 0) {
      const totalReps = exercise.setDetails.reduce((sum, s) => sum + (s.reps ?? 0), 0);
      xp += Math.min(totalReps, MAX_VOLUME_BONUS);
    } else if (exercise.sets && exercise.reps) {
      xp += Math.min(exercise.sets * exercise.reps, MAX_VOLUME_BONUS);
    }
  } else if (exercise.durationMinutes) {
    xp += exercise.durationMinutes * XP_PER_DURATION_MINUTE;
  }
  return xp;
}

export interface WorkoutXpResult {
  totalXp: number;
  strengthXp: number;
  enduranceXp: number;
  multiplier: number;
}

export function computeWorkoutXp(exercises: ExerciseInput[], loginStreak: number): WorkoutXpResult {
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
