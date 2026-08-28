import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session-helpers";
import { MUSCLE_TYPE_META, monsterNameForLevel, stageForLevel, type MuscleType } from "@/lib/muscleTypes";
import { xpProgress } from "@/lib/game";
import { TrainerXpAdjuster } from "./TrainerXpAdjuster";
import { MonsterEditRow } from "./MonsterEditRow";
import { WorkoutLogRow } from "./WorkoutLogRow";

export default async function AdminUserDetailPage({ params }: PageProps<"/admin/users/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: { include: { coach: true } },
      monsters: true,
      workoutLogs: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!user) notFound();

  const trainerProgress = user.profile ? xpProgress(user.profile.trainerXp) : null;

  return (
    <div>
      <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
        ← Back to admin
      </Link>

      <div className="mt-2 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="text-sm text-slate-400">{user.email}</p>
        </div>
      </div>

      {user.profile ? (
        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-sm font-bold text-white">Trainer Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-sm text-slate-300">
              <p>
                Level <span className="font-bold text-white">{user.profile.trainerLevel}</span> — XP{" "}
                <span className="font-bold text-white">
                  {user.profile.trainerXp}/{trainerProgress?.need}
                </span>
              </p>
              <p className="mt-1">Streak: 🔥 {user.profile.loginStreak}</p>
              <p className="mt-1">Coach: {user.profile.coach?.name ?? "None"}</p>
            </div>
            <TrainerXpAdjuster userId={user.id} />
          </div>
        </section>
      ) : (
        <p className="mb-8 text-sm text-slate-500">No profile yet (hasn&apos;t completed onboarding).</p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-white">monSTARs ({user.monsters.length})</h2>
        {user.monsters.length === 0 ? (
          <p className="text-sm text-slate-500">None caught yet.</p>
        ) : (
          <div className="space-y-2">
            {user.monsters.map((m) => {
              const meta = MUSCLE_TYPE_META[m.muscleType as MuscleType];
              const name = monsterNameForLevel(meta, m.level);
              return (
                <MonsterEditRow
                  key={m.id}
                  monsterId={m.id}
                  label={`${meta.icon} ${name} (${meta.label}) — tier ${stageForLevel(m.level)}`}
                  level={m.level}
                  xp={m.xp}
                  strengthXp={m.strengthXp}
                  enduranceXp={m.enduranceXp}
                />
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-white">Recent workout logs ({user.workoutLogs.length})</h2>
        {user.workoutLogs.length === 0 ? (
          <p className="text-sm text-slate-500">No logs yet.</p>
        ) : (
          <div className="space-y-2">
            {user.workoutLogs.map((log) => (
              <WorkoutLogRow
                key={log.id}
                logId={log.id}
                date={log.date}
                xpAwarded={log.xpAwarded}
                muscleTypes={JSON.parse(log.muscleTypes) as string[]}
                hasProof={!!log.videoFilename}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
