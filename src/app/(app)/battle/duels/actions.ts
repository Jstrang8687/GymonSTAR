"use server";

import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/session-helpers";
import {
  searchTrainers,
  sharedMuscleTypes,
  startFreeformDuel,
  listMyDuels,
  type TrainerSearchResult,
  type MyDuelDisplay,
} from "@/lib/gymDuel";
import type { MuscleType } from "@/lib/muscleTypes";

export async function search(query: string): Promise<TrainerSearchResult[]> {
  const userId = await getUserId();
  return searchTrainers(query, userId);
}

export async function sharedTypesWith(opponentId: string): Promise<MuscleType[]> {
  const userId = await getUserId();
  return sharedMuscleTypes(userId, opponentId);
}

export interface DuelActionState {
  ok: boolean;
  message: string;
}

export async function challenge(opponentId: string, muscleType: MuscleType): Promise<DuelActionState> {
  const userId = await getUserId();
  try {
    const result = await startFreeformDuel(userId, opponentId, muscleType);
    revalidatePath("/battle");
    return { ok: true, message: result.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Couldn't start that duel." };
  }
}

export async function myDuels(): Promise<MyDuelDisplay[]> {
  const userId = await getUserId();
  return listMyDuels(userId);
}
