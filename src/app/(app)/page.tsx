import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { xpProgress } from "@/lib/game";
import { PROGRAM_INFO, scheduleForDay, type ProgramType } from "@/lib/programs";
import { MUSCLE_TYPES, MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { StatBar } from "@/components/StatBar";

export default async function DashboardPage() {
  const profile = await requireOnboarded();
  const userId = await getUserId();

  const [monsters, program] = await Promise.all([
    prisma.monSTAR.findMany({ where: { userId } }),
    prisma.trainingProgram.findFirst({ where: { userId, active: true }, orderBy: { startDate: "desc" } }),
  ]);

  const ownedTypes = new Set(monsters.map((m) => m.muscleType as MuscleType));
  const trainerProgress = xpProgress(profile.trainerXp);

  let todaysTarget: MuscleType[] = [];
  let programInfo = null;
  if (program) {
    const schedule = JSON.parse(program.schedule) as MuscleType[][];
    todaysTarget = scheduleForDay(schedule, program.startDate, new Date());
    programInfo = PROGRAM_INFO[program.type as ProgramType];
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Training Level
              </p>
              <p className="text-3xl font-black text-white">Lv. {profile.trainerLevel}</p>
            </div>
            <div className="text-right text-sm text-orange-300">
              <p className="text-2xl">🔥 {profile.loginStreak}</p>
              <p className="text-xs text-slate-400">day streak</p>
            </div>
          </div>
          <div className="mt-4">
            <StatBar
              label="Trainer XP"
              value={trainerProgress.into}
              max={trainerProgress.need}
              colorClass="bg-indigo-400"
            />
          </div>
        </div>

        {profile.coach && (
          <div className="flex min-w-[220px] flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <div className="text-3xl">{profile.coach.icon}</div>
            <p className="mt-1 font-bold text-white">{profile.coach.name}</p>
            <p className="text-xs text-amber-400">{profile.coach.title}</p>
          </div>
        )}
      </section>

      {programInfo && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {programInfo.label} · Today&apos;s target
          </p>
          {todaysTarget.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {todaysTarget.map((type) => {
                const meta = MUSCLE_TYPE_META[type];
                return (
                  <span
                    key={type}
                    className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-300"
                  >
                    {meta.icon} {meta.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Rest day. Recovery is part of the grind.</p>
          )}
        </section>
      )}

      <section>
        <Link
          href="/log"
          className="block rounded-2xl bg-amber-400 py-4 text-center text-lg font-black text-slate-900 transition hover:bg-amber-300"
        >
          🏋️ Log Workout
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold text-white">Your collection</h2>
          <Link href="/monstars" className="text-xs font-semibold text-amber-400 hover:underline">
            {monsters.length}/{MUSCLE_TYPES.length} — view all
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_TYPES.map((type) => {
            const meta = MUSCLE_TYPE_META[type];
            const owned = ownedTypes.has(type);
            return (
              <span
                key={type}
                title={meta.label}
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl ${
                  owned
                    ? `border-transparent bg-gradient-to-br ${meta.bg}`
                    : "border-dashed border-white/15 opacity-30 grayscale"
                }`}
              >
                {meta.icon}
              </span>
            );
          })}
        </div>
      </section>
    </div>
  );
}
