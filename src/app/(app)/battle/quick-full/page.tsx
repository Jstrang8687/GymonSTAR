import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserId, requireOnboarded } from "@/lib/session-helpers";
import { MUSCLE_TYPE_META, artUrlForLevel, monsterNameForLevel, stageForLevel, type MuscleType } from "@/lib/muscleTypes";
import type { BattleCard } from "@/lib/quickBattle";
import { QuickBattleFull } from "./QuickBattleFull";

export default async function QuickBattleFullPage() {
  await requireOnboarded();
  const userId = await getUserId();
  const monsters = await prisma.monSTAR.findMany({ where: { userId } });

  const cards: BattleCard[] = monsters.map((m) => {
    const meta = MUSCLE_TYPE_META[m.muscleType as MuscleType];
    return {
      id: m.id,
      name: monsterNameForLevel(meta, m.level),
      icon: meta.icon,
      artUrl: artUrlForLevel(meta, m.level),
      tier: stageForLevel(m.level),
      power: m.level,
      muscleType: m.muscleType as MuscleType,
    };
  });

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/battle" className="text-sm text-slate-400 hover:text-white">
        ← Back to Battle
      </Link>
      <div className="mt-2 mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
        🧪 Prototype — testing only, nothing here is saved.
      </div>
      <h1 className="text-2xl font-black text-white">Quick Battle — Full Rules</h1>
      <p className="mt-1 text-sm text-slate-400">
        A 12-card roster, a hand of 4, and 6 turns of energy-gated deploys before the reveal.
      </p>
      <QuickBattleFull cards={cards} />
    </div>
  );
}
