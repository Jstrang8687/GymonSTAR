import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { xpProgress } from "@/lib/game";
import { StatBar } from "@/components/StatBar";
import { CoachAvatar } from "@/components/CoachAvatar";
import { ChangeCoachPicker } from "./ChangeCoachPicker";

export default async function ProfilePage() {
  const profile = await requireOnboarded();
  const userId = await getUserId();
  const [user, monsterCount, workoutCount, coaches] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.monSTAR.count({ where: { userId } }),
    prisma.workoutLog.count({ where: { userId } }),
    prisma.coach.findMany({ orderBy: { name: "asc" } }),
  ]);

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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {profile.coach && (
          <div className="mb-4 flex items-center gap-4">
            <CoachAvatar src={profile.coach.icon} alt={profile.coach.name} width="4rem" />
            <div>
              <p className="font-bold text-white">{profile.coach.name}</p>
              <p className="text-xs text-amber-400">{profile.coach.title}</p>
              <p className="mt-1 text-sm text-slate-400">{profile.coach.description}</p>
            </div>
          </div>
        )}
        <ChangeCoachPicker coaches={coaches} currentCoachId={profile.coachId} />
      </div>
    </div>
  );
}
