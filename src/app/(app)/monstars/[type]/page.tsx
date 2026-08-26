import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPES, MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { hpForLevel, xpProgress } from "@/lib/game";
import { StatBar } from "@/components/StatBar";

function isMuscleType(value: string): value is MuscleType {
  return (MUSCLE_TYPES as readonly string[]).includes(value);
}

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

  const strength = xpProgress(monster.strengthXp);
  const endurance = xpProgress(monster.enduranceXp);
  const overall = xpProgress(monster.xp);
  const hp = hpForLevel(monster.level);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/monstars" className="text-sm text-slate-400 hover:text-white">
        ← Back to collection
      </Link>

      <div className={`mt-4 rounded-2xl bg-gradient-to-br p-6 text-white ${meta.bg}`}>
        <div className="flex items-center gap-4">
          <div className="text-6xl">{meta.icon}</div>
          <div>
            <h1 className="text-2xl font-black">{meta.monsterName}</h1>
            <p className="opacity-80">{meta.label} type</p>
            <p className="mt-1 text-sm font-semibold">
              Level {monster.level} · {hp} HP
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <StatBar label="Overall XP" icon="⭐" value={overall.into} max={overall.need} colorClass="bg-amber-400" />
        <StatBar label="Strength" icon="💪" value={strength.into} max={strength.need} colorClass="bg-rose-400" />
        <StatBar label="Endurance" icon="⚡" value={endurance.into} max={endurance.need} colorClass="bg-sky-400" />
      </div>

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
  );
}
