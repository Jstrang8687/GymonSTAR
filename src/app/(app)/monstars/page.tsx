import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_REGIONS, MUSCLE_TYPES, typesForRegion, type MuscleType } from "@/lib/muscleTypes";
import { MonsterTradingCard } from "@/components/MonsterTradingCard";

export default async function MonstarsPage() {
  await requireOnboarded();
  const userId = await getUserId();
  const monsters = await prisma.monSTAR.findMany({ where: { userId } });
  const byType = new Map(monsters.map((m) => [m.muscleType as MuscleType, m]));

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-black text-white">Your monSTARs</h1>
        <p className="text-sm font-semibold text-slate-400">
          {monsters.length} / {MUSCLE_TYPES.length} stacked
        </p>
      </div>
      <div className="space-y-8">
        {MUSCLE_REGIONS.map((region) => (
          <section key={region}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{region}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {typesForRegion(region).map((type) => (
                <MonsterTradingCard key={type} type={type} monster={byType.get(type) ?? null} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
