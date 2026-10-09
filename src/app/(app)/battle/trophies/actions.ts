"use server";

import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/session-helpers";
import { listMyTrophies, consumeTrophy, type TrophyDisplay } from "@/lib/duelTrophies";
import type { MuscleType } from "@/lib/muscleTypes";

export async function myTrophies(): Promise<TrophyDisplay[]> {
  const userId = await getUserId();
  return listMyTrophies(userId);
}

export interface UseTrophyState {
  ok: boolean;
  message: string;
  muscleType?: MuscleType;
}

export async function spendTrophyForBoost(trophyId: string): Promise<UseTrophyState> {
  const userId = await getUserId();
  try {
    const muscleType = await consumeTrophy(userId, trophyId);
    revalidatePath("/battle");
    return { ok: true, message: "Trophy used!", muscleType };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Couldn't use that trophy." };
  }
}
