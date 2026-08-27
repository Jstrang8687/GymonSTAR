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

export function searchExercises(query: string, muscleType?: MuscleType, limit = 20): LibraryExercise[] {
  const pool = muscleType ? exercisesForType(muscleType) : EXERCISE_LIBRARY;
  const q = query.trim().toLowerCase();
  if (!q) return pool.slice(0, limit);
  return pool.filter((e) => e.name.toLowerCase().includes(q)).slice(0, limit);
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
