import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { PROGRAM_INFO, dayIndexForDate, type ProgramType } from "@/lib/programs";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { ChangeProgramForm } from "./ChangeProgramForm";

const DAY_LABELS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export default async function ProgramsPage() {
  await requireOnboarded();
  const userId = await getUserId();
  const program = await prisma.trainingProgram.findFirst({
    where: { userId, active: true },
    orderBy: { startDate: "desc" },
  });

  const schedule = program ? (JSON.parse(program.schedule) as MuscleType[][]) : [];
  const currentType = (program?.type as ProgramType) ?? "UPPER_LOWER";
  const todayIdx = program ? dayIndexForDate(schedule.length, program.startDate, new Date()) : -1;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-black text-white">Training Program</h1>

      {program && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-amber-400">{PROGRAM_INFO[currentType].label}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {schedule.map((day, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-sm ${
                  idx === todayIdx
                    ? "border-amber-400 bg-amber-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="font-semibold text-white">
                  {DAY_LABELS[idx] ?? `Day ${idx + 1}`} {idx === todayIdx && "· today"}
                </p>
                <p className="mt-1 text-slate-400">
                  {day.length === 0
                    ? "Rest day"
                    : day.map((t) => `${MUSCLE_TYPE_META[t].icon} ${MUSCLE_TYPE_META[t].label}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold text-white">Change program</h2>
      <ChangeProgramForm currentType={currentType} />
    </div>
  );
}
