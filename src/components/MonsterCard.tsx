import Link from "next/link";
import { MUSCLE_TYPE_META, type MuscleType } from "@/lib/muscleTypes";
import { hpForLevel } from "@/lib/game";
import type { MonSTAR } from "@prisma/client";

export function MonsterCard({ type, monster }: { type: MuscleType; monster: MonSTAR | null }) {
  const meta = MUSCLE_TYPE_META[type];

  if (!monster) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center">
        <div className="text-4xl opacity-20 grayscale">{meta.icon}</div>
        <p className="mt-2 text-sm font-semibold text-slate-500">???</p>
        <p className="text-xs text-slate-600">{meta.label} — not caught yet</p>
      </div>
    );
  }

  return (
    <Link
      href={`/monstars/${type}`}
      className={`flex flex-col items-center rounded-xl border border-white/10 bg-gradient-to-b p-4 text-center text-white transition hover:scale-[1.02] ${meta.bg}`}
    >
      <div className="text-4xl">{meta.icon}</div>
      <p className="mt-2 font-bold">{meta.monsterName}</p>
      <p className="text-xs opacity-80">{meta.label}</p>
      <p className="mt-1 text-xs font-semibold">
        Lv.{monster.level} · {hpForLevel(monster.level)} HP
      </p>
    </Link>
  );
}
