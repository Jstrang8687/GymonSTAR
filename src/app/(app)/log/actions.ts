"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId, getProfile } from "@/lib/session-helpers";
import {
  computeWorkoutXp,
  levelFromXp,
  totalTrainerXp,
  xpProgress,
  proofBonusIsReversible,
  PROOF_VERIFY_BONUS_XP,
  type ExerciseInput,
  type SetDetail,
} from "@/lib/game";
import { saveWorkoutProof, deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";
import type { MuscleType } from "@/lib/muscleTypes";

export interface LogWorkoutInput {
  muscleTypes: MuscleType[];
  exercises: ExerciseInput[];
}

export interface LogWorkoutResult {
  workoutLogId: string;
  totalXp: number;
  caughtNewMonster: boolean;
  caughtType: MuscleType | null;
  multiplier: number;
}

// Looks back through recent logs for the most recent time this exact
// exercise name was logged, normalized to a per-set array so the UI can
// show a "Prev" reference regardless of whether that log used multi-set
// mode or the old single sets/reps/weight fields.
export async function getPreviousExercise(name: string): Promise<SetDetail[] | null> {
  const userId = await getUserId();
  const target = name.trim().toLowerCase();
  if (!target) return null;

  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { exercises: true },
  });

  for (const log of logs) {
    const exercises = JSON.parse(log.exercises) as ExerciseInput[];
    const match = exercises.find((e) => e.name.trim().toLowerCase() === target);
    if (!match) continue;

    if (match.setDetails && match.setDetails.length > 0) return match.setDetails;
    if (match.sets && match.sets > 0) {
      return Array.from({ length: match.sets }, () => ({ reps: match.reps, weight: match.weight }));
    }
    return null;
  }
  return null;
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

  const xpResult = computeWorkoutXp(input.exercises, profile.loginStreak);
  const totalDurationMinutes = input.exercises.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);
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
      durationMinutes: totalDurationMinutes,
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

// trainerXp/trainerLevel are stored as (level, progress-within-level), not a
// lifetime total, so a +/- delta has to go through a total-xp round trip to
// land on the right level in either direction (level-up or level-down).
async function applyTrainerXpDelta(userId: string, delta: number) {
  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { userId } });
  const currentTotal = totalTrainerXp(profile.trainerLevel, profile.trainerXp);
  const newTotal = Math.max(0, currentTotal + delta);
  const { level, into } = xpProgress(newTotal);
  if (level !== profile.trainerLevel || into !== profile.trainerXp) {
    await prisma.userProfile.update({ where: { userId }, data: { trainerLevel: level, trainerXp: into } });
  }
}

export interface AttachProofResult {
  bonusXp: number;
}

export async function attachWorkoutProof(workoutLogId: string, formData: FormData): Promise<AttachProofResult> {
  const userId = await getUserId();

  const log = await prisma.workoutLog.findUnique({ where: { id: workoutLogId } });
  if (!log || log.userId !== userId) throw new Error("Workout not found.");

  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) throw new Error("No file selected.");

  const saved = await saveWorkoutProof(file);

  if (log.videoFilename) {
    await deleteProofFile(log.videoFilename);
  }

  const alreadyVerified = log.videoVerifiedAt !== null;
  const bonusXp = alreadyVerified ? 0 : PROOF_VERIFY_BONUS_XP;

  await prisma.workoutLog.update({
    where: { id: workoutLogId },
    data: {
      videoFilename: saved.filename,
      videoMimeType: saved.mimeType,
      videoVerifiedAt: log.videoVerifiedAt ?? new Date(),
    },
  });

  if (bonusXp > 0) {
    await applyTrainerXpDelta(userId, bonusXp);
  }

  revalidatePath("/log");
  revalidatePath("/");
  revalidatePath("/monstars");
  revalidatePath("/history");

  return { bonusXp };
}

export async function deleteWorkoutProof(workoutLogId: string): Promise<void> {
  const userId = await getUserId();

  const log = await prisma.workoutLog.findUnique({ where: { id: workoutLogId } });
  if (!log || log.userId !== userId) throw new Error("Workout not found.");
  if (!log.videoFilename) return;

  await deleteProofFile(log.videoFilename);

  const shouldReverseBonus = log.videoVerifiedAt !== null && proofBonusIsReversible(log.videoVerifiedAt);

  await prisma.workoutLog.update({
    where: { id: workoutLogId },
    data: { videoFilename: null, videoMimeType: null, videoVerifiedAt: null },
  });

  if (shouldReverseBonus) {
    // Removing proof revokes the verification bonus, so re-uploading later
    // pays it out again rather than farming it via upload-then-delete.
    // (Verifications a year+ old are exempt -- see proofBonusIsReversible.)
    await applyTrainerXpDelta(userId, -PROOF_VERIFY_BONUS_XP);
  }

  revalidatePath("/log");
  revalidatePath("/");
  revalidatePath("/monstars");
  revalidatePath("/history");
}
