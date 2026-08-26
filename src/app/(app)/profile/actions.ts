"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";

export async function changeCoach(coachId: string) {
  const userId = await getUserId();

  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach) throw new Error("Unknown coach.");

  await prisma.userProfile.update({ where: { userId }, data: { coachId } });

  revalidatePath("/profile");
  revalidatePath("/");
}
