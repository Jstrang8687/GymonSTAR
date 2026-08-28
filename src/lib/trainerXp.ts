import { prisma } from "@/lib/prisma";
import { totalTrainerXp, xpProgress } from "@/lib/game";

// trainerXp/trainerLevel are stored as (level, progress-within-level), not a
// lifetime total, so a +/- delta has to go through a total-xp round trip to
// land on the right level in either direction (level-up or level-down).
export async function applyTrainerXpDelta(userId: string, delta: number): Promise<void> {
  const profile = await prisma.userProfile.findUniqueOrThrow({ where: { userId } });
  const currentTotal = totalTrainerXp(profile.trainerLevel, profile.trainerXp);
  const newTotal = Math.max(0, currentTotal + delta);
  const { level, into } = xpProgress(newTotal);
  if (level !== profile.trainerLevel || into !== profile.trainerXp) {
    await prisma.userProfile.update({ where: { userId }, data: { trainerLevel: level, trainerXp: into } });
  }
}
