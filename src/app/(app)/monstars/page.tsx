import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPES, type MuscleType } from "@/lib/muscleTypes";
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MUSCLE_TYPES.map((type) => (
          <MonsterTradingCard key={type} type={type} monster={byType.get(type) ?? null} />
        ))}
      </div>
    </div>
  );
}
