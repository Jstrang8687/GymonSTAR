import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import {
  MUSCLE_TYPES,
  MUSCLE_TYPE_META,
  TIER_LABEL,
  monsterNameForLevel,
  stageForLevel,
  type MuscleType,
} from "@/lib/muscleTypes";
import { MonsterTradingCard } from "@/components/MonsterTradingCard";

function isMuscleType(value: string): value is MuscleType {
  return (MUSCLE_TYPES as readonly string[]).includes(value);
}

const TIER_UP_LEVEL = { 1: 10, 2: 25 } as const;

export default async function MonsterDetailPage({ params }: PageProps<"/monstars/[type]">) {
  await requireOnboarded();
  const { type } = await params;
  if (!isMuscleType(type)) notFound();

  const userId = await getUserId();
  const meta = MUSCLE_TYPE_META[type];
  const monster = await prisma.monSTAR.findUnique({
    where: { userId_muscleType: { userId, muscleType: type } },
  });

  if (!monster) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="text-6xl opacity-20 grayscale">{meta.icon}</div>
        <h1 className="mt-4 text-xl font-bold text-white">Not caught yet</h1>
        <p className="mt-2 text-sm text-slate-400">
          Log a {meta.label.toLowerCase()} workout to catch this monSTAR.
        </p>
        <Link href="/log" className="mt-6 inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900">
          Log a Workout
        </Link>
      </div>
    );
  }

  const logs = await prisma.workoutLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const contributingLogs = logs
    .filter((log) => (JSON.parse(log.muscleTypes) as string[]).includes(type))
    .slice(0, 8);

  const tier = stageForLevel(monster.level);
  const name = monsterNameForLevel(meta, monster.level);
  const nextTierLevel = tier === 1 ? TIER_UP_LEVEL[1] : tier === 2 ? TIER_UP_LEVEL[2] : null;
  const nextStageName = tier === 1 ? meta.stageNames[1] : tier === 2 ? meta.stageNames[2] : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/monstars" className="text-sm text-slate-400 hover:text-white">
        ← Back to collection
      </Link>

      <div className="mt-4 grid gap-6 sm:grid-cols-[220px_1fr]">
        <div className="mx-auto w-full max-w-[220px]">
          <MonsterTradingCard type={type} monster={monster} linkToDetail={false} />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">{name}</h1>
          <p className="text-sm text-slate-400">
            {meta.label} type · {TIER_LABEL[tier]} tier
          </p>

          {nextTierLevel && (
            <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
              Evolves into <span className="font-semibold text-white">{nextStageName}</span> at level{" "}
              <span className="font-semibold text-amber-400">{nextTierLevel}</span> — {nextTierLevel - monster.level}{" "}
              level{nextTierLevel - monster.level === 1 ? "" : "s"} to go.
            </p>
          )}
          {!nextTierLevel && (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
              Fully evolved. This monSTAR has reached its final form.
            </p>
          )}

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-bold text-white">Recent contributing workouts</h2>
            {contributingLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No logs yet.</p>
            ) : (
              <ul className="space-y-2">
                {contributingLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-300">{log.date}</span>
                    <span className="font-semibold text-amber-400">+{log.xpAwarded} XP</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
