"use client";

import { useState } from "react";
import Link from "next/link";
import type { MonSTAR } from "@prisma/client";
import {
  MUSCLE_TYPE_META,
  TIER_LABEL,
  artUrlForLevel,
  monsterNameForLevel,
  stageForLevel,
  type MuscleType,
} from "@/lib/muscleTypes";
import { hpForLevel, xpProgress } from "@/lib/game";
import { StatBar } from "@/components/StatBar";
import { MONSTER_LORE } from "@/lib/monsterLore";

const TIER_BORDER = {
  1: "border-white/15",
  2: "border-slate-300/70 shadow-[0_0_16px_-4px_rgba(203,213,225,0.5)]",
  3: "border-amber-300 shadow-[0_0_24px_-4px_rgba(252,211,77,0.7)]",
} as const;

interface MonsterTradingCardProps {
  type: MuscleType;
  monster: MonSTAR | null;
  /** Whether the back of the card offers a link to the full detail page -- off when already on that page. */
  linkToDetail?: boolean;
}

export function MonsterTradingCard({ type, monster, linkToDetail = true }: MonsterTradingCardProps) {
  const meta = MUSCLE_TYPE_META[type];
  const [flipped, setFlipped] = useState(false);

  if (!monster) {
    return (
      <div className="flex aspect-[5/7] flex-col items-center justify-center rounded-2xl border-4 border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
        <div className="text-5xl opacity-20 grayscale">{meta.icon}</div>
        <p className="mt-3 font-black tracking-wide text-slate-500">???</p>
        <p className="mt-1 text-xs text-slate-600">{meta.label} type — not caught yet</p>
      </div>
    );
  }

  const tier = stageForLevel(monster.level);
  const name = monsterNameForLevel(meta, monster.level);
  const artUrl = artUrlForLevel(meta, monster.level);
  const hp = hpForLevel(monster.level);
  const strength = xpProgress(monster.strengthXp);
  const endurance = xpProgress(monster.enduranceXp);
  const overall = xpProgress(monster.xp);
  const lore = MONSTER_LORE[type];
  const isPreview = monster.userId === "preview";
  const caughtDate = new Date(monster.caughtAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function toggleFlip() {
    setFlipped((f) => !f);
  }

  return (
    <div
      className="relative aspect-[5/7] cursor-pointer [perspective:1200px]"
      onClick={toggleFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${name} card. Tap to ${flipped ? "see stats" : "see backstory"}.`}
    >
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-4 bg-slate-900 p-2.5 [backface-visibility:hidden] ${TIER_BORDER[tier]}`}
        >
          {tier === 3 && <div className="holo-shimmer" />}

          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 truncate rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {meta.icon} {meta.label}
            </span>
            <span className="shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-300">
              HP {hp}
            </span>
          </div>

          <h3 className="mt-1.5 truncate text-sm font-black text-white sm:text-base">{name}</h3>

          <div className={`relative mt-1.5 flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${meta.bg}`}>
            {artUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- small local pixel-art sprite, no need for next/image optimization
              <img src={artUrl} alt={name} className="h-full w-full object-contain [image-rendering:pixelated]" />
            ) : (
              <span className="text-5xl drop-shadow-lg sm:text-6xl">{meta.icon}</span>
            )}
            <span className="absolute bottom-1 right-1.5 rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-bold text-white">
              Lv.{monster.level}
            </span>
          </div>

          <div className="mt-1.5 space-y-1">
            <StatBar label="STR" icon="💪" value={strength.into} max={strength.need} colorClass="bg-rose-400" />
            <StatBar label="END" icon="⚡" value={endurance.into} max={endurance.need} colorClass="bg-sky-400" />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold">
            <span className={tier === 3 ? "text-amber-300" : tier === 2 ? "text-slate-300" : "text-slate-500"}>
              {TIER_LABEL[tier]}
            </span>
            <span className="text-slate-500">
              {overall.into}/{overall.need} XP
            </span>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border-4 bg-slate-900 p-3 [backface-visibility:hidden] [transform:rotateY(180deg)] ${TIER_BORDER[tier]}`}
        >
          <span className="self-start rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {meta.icon} {meta.label}
          </span>
          <h3 className="mt-1.5 truncate text-sm font-black text-white sm:text-base">{name}</h3>
          <p className="mt-2 flex-1 overflow-y-auto text-[11px] italic leading-snug text-slate-300">{lore.lore}</p>
          <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[10px] text-slate-400">
            <div className="flex items-center justify-between gap-2">
              <span className="shrink-0">Signature move</span>
              <span className="truncate font-semibold text-amber-300">{lore.move}</span>
            </div>
            {!isPreview && (
              <div className="flex items-center justify-between">
                <span>Caught</span>
                <span className="font-semibold text-white">{caughtDate}</span>
              </div>
            )}
          </div>
          {linkToDetail && (
            <Link
              href={`/monstars/${type}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-2 text-center text-[10px] font-semibold text-amber-400 hover:underline"
            >
              View recent workouts →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
