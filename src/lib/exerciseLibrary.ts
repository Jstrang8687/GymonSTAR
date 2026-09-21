import exercisesData from "@/data/exercises.json";
import type { MuscleType } from "@/lib/muscleTypes";

// Sourced from yuhonas/free-exercise-db (public domain / Unlicense), filtered
// to strength+cardio+plyometric entries and mapped onto our 9 muscle types.
export interface LibraryExercise {
  name: string;
  muscleType: MuscleType;
  category: "strength" | "endurance";
  equipment: string | null;
  level: "beginner" | "intermediate" | "expert";
}

export const EXERCISE_LIBRARY = exercisesData as LibraryExercise[];

export function exercisesForType(muscleType: MuscleType): LibraryExercise[] {
  return EXERCISE_LIBRARY.filter((e) => e.muscleType === muscleType);
}

// Strips everything but letters/digits so "push up", "push-up", and
// "pushups" all normalize to the same string -- a plain substring match on
// raw text misses these since a space, a hyphen, and nothing are three
// different characters as far as .includes() is concerned.
export function normalizeExerciseQuery(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Lower is better. Ranks a real word-boundary match (query starts a whole
// word in the name, e.g. "run" -> "Running, Treadmill") well above a match
// that's merely buried inside an unrelated word (e.g. "run" -> "cRUNch") --
// plain substring search ranks those identically, which buries exercises
// like "Running, Treadmill" under a wall of crunch variations for a query
// as short and common as "run". Returns null when the name doesn't match
// the query at all.
function matchScore(name: string, normalizedQuery: string): number | null {
  const normName = normalizeExerciseQuery(name);
  if (normName === normalizedQuery) return 0;
  if (normName.startsWith(normalizedQuery)) return 1;
  const words = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (words.some((w) => w.startsWith(normalizedQuery))) return 2;
  if (normName.includes(normalizedQuery)) return 3;
  return null;
}

// Shared ranking used by both the settings-side search (searchExercises)
// and the log form's inline autocomplete, so "type a few letters, see the
// exercises that actually matter first" behaves the same everywhere.
export function rankExercises<T extends { name: string }>(pool: T[], query: string, limit: number): T[] {
  const q = normalizeExerciseQuery(query);
  if (!q) return pool.slice(0, limit);
  return pool
    .map((e) => ({ exercise: e, score: matchScore(e.name, q) }))
    .filter((r): r is { exercise: T; score: number } => r.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((r) => r.exercise);
}

export function searchExercises(query: string, muscleType?: MuscleType, limit = 20): LibraryExercise[] {
  const pool = muscleType ? exercisesForType(muscleType) : EXERCISE_LIBRARY;
  return rankExercises(pool, query, limit);
}

// The CARDIO muscle type is exclusively populated from the source dataset's
// "cardio" category (treadmill, bike, rower, etc.) — genuinely time-based
// machines with no sets/reps/weight, unlike everything else in the library
// (including plyometrics, which are rep-based despite being "endurance" XP).
export function isTimeBasedExercise(muscleType: MuscleType): boolean {
  return muscleType === "CARDIO";
}

// Of the 14 CARDIO exercises, only the ones that cover real ground have a
// natural mileage figure. Elliptical/Stairmaster/Step Mill are tracked by
// level or floors, Rowing by meters, Rope Jumping and Prowler Sprint by
// reps/yards -- miles wouldn't mean anything for those.
const MILEAGE_EXERCISE_NAMES = new Set([
  "Assault Bike",
  "Bicycling",
  "Bicycling, Stationary",
  "Jogging, Treadmill",
  "Recumbent Bike",
  "Running, Treadmill",
  "Skating",
  "Trail Running/Walking",
  "Walking, Treadmill",
]);

export function hasMileage(name: string): boolean {
  return MILEAGE_EXERCISE_NAMES.has(name);
}
