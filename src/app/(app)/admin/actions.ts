"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-helpers";
import { totalTrainerXp, xpProgress } from "@/lib/game";
import { deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";

export async function adminAdjustTrainerXp(userId: string, delta: number): Promise<void> {
  await requireAdmin();

  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { userId } });
  const currentTotal = totalTrainerXp(profile.trainerLevel, profile.trainerXp);
  const newTotal = Math.max(0, currentTotal + delta);
  const { level, into } = xpProgress(newTotal);

  await prisma.userProfile.update({
    where: { userId },
    data: { trainerLevel: level, trainerXp: into },
  });

  revalidatePath(`/admin/users/${userId}`);
}

export interface AdminMonsterEdit {
  level: number;
  xp: number;
  strengthXp: number;
  enduranceXp: number;
}

export async function adminUpdateMonster(monsterId: string, edit: AdminMonsterEdit): Promise<void> {
  await requireAdmin();

  const monster = await prisma.monSTAR.update({
    where: { id: monsterId },
    data: edit,
  });

  revalidatePath(`/admin/users/${monster.userId}`);
}

export async function adminDeleteWorkoutLog(logId: string): Promise<void> {
  await requireAdmin();

  const log = await prisma.workoutLog.findUniqueOrThrow({ where: { id: logId } });
  if (log.videoFilename) {
    await deleteProofFile(log.videoFilename);
  }
  await prisma.workoutLog.delete({ where: { id: logId } });

  revalidatePath(`/admin/users/${log.userId}`);
}
