"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserId } from "@/lib/session-helpers";
import { levelFromXp, PROOF_VERIFY_BONUS_XP } from "@/lib/game";
import { applyTrainerXpDelta } from "@/lib/trainerXp";
import { deleteWorkoutProof as deleteProofFile } from "@/lib/proofStorage";
import type { MuscleType } from "@/lib/muscleTypes";

export async function adminAdjustTrainerXp(userId: string, delta: number): Promise<void> {
  await requireAdmin();
  await applyTrainerXpDelta(userId, delta);
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

export interface AdminDeleteLogResult {
  reversedMonsterTypes: string[];
  reversedTrainerBonus: boolean;
}

// Reverses exactly what the log granted -- the per-monster XP split recorded
// at logging time (xpBreakdown), plus the +15 trainer verification bonus if
// the log had verified proof -- then deletes the log and its proof file.
// Logs created before xpBreakdown existed can't have their monster XP
// reversed precisely, so that part is skipped for them (still deletes the
// log/proof and reverses the trainer bonus, since that's tracked separately).
export async function adminDeleteWorkoutLog(logId: string): Promise<AdminDeleteLogResult> {
  await requireAdmin();

  const log = await prisma.workoutLog.findUniqueOrThrow({ where: { id: logId } });
  const breakdown = log.xpBreakdown
    ? (JSON.parse(log.xpBreakdown) as Record<string, { strengthXp: number; enduranceXp: number }>)
    : null;
  const reversedMonsterTypes: string[] = [];

  await prisma.$transaction(async (tx) => {
    if (breakdown) {
      for (const [muscleType, delta] of Object.entries(breakdown)) {
        const monster = await tx.monSTAR.findUnique({
          where: { userId_muscleType: { userId: log.userId, muscleType: muscleType as MuscleType } },
        });
        if (!monster) continue;

        const newStrengthXp = Math.max(0, monster.strengthXp - delta.strengthXp);
        const newEnduranceXp = Math.max(0, monster.enduranceXp - delta.enduranceXp);
        const newXp = newStrengthXp + newEnduranceXp;
        await tx.monSTAR.update({
          where: { id: monster.id },
          data: {
            strengthXp: newStrengthXp,
            enduranceXp: newEnduranceXp,
            xp: newXp,
            level: levelFromXp(newXp),
          },
        });
        reversedMonsterTypes.push(muscleType);
      }
    }
    await tx.workoutLog.delete({ where: { id: logId } });
  });

  const reversedTrainerBonus = log.videoVerifiedAt !== null;
  if (reversedTrainerBonus) {
    await applyTrainerXpDelta(log.userId, -PROOF_VERIFY_BONUS_XP);
  }
  if (log.videoFilename) {
    await deleteProofFile(log.videoFilename);
  }

  revalidatePath(`/admin/users/${log.userId}`);
  return { reversedMonsterTypes, reversedTrainerBonus };
}

// Permanently deletes a user and everything they own (profile, monSTARs,
// programs, workout logs -- all cascade at the DB level). Proof files on
// disk don't cascade, so those are cleaned up first. Irreversible, so the
// UI requires typing the user's email to confirm before this is callable.
export async function adminDeleteUser(userId: string): Promise<void> {
  await requireAdmin();

  const currentUserId = await getUserId();
  if (userId === currentUserId) {
    throw new Error("You can't delete your own account from here.");
  }

  const logs = await prisma.workoutLog.findMany({
    where: { userId, videoFilename: { not: null } },
    select: { videoFilename: true },
  });
  for (const log of logs) {
    if (log.videoFilename) await deleteProofFile(log.videoFilename);
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  redirect("/admin");
}
