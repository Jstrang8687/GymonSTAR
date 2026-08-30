"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId, getProfile } from "@/lib/session-helpers";
import {
  computeWorkoutXp,
  levelFromXp,
  proofBonusIsReversible,
  PROOF_VERIFY_BONUS_XP,
  type ExerciseInput,
  type SetDetail,
} from "@/lib/game";
import { saveWorkoutProof, deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";
import { applyTrainerXpDelta } from "@/lib/trainerXp";
import { MUSCLE_TYPE_META, typesForRegion, type MuscleRegion, type MuscleType } from "@/lib/muscleTypes";

// Once a trainer owns more than this many monSTARs in a trained region, XP
// for that region is credited to a random one of them instead of always the
// exact sub-type logged -- keeps things tied to the region you trained
// without forcing you to always grow the one specific monster you clicked.
const RANDOM_XP_THRESHOLD_PER_REGION = 2;

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

  const [existingMonsters, priorLogCount, cappedToday, loggedToday] = await Promise.all([
    prisma.monSTAR.findMany({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId, date: today, caughtNewMonster: true } }),
    prisma.workoutLog.count({ where: { userId, date: today } }),
  ]);

  const ownedTypes = new Set(existingMonsters.map((m) => m.muscleType as MuscleType));
  const ownedTypesByRegion = new Map<MuscleRegion, MuscleType[]>();
  for (const m of existingMonsters) {
    const region = MUSCLE_TYPE_META[m.muscleType as MuscleType].region;
    const list = ownedTypesByRegion.get(region) ?? [];
    list.push(m.muscleType as MuscleType);
    ownedTypesByRegion.set(region, list);
  }
  const isFirstEver = existingMonsters.length === 0 && priorLogCount === 0;
  let capAvailable = cappedToday === 0;
  let caughtType: MuscleType | null = null;

  // The streak bonus rewards showing up consistently day to day, not
  // logging multiple workouts in one sitting -- only the day's first
  // workout gets the multiplier.
  const streakEligible = loggedToday === 0;
  const xpResult = computeWorkoutXp(input.exercises, streakEligible ? profile.loginStreak : 0);
  const totalDurationMinutes = input.exercises.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);
  const perTypeStrength = Math.round(xpResult.strengthXp / input.muscleTypes.length);
  const perTypeEndurance = Math.round(xpResult.enduranceXp / input.muscleTypes.length);

  // Records exactly which monSTARs got XP from this log and how much, so
  // deleting the log later (e.g. from /admin) can reverse it precisely
  // instead of guessing from the total.
  const xpBreakdown: Record<string, { strengthXp: number; enduranceXp: number }> = {};

  for (const muscleType of input.muscleTypes) {
    const region = MUSCLE_TYPE_META[muscleType].region;
    const ownedInRegion = ownedTypesByRegion.get(region) ?? [];
    let targetType: MuscleType | null = null;

    // Catch a new monSTAR from this region if one's available -- randomized
    // within the region rather than locked to the exact sub-type logged.
    if (caughtType === null && (isFirstEver || capAvailable)) {
      const unowned = typesForRegion(region).filter((t) => !ownedTypes.has(t));
      if (unowned.length > 0) {
        const picked = unowned[Math.floor(Math.random() * unowned.length)];
        await prisma.monSTAR.create({
          data: { userId, muscleType: picked, xp: 0, strengthXp: 0, enduranceXp: 0, level: 1 },
        });
        ownedTypes.add(picked);
        const updatedList = [...ownedInRegion, picked];
        ownedTypesByRegion.set(region, updatedList);
        caughtType = picked;
        capAvailable = false;
        targetType = picked;
      }
    }

    if (!targetType) {
      const currentOwnedInRegion = ownedTypesByRegion.get(region) ?? [];
      if (currentOwnedInRegion.length > RANDOM_XP_THRESHOLD_PER_REGION) {
        // Enough monSTARs caught in this region already -- spread the credit
        // randomly among them instead of always the exact type logged.
        targetType = currentOwnedInRegion[Math.floor(Math.random() * currentOwnedInRegion.length)];
      } else if (currentOwnedInRegion.includes(muscleType)) {
        targetType = muscleType;
      } else if (currentOwnedInRegion.length > 0) {
        targetType = currentOwnedInRegion[Math.floor(Math.random() * currentOwnedInRegion.length)];
      }
    }

    if (targetType) {
      const monster = await prisma.monSTAR.findUniqueOrThrow({
        where: { userId_muscleType: { userId, muscleType: targetType } },
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
      const existing = xpBreakdown[targetType] ?? { strengthXp: 0, enduranceXp: 0 };
      xpBreakdown[targetType] = {
        strengthXp: existing.strengthXp + perTypeStrength,
        enduranceXp: existing.enduranceXp + perTypeEndurance,
      };
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
      xpBreakdown: JSON.stringify(xpBreakdown),
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
