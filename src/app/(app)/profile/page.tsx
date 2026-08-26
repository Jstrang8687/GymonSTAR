import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { xpProgress } from "@/lib/game";
import { StatBar } from "@/components/StatBar";

export default async function ProfilePage() {
  const profile = await requireOnboarded();
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const monsterCount = await prisma.monSTAR.count({ where: { userId } });
  const workoutCount = await prisma.workoutLog.count({ where: { userId } });

  const progress = xpProgress(profile.trainerXp);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-white">Profile</h1>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-lg font-bold text-white">{user.name}</p>
        <p className="text-sm text-slate-400">{user.email}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Training Level
        </p>
        <p className="text-2xl font-black text-white">Lv. {profile.trainerLevel}</p>
        <div className="mt-3">
          <StatBar label="Trainer XP" value={progress.into} max={progress.need} colorClass="bg-indigo-400" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-xl font-bold text-white">{profile.loginStreak}</p>
            <p className="text-xs text-slate-400">day streak</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{monsterCount}/9</p>
            <p className="text-xs text-slate-400">monSTARs</p>
          </div>
          <div>
            <p className="text-xl font-bold text-white">{workoutCount}</p>
            <p className="text-xs text-slate-400">workouts logged</p>
          </div>
        </div>
      </div>

      {profile.coach && (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-3xl">{profile.coach.icon}</div>
          <div>
            <p className="font-bold text-white">{profile.coach.name}</p>
            <p className="text-xs text-amber-400">{profile.coach.title}</p>
            <p className="mt-1 text-sm text-slate-400">{profile.coach.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
