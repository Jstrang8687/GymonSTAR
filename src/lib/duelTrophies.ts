import "server-only";
import { prisma } from "@/lib/prisma";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import type { GymChallengeKind } from "@prisma/client";

export interface TrophyDisplay {
  id: string;
  muscleType: MuscleType;
  muscleTypeLabel: string;
  kind: GymChallengeKind;
  opponentName: string;
  wonAt: Date;
  used: boolean;
}

// The full trophy case, newest first -- used ones stay forever (still a
// real win), just rendered as spent in the gallery.
export async function listMyTrophies(userId: string): Promise<TrophyDisplay[]> {
  const rows = await prisma.duelTrophy.findMany({
    where: { userId },
    orderBy: { wonAt: "desc" },
  });
  return rows.map((t) => ({
    id: t.id,
    muscleType: t.muscleType as MuscleType,
    muscleTypeLabel: MUSCLE_TYPE_META[t.muscleType as MuscleType].label,
    kind: t.kind,
    opponentName: t.opponentName,
    wonAt: t.wonAt,
    used: t.usedAt !== null,
  }));
}

// Spends a trophy for its one-time Squad Battle power boost. Scoped to the
// trophy's own muscle type -- you can only boost a fighter with a trophy
// won in that exact type, which is also what keeps "I need a matching
// trophy" a real squad-building decision rather than a free pick.
export async function consumeTrophy(userId: string, trophyId: string): Promise<MuscleType> {
  const trophy = await prisma.duelTrophy.findUnique({ where: { id: trophyId } });
  if (!trophy || trophy.userId !== userId) {
    throw new Error("That trophy isn't yours.");
  }
  if (trophy.usedAt) {
    throw new Error("That trophy's already been used.");
  }

  await prisma.duelTrophy.update({
    where: { id: trophyId },
    data: { usedAt: new Date() },
  });

  return trophy.muscleType as MuscleType;
}
