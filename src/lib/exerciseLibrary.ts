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
