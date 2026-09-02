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

// Human-readable summary of what was actually logged for an exercise, e.g.
// "3×10 @ 135 lbs", "135×8, 155×6, 175×4" (multi-set), or "20 min, 2.5 mi"
// -- so history views can show the real numbers instead of just the name.
export function formatExerciseDetail(exercise: ExerciseInput): string | null {
  const parts: string[] = [];

  if (exercise.setDetails && exercise.setDetails.length > 0) {
    parts.push(
      exercise.setDetails
        .map((s) => {
          if (s.weight !== undefined && s.reps !== undefined) return `${s.weight}×${s.reps}`;
          if (s.reps !== undefined) return `${s.reps} reps`;
          if (s.weight !== undefined) return `${s.weight} lbs`;
          return null;
        })
        .filter(Boolean)
        .join(", ")
    );
  } else if (exercise.sets !== undefined || exercise.reps !== undefined || exercise.weight) {
    let flat = "";
    if (exercise.sets !== undefined && exercise.reps !== undefined) flat = `${exercise.sets}×${exercise.reps}`;
    else if (exercise.reps !== undefined) flat = `${exercise.reps} reps`;
    if (exercise.weight) flat = flat ? `${flat} @ ${exercise.weight} lbs` : `${exercise.weight} lbs`;
    if (flat) parts.push(flat);
  }

  if (exercise.durationMinutes) parts.push(`${exercise.durationMinutes} min`);
  if (exercise.distanceMiles) parts.push(`${exercise.distanceMiles} mi`);

  return parts.length > 0 ? parts.join(", ") : null;
}

// Flat XP per logged exercise -- logging sets/reps/weight is just the normal
// shape of a strength exercise, not extra effort worth a bonus. Time-based
// (cardio) work still gets a duration bonus since minutes spent is a real
// separate effort signal, not just data entry.
const BASE_XP_PER_EXERCISE = 15;
const XP_PER_DURATION_MINUTE = 1;

export function computeExerciseXp(exercise: ExerciseInput): number {
  let xp = BASE_XP_PER_EXERCISE;
  if (exercise.category === "endurance" && exercise.durationMinutes) {
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
