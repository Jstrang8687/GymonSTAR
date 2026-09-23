"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { checkInAtGym, resolveIfExpired, liveScores } from "@/lib/gymDuel";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";

export interface CheckInState {
  ok: boolean;
  message: string;
}

export async function checkIn(lat: number, lng: number, name: string): Promise<CheckInState> {
  const userId = await getUserId();
  try {
    const result = await checkInAtGym(userId, lat, lng, name);
    revalidatePath("/battle");
    return { ok: true, message: result.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Check-in failed." };
  }
}

export interface GymDisplay {
  id: string;
  name: string;
  championName: string | null;
  championMuscleType: MuscleType | null;
  challenge: {
    muscleTypeLabel: string;
    challengerName: string;
    defenderName: string;
    challengerScore: number;
    defenderScore: number;
    msRemaining: number;
    status: "OPEN" | "RESOLVED";
    winnerName: string | null;
  } | null;
}

export async function listGyms(): Promise<GymDisplay[]> {
  const gyms = await prisma.gym.findMany({ orderBy: { createdAt: "asc" } });
  const results: GymDisplay[] = [];

  for (const gym of gyms) {
    const rawChallenge = await prisma.gymChallenge.findFirst({
      where: { gymId: gym.id, kind: "THRONE" },
      orderBy: { createdAt: "desc" },
    });
    const challenge = rawChallenge ? await resolveIfExpired(rawChallenge) : null;
    // Resolving may have just flipped the gym's champion -- reread it fresh.
    const freshGym = challenge?.status === "RESOLVED" && challenge.resolvedAt
      ? await prisma.gym.findUniqueOrThrow({ where: { id: gym.id } })
      : gym;

    const [champion, challengerUser, defenderUser] = await Promise.all([
      freshGym.championUserId
        ? prisma.user.findUnique({ where: { id: freshGym.championUserId }, select: { name: true } })
        : null,
      challenge ? prisma.user.findUnique({ where: { id: challenge.challengerId }, select: { name: true } }) : null,
      challenge ? prisma.user.findUnique({ where: { id: challenge.defenderId }, select: { name: true } }) : null,
    ]);

    let challengeDisplay: GymDisplay["challenge"] = null;
    if (challenge && (challenge.status === "OPEN" || challenge.resolvedAt)) {
      const scores = await liveScores(challenge);
      const winnerName =
        challenge.winnerId === challenge.challengerId
          ? (challengerUser?.name ?? null)
          : challenge.winnerId === challenge.defenderId
            ? (defenderUser?.name ?? null)
            : null;
      challengeDisplay = {
        muscleTypeLabel: MUSCLE_TYPE_META[challenge.muscleType as MuscleType].label,
        challengerName: challengerUser?.name ?? "Unknown",
        defenderName: defenderUser?.name ?? "Unknown",
        challengerScore: scores.challengerScore,
        defenderScore: scores.defenderScore,
        msRemaining: scores.msRemaining,
        status: challenge.status,
        winnerName,
      };
    }

    results.push({
      id: freshGym.id,
      name: freshGym.name,
      championName: champion?.name ?? null,
      championMuscleType: (freshGym.championMuscleType as MuscleType) ?? null,
      challenge: challengeDisplay,
    });
  }

  return results;
}
