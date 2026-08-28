// One-time data migration for the 9 -> 34 muscle-type expansion. Runs BEFORE
// the schema.prisma enum is updated, using raw SQL so it doesn't depend on
// generated Prisma types matching either the old or new enum shape.
//
// Remaps:
//   - MonSTAR.muscleType (single value)
//   - WorkoutLog.muscleTypes (JSON string array)
//   - TrainingProgram.schedule (JSON string array-of-arrays)
// using LEGACY_MUSCLE_TYPE_MAP, so existing rows land on the specific new
// sub-muscle each old type is closest to instead of losing data.

import { PrismaClient } from "@prisma/client";
import { LEGACY_MUSCLE_TYPE_MAP } from "../../src/lib/muscleTypes";

const prisma = new PrismaClient();

function remapOne(old: string): string {
  return LEGACY_MUSCLE_TYPE_MAP[old] ?? old;
}

function remapArray(json: string): string {
  const arr = JSON.parse(json) as string[];
  return JSON.stringify(arr.map(remapOne));
}

function remapArrayOfArrays(json: string): string {
  const arr = JSON.parse(json) as string[][];
  return JSON.stringify(arr.map((day) => day.map(remapOne)));
}

async function main() {
  const monsters = await prisma.$queryRawUnsafe<{ id: string; muscleType: string }[]>(
    `SELECT id, muscleType FROM MonSTAR`
  );
  for (const m of monsters) {
    const next = remapOne(m.muscleType);
    if (next !== m.muscleType) {
      await prisma.$executeRawUnsafe(`UPDATE MonSTAR SET muscleType = ? WHERE id = ?`, next, m.id);
    }
  }
  console.log(`MonSTAR: remapped ${monsters.length} rows`);

  const logs = await prisma.$queryRawUnsafe<{ id: string; muscleTypes: string }[]>(
    `SELECT id, muscleTypes FROM WorkoutLog`
  );
  for (const log of logs) {
    const next = remapArray(log.muscleTypes);
    if (next !== log.muscleTypes) {
      await prisma.$executeRawUnsafe(`UPDATE WorkoutLog SET muscleTypes = ? WHERE id = ?`, next, log.id);
    }
  }
  console.log(`WorkoutLog: remapped ${logs.length} rows`);

  const programs = await prisma.$queryRawUnsafe<{ id: string; schedule: string }[]>(
    `SELECT id, schedule FROM TrainingProgram`
  );
  for (const p of programs) {
    const next = remapArrayOfArrays(p.schedule);
    if (next !== p.schedule) {
      await prisma.$executeRawUnsafe(`UPDATE TrainingProgram SET schedule = ? WHERE id = ?`, next, p.id);
    }
  }
  console.log(`TrainingProgram: remapped ${programs.length} rows`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
