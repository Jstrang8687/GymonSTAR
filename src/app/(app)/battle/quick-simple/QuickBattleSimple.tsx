"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { generateOpponentCard, pickRandomLanes, type BattleCard, type LaneEffect } from "@/lib/quickBattle";
import { BattleCardFace, LocationCardFace } from "../BattleCardFace";

interface LaneState {
  effect: LaneEffect;
  cardId: string | null;
  opponentCard: BattleCard;
}

function newMatch(cards: BattleCard[]): LaneState[] {
  const avg = cards.length > 0 ? cards.reduce((sum, c) => sum + c.power, 0) / cards.length : 0;
  return pickRandomLanes(3).map((effect) => ({
    effect,
    cardId: null,
    opponentCard: generateOpponentCard(avg),
  }));
}

export function QuickBattleSimple({ cards }: { cards: BattleCard[] }) {
  // Lane picks and opponent power are randomized, so they must not be
  // computed during the initial render -- that render happens once on the
  // server and once on the client for hydration, and different Math.random()
  // results between the two produce a hydration mismatch. Starting from null
  // and filling in client-side after mount keeps the server/client markup
  // identical for that first render.
  const [lanes, setLanes] = useState<LaneState[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setLanes(newMatch(cards));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-roll on explicit "play again", not whenever `cards` reference changes
  }, []);

  if (cards.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
        You haven&apos;t caught any monSTARs yet.{" "}
        <Link href="/log" className="font-semibold text-amber-400 hover:underline">
          Log a workout
        </Link>{" "}
        to catch your first one before battling.
      </div>
    );
  }

  if (!lanes) {
    return <div className="mt-8 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />;
  }

  const cardById = new Map(cards.map((c) => [c.id, c]));
  const placedIds = new Set(lanes.map((l) => l.cardId).filter(Boolean) as string[]);
  const hand = cards.filter((c) => !placedIds.has(c.id));

  function placeCard(laneIndex: number) {
    if (revealed) return;
    setLanes((prev) =>
      (prev ?? []).map((lane, i) => {
        if (i !== laneIndex) return lane;
        if (lane.cardId) return { ...lane, cardId: null };
        if (!selected) return lane;
        return { ...lane, cardId: selected };
      })
    );
    setSelected(null);
  }

  function reveal() {
    if (revealed || !lanes) return;
    setRevealed(true);
    let wins = 0;
    let losses = 0;
    for (const lane of lanes) {
      const card = lane.cardId ? cardById.get(lane.cardId) : undefined;
      const yourPower = card ? lane.effect.apply(card.power) : 0;
      const oppPower = lane.effect.apply(lane.opponentCard.power);
      if (yourPower > oppPower) wins++;
      else if (oppPower > yourPower) losses++;
    }
    setResult(wins > losses ? "You win the match! 🎉" : wins < losses ? "You lose this one." : "Draw.");
  }

  function playAgain() {
    setLanes(newMatch(cards));
    setSelected(null);
    setRevealed(false);
    setResult(null);
  }

  const placedCount = lanes.filter((l) => l.cardId).length;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {lanes.map((lane, i) => {
          const card = lane.cardId ? cardById.get(lane.cardId) : undefined;
          const yourPower = card ? lane.effect.apply(card.power) : 0;
          const oppPower = lane.effect.apply(lane.opponentCard.power);
          const laneOutcome = revealed ? (yourPower > oppPower ? "win" : oppPower > yourPower ? "loss" : "tie") : null;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`relative aspect-[2/3] w-full rounded-lg ${!revealed && "border-2 border-dashed border-white/15 bg-white/[0.03]"}`}
              >
                {revealed ? (
                  <>
                    <BattleCardFace card={lane.opponentCard} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                      {oppPower}
                    </span>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">?</div>
                )}
              </div>

              <div className="aspect-[2/3] w-full">
                <LocationCardFace lane={lane.effect} />
              </div>

              <button
                type="button"
                onClick={() => placeCard(i)}
                disabled={revealed || (!card && !selected)}
                className={`relative aspect-[2/3] w-full rounded-lg transition disabled:cursor-default ${
                  !card && "border-2 border-dashed border-white/15 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                {card && (
                  <>
                    <BattleCardFace card={card} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                      {yourPower}
                    </span>
                  </>
                )}
              </button>

              {laneOutcome && (
                <span
                  className={`text-[9px] font-bold uppercase ${
                    laneOutcome === "win"
                      ? "text-emerald-400"
                      : laneOutcome === "loss"
                        ? "text-red-400"
                        : "text-slate-400"
                  }`}
                >
                  {laneOutcome}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!revealed && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-400">Your monSTARs — tap one, then tap a lane</p>
          <div className="flex flex-wrap gap-2">
            {hand.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected((s) => (s === c.id ? null : c.id))}
                className={`relative h-16 w-12 rounded-md transition ${
                  selected === c.id ? "ring-2 ring-amber-400" : "hover:opacity-80"
                }`}
              >
                <BattleCardFace card={c} iconSize="text-base" />
                <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                  {c.power}
                </span>
              </button>
            ))}
            {hand.length === 0 && <p className="text-xs text-slate-500">All your monSTARs are placed.</p>}
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-center text-sm font-bold text-amber-200">
          {result}
        </div>
      )}

      {!revealed ? (
        <button
          type="button"
          disabled={placedCount === 0}
          onClick={reveal}
          className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-40"
        >
          Reveal
        </button>
      ) : (
        <button
          type="button"
          onClick={playAgain}
          className="w-full rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-slate-300 hover:border-white/30 hover:text-white"
        >
          Play again
        </button>
      )}
    </div>
  );
}
