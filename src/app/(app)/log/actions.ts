"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId, getProfile } from "@/lib/session-helpers";
import { computeWorkoutXp, levelFromXp, xpForLevel, type ExerciseInput } from "@/lib/game";
import { saveWorkoutVideo, deleteWorkoutVideo } from "@/lib/videoStorage";
import type { MuscleType } from "@/lib/muscleTypes";

export interface LogWorkoutInput {
  muscleTypes: MuscleType[];
  exercises: ExerciseInput[];
  durationMinutes: number;
}

export interface LogWorkoutResult {
  workoutLogId: string;
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

  const workoutLog = await prisma.workoutLog.create({
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
    workoutLogId: workoutLog.id,
    totalXp: xpResult.totalXp,
    caughtNewMonster: caughtType !== null,
    caughtType,
    multiplier: xpResult.multiplier,
  };
}

const VIDEO_VERIFY_BONUS_XP = 15;

export interface AttachVideoResult {
  bonusXp: number;
}

export async function attachWorkoutVideo(workoutLogId: string, formData: FormData): Promise<AttachVideoResult> {
  const userId = await getUserId();

  const log = await prisma.workoutLog.findUnique({ where: { id: workoutLogId } });
  if (!log || log.userId !== userId) throw new Error("Workout not found.");

  const file = formData.get("video");
  if (!(file instanceof File) || file.size === 0) throw new Error("No video selected.");

  const saved = await saveWorkoutVideo(file);

  if (log.videoFilename) {
    await deleteWorkoutVideo(log.videoFilename);
  }

  const alreadyVerified = log.videoVerifiedAt !== null;
  const bonusXp = alreadyVerified ? 0 : VIDEO_VERIFY_BONUS_XP;

  await prisma.$transaction([
    prisma.workoutLog.update({
      where: { id: workoutLogId },
      data: {
        videoFilename: saved.filename,
        videoMimeType: saved.mimeType,
        videoVerifiedAt: log.videoVerifiedAt ?? new Date(),
      },
    }),
    ...(bonusXp > 0
      ? [
          prisma.userProfile.update({
            where: { userId },
            data: { trainerXp: { increment: bonusXp } },
          }),
        ]
      : []),
  ]);

  if (bonusXp > 0) {
    // Re-check for a trainer level-up now that trainerXp increased.
    const profile = await prisma.userProfile.findUniqueOrThrow({ where: { userId } });
    let trainerXp = profile.trainerXp;
    let trainerLevel = profile.trainerLevel;
    while (trainerXp >= xpForLevel(trainerLevel)) {
      trainerXp -= xpForLevel(trainerLevel);
      trainerLevel += 1;
    }
    if (trainerLevel !== profile.trainerLevel) {
      await prisma.userProfile.update({ where: { userId }, data: { trainerXp, trainerLevel } });
    }
  }

  revalidatePath("/log");
  revalidatePath("/");
  revalidatePath("/monstars");

  return { bonusXp };
}
