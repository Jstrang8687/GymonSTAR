import "server-only";
import { prisma } from "@/lib/prisma";
import { EXERCISE_LIBRARY, normalizeExerciseQuery, type LibraryExercise } from "@/lib/exerciseLibrary";
import type { MuscleType } from "@/lib/muscleTypes";

const STATIC_NAMES = new Set(EXERCISE_LIBRARY.map((e) => normalizeExerciseQuery(e.name)));

export async function listCustomExercises(): Promise<LibraryExercise[]> {
  const rows = await prisma.customExercise.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    name: r.name,
    muscleType: r.muscleType as MuscleType,
    category: r.category as "strength" | "endurance",
    equipment: null,
    level: "beginner",
  }));
}

// Best-effort, called after a workout log saves successfully -- never throws,
// so a duplicate/race/DB hiccup here can't undo or block the actual log.
// Only adds when the exercise isn't already known (static library or a
// previously-added custom one) and the caller tagged which muscle group it
// trains -- without that tag there's nothing reliable to file it under.
export async function recordCustomExerciseIfNew(
  name: string,
  muscleType: MuscleType | undefined,
  category: "strength" | "endurance",
  createdByEmail: string
): Promise<void> {
  const trimmed = name.trim();
  if (!muscleType || trimmed.length < 2 || trimmed.length > 60) return;

  const normalized = normalizeExerciseQuery(trimmed);
  if (STATIC_NAMES.has(normalized)) return;

  try {
    await prisma.customExercise.create({
      data: { name: trimmed, normalizedName: normalized, muscleType, category, createdByEmail },
    });
  } catch (error) {
    // Unique constraint on normalizedName -- someone else already added this
    // exact exercise (or a same-normalized variant). Not an error worth logging.
    if (!(error instanceof Error && error.message.includes("Unique constraint"))) {
      console.error("[customExercises] Failed to record new exercise:", error);
    }
  }
}
