import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { proofBonusIsReversible, PROOF_VERIFY_BONUS_XP, formatExerciseDetail, type ExerciseInput } from "@/lib/game";
import { DeleteProofButton } from "./DeleteProofButton";

export default async function HistoryPage() {
  await requireOnboarded();
  const userId = await getUserId();

  const [verifiedLogs, allLogs] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId, videoFilename: { not: null } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <h1 className="text-2xl font-black text-white">History</h1>

      <section>
        <h2 className="text-lg font-bold text-white">Verification History</h2>
        <p className="mt-1 text-sm text-slate-400">Every workout you&apos;ve verified with a video or screenshot.</p>

        {verifiedLogs.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            Nothing verified yet. Attach a video or screenshot after logging a workout to see it here.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {verifiedLogs.map((log) => {
              const muscleTypes = JSON.parse(log.muscleTypes) as MuscleType[];
              const isImage = log.videoMimeType?.startsWith("image/");
              const src = `/api/workout-proof/${log.id}`;
              const willLoseXp = log.videoVerifiedAt !== null && proofBonusIsReversible(log.videoVerifiedAt);
              return (
                <div key={log.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="flex aspect-video items-center justify-center bg-black/40">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded proof image, served from our own authenticated route
                      <img src={src} alt={`Proof for ${log.date}`} className="h-full w-full object-contain" />
                    ) : (
                      <video src={src} controls preload="metadata" className="h-full w-full object-contain" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{log.date}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {muscleTypes.map((t) => (
                          <span key={t} className="text-xs" title={MUSCLE_TYPE_META[t].label}>
                            {MUSCLE_TYPE_META[t].icon}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-amber-400">+{log.xpAwarded} XP</span>
                      <DeleteProofButton workoutLogId={log.id} willLoseXp={willLoseXp} bonusXp={PROOF_VERIFY_BONUS_XP} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">Workout History</h2>
        <p className="mt-1 text-sm text-slate-400">Every workout you&apos;ve logged, verified or not.</p>

        {allLogs.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No workouts logged yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {allLogs.map((log) => {
              const muscleTypes = JSON.parse(log.muscleTypes) as MuscleType[];
              const exercises = JSON.parse(log.exercises) as ExerciseInput[];
              return (
                <li key={log.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{log.date}</span>
                    <span className="font-bold text-amber-400">+{log.xpAwarded} XP</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {muscleTypes.map((t) => (
                      <span key={t} className="text-xs" title={MUSCLE_TYPE_META[t].label}>
                        {MUSCLE_TYPE_META[t].icon}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-xs text-slate-400">
                    {exercises.map((e, i) => {
                      const detail = formatExerciseDetail(e);
                      return (
                        <li key={i}>
                          {e.name}
                          {detail && <span className="text-slate-500"> — {detail}</span>}
                        </li>
                      );
                    })}
                  </ul>
                  {(log.caughtNewMonster || log.videoFilename) && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                      {log.caughtNewMonster && <span className="text-amber-300">🎉 New monSTAR</span>}
                      {log.videoFilename && <span className="text-emerald-400">✅ Verified</span>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
