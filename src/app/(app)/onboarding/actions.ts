"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { PROGRAM_INFO, type ProgramType } from "@/lib/programs";
import type { MuscleType } from "@/lib/muscleTypes";

export interface OnboardingInput {
  coachId: string;
  programType: ProgramType;
  customSchedule?: MuscleType[][];
}

export async function completeOnboarding(input: OnboardingInput) {
  const userId = await getUserId();

  const coach = await prisma.coach.findUnique({ where: { id: input.coachId } });
  if (!coach) throw new Error("Unknown coach.");

  const schedule =
    input.programType === "CUSTOM" && input.customSchedule
      ? input.customSchedule
      : PROGRAM_INFO[input.programType].defaultSchedule;

  await prisma.$transaction([
    prisma.userProfile.update({
      where: { userId },
      data: { coachId: coach.id, onboarded: true },
    }),
    prisma.trainingProgram.updateMany({
      where: { userId, active: true },
      data: { active: false },
    }),
    prisma.trainingProgram.create({
      data: {
        userId,
        type: input.programType,
        schedule: JSON.stringify(schedule),
      },
    }),
  ]);

  redirect("/");
}
