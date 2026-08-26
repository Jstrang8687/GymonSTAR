"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId, getProfile } from "@/lib/session-helpers";
import { computeWorkoutXp, levelFromXp, type ExerciseInput } from "@/lib/game";
import type { MuscleType } from "@/lib/muscleTypes";

export interface LogWorkoutInput {
  muscleTypes: MuscleType[];
  exercises: ExerciseInput[];
  durationMinutes: number;
}

export interface LogWorkoutResult {
  totalXp: number;
  caughtNewMonster: boolean;
  caughtType: MuscleType | null;
  multiplier: number;
}

export async function logWorkout(input: LogWorkoutInput): Promise<LogWorkoutResult> {
  const userId = await getUserId();
  const profile = await getProfile();

  if (input.muscleTypes.length === 0) throw new Error("Pick at least one muscle group.");
  if (input.exercises.length === 0) throw new Error("Add at least one exercise.");

  const today = new Date().toISOString().slice(0, 10);

  const [existingMonsters, priorLogCount, cappedToday] = await Promise.all([
    prisma.monSTAR.findMany({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId, date: today, caughtNewMonster: true } }),
  ]);

  const ownedTypes = new Set(existingMonsters.map((m) => m.muscleType as MuscleType));
  const isFirstEver = existingMonsters.length === 0 && priorLogCount === 0;
  let capAvailable = cappedToday === 0;
  let caughtType: MuscleType | null = null;

  const xpResult = computeWorkoutXp(input.exercises, input.durationMinutes, profile.loginStreak);
  const perTypeStrength = Math.round(xpResult.strengthXp / input.muscleTypes.length);
  const perTypeEndurance = Math.round(xpResult.enduranceXp / input.muscleTypes.length);

  for (const muscleType of input.muscleTypes) {
    let owned = ownedTypes.has(muscleType);

    if (!owned && caughtType === null && (isFirstEver || capAvailable)) {
      await prisma.monSTAR.create({
        data: { userId, muscleType, xp: 0, strengthXp: 0, enduranceXp: 0, level: 1 },
      });
      owned = true;
      caughtType = muscleType;
      capAvailable = false;
    }

    if (owned) {
      const monster = await prisma.monSTAR.findUniqueOrThrow({
        where: { userId_muscleType: { userId, muscleType } },
      });
      const newStrengthXp = monster.strengthXp + perTypeStrength;
      const newEnduranceXp = monster.enduranceXp + perTypeEndurance;
      const newXp = newStrengthXp + newEnduranceXp;
      await prisma.monSTAR.update({
        where: { id: monster.id },
        data: {
          strengthXp: newStrengthXp,
          enduranceXp: newEnduranceXp,
          xp: newXp,
          level: levelFromXp(newXp),
        },
      });
    }
  }

  await prisma.workoutLog.create({
    data: {
      userId,
      date: today,
      durationMinutes: input.durationMinutes,
      exercises: JSON.stringify(input.exercises),
      muscleTypes: JSON.stringify(input.muscleTypes),
      xpAwarded: xpResult.totalXp,
      caughtNewMonster: caughtType !== null,
    },
  });

  revalidatePath("/");
  revalidatePath("/monstars");
  revalidatePath("/log");

  return {
    totalXp: xpResult.totalXp,
    caughtNewMonster: caughtType !== null,
    caughtType,
    multiplier: xpResult.multiplier,
  };
}
