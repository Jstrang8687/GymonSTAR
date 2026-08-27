import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";

export default async function HistoryPage() {
  await requireOnboarded();
  const userId = await getUserId();

  const logs = await prisma.workoutLog.findMany({
    where: { userId, videoFilename: { not: null } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-black text-white">Verification History</h1>
      <p className="mt-1 text-sm text-slate-400">Every workout you&apos;ve verified with a video or screenshot.</p>

      {logs.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500">
          Nothing verified yet. Attach a video or screenshot after logging a workout to see it here.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {logs.map((log) => {
            const muscleTypes = JSON.parse(log.muscleTypes) as MuscleType[];
            const isImage = log.videoMimeType?.startsWith("image/");
            const src = `/api/workout-proof/${log.id}`;
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
                  <span className="text-sm font-bold text-amber-400">+{log.xpAwarded} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
