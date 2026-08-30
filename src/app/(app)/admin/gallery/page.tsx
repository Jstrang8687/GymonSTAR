import Link from "next/link";
import type { MonSTAR } from "@prisma/client";
import { requireAdmin } from "@/lib/session-helpers";
import { MUSCLE_REGIONS, MUSCLE_TYPES, typesForRegion, type MuscleType } from "@/lib/muscleTypes";
import { xpForLevel } from "@/lib/game";
import { MonsterTradingCard } from "@/components/MonsterTradingCard";

// Representative level for each evolution tier, matching the thresholds in
// muscleTypes.ts's stageForLevel() (tier 2 unlocks at 10, tier 3 at 25).
const TIER_PREVIEW_LEVELS = [1, 10, 25] as const;

function previewMonster(type: MuscleType, level: number): MonSTAR {
  const xp = Math.round(xpForLevel(level) / 2);
  return {
    id: `preview-${type}-${level}`,
    userId: "preview",
    muscleType: type,
    nickname: null,
    level,
    xp,
    strengthXp: Math.round(xp / 2),
    enduranceXp: Math.round(xp / 2),
    caughtAt: new Date(),
  };
}

export default async function AdminGalleryPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">monSTAR Gallery</h1>
          <p className="text-sm text-slate-400">
            All {MUSCLE_TYPES.length} types × 3 evolution tiers ({MUSCLE_TYPES.length * 3} cards) — regardless of
            what&apos;s actually caught, for reviewing art and evolution names.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
          ← Back to admin
        </Link>
      </div>

      <div className="space-y-10">
        {MUSCLE_REGIONS.map((region) => (
          <section key={region}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{region}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {typesForRegion(region).map((type) =>
                TIER_PREVIEW_LEVELS.map((level) => (
                  <MonsterTradingCard
                    key={`${type}-${level}`}
                    type={type}
                    monster={previewMonster(type, level)}
                    linkToDetail={false}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
