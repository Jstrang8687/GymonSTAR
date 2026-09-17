"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session-helpers";
import type { MuscleType } from "@/lib/muscleTypes";
import type { TemplateExercise, WorkoutTemplateData } from "@/lib/workoutTemplates";

export interface SaveTemplateInput {
  name: string;
  muscleTypes: MuscleType[];
  exercises: TemplateExercise[];
}

function parseTemplate(row: { id: string; name: string; muscleTypes: string; exercises: string }): WorkoutTemplateData {
  return {
    id: row.id,
    name: row.name,
    muscleTypes: JSON.parse(row.muscleTypes) as MuscleType[],
    exercises: JSON.parse(row.exercises) as TemplateExercise[],
  };
}

export async function listTemplates(): Promise<WorkoutTemplateData[]> {
  const userId = await getUserId();
  const rows = await prisma.workoutTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(parseTemplate);
}

export async function createTemplate(input: SaveTemplateInput): Promise<WorkoutTemplateData> {
  const userId = await getUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Give the template a name.");
  if (input.exercises.length === 0) throw new Error("Add at least one exercise first.");

  const row = await prisma.workoutTemplate.create({
    data: {
      userId,
      name,
      muscleTypes: JSON.stringify(input.muscleTypes),
      exercises: JSON.stringify(input.exercises),
    },
  });

  revalidatePath("/log");
  revalidatePath("/settings/templates");
  return parseTemplate(row);
}

export async function updateTemplate(id: string, input: SaveTemplateInput): Promise<void> {
  const userId = await getUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Give the template a name.");
  if (input.exercises.length === 0) throw new Error("A template needs at least one exercise.");

  const existing = await prisma.workoutTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error("Template not found.");

  await prisma.workoutTemplate.update({
    where: { id },
    data: {
      name,
      muscleTypes: JSON.stringify(input.muscleTypes),
      exercises: JSON.stringify(input.exercises),
    },
  });

  revalidatePath("/log");
  revalidatePath("/settings/templates");
}

export async function deleteTemplate(id: string): Promise<void> {
  const userId = await getUserId();
  const existing = await prisma.workoutTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new Error("Template not found.");

  await prisma.workoutTemplate.delete({ where: { id } });

  revalidatePath("/log");
  revalidatePath("/settings/templates");
}
