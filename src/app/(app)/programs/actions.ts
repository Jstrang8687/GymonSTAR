"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import { PROGRAM_INFO, type ProgramType } from "@/lib/programs";
import type { MuscleType } from "@/lib/muscleTypes";

export async function changeProgram(input: {
  programType: ProgramType;
  customSchedule?: MuscleType[][];
}) {
  const userId = await getUserId();

  const schedule =
    input.programType === "CUSTOM" && input.customSchedule
      ? input.customSchedule
      : PROGRAM_INFO[input.programType].defaultSchedule;

  await prisma.$transaction([
    prisma.trainingProgram.updateMany({
      where: { userId, active: true },
      data: { active: false },
    }),
    prisma.trainingProgram.create({
      data: { userId, type: input.programType, schedule: JSON.stringify(schedule) },
    }),
  ]);

  revalidatePath("/programs");
  revalidatePath("/");
}
