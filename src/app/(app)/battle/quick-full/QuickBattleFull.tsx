"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  pickRandomLanes,
  generateOpponentCard,
  energyCostForPower,
  type BattleCard,
  type LaneEffect,
} from "@/lib/quickBattle";
import { BattleCardFace, LocationCardFace } from "../BattleCardFace";

const MAX_HAND = 4;
const MAX_TURNS = 6;

interface LaneState {
  effect: LaneEffect;
  cardId: string | null;
  opponentCard: BattleCard;
  // Which turn the opponent secretly commits to this lane -- a face-down
  // card appears here as soon as state.turn reaches it, same as Snap shows
  // opponent card BACKS turn by turn, well before the actual reveal.
  opponentPlayTurn: number;
}

function shuffledRoster(cards: BattleCard[]): BattleCard[] {
  // "Deck" = up to 12 of your caught monSTARs. No deck-building UI yet in
  // this prototype -- it just grabs a random 12 (or all of them, if fewer).
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12);
}

function freshMatch(cards: BattleCard[]) {
  const deck = shuffledRoster(cards);
  const hand = deck.slice(0, MAX_HAND);
  const remainingDeck = deck.slice(MAX_HAND);
  const avg = cards.length > 0 ? cards.reduce((sum, c) => sum + c.power, 0) / cards.length : 0;
  const lanes: LaneState[] = pickRandomLanes(3).map((effect) => ({
    effect,
    cardId: null,
    opponentCard: generateOpponentCard(avg),
    opponentPlayTurn: 1 + Math.floor(Math.random() * MAX_TURNS),
  }));
  return { deck: remainingDeck, hand, lanes, turn: 1, energyUsed: 0 };
}

type MatchState = ReturnType<typeof freshMatch>;

export function QuickBattleFull({ cards }: { cards: BattleCard[] }) {
  // See the matching comment in QuickBattleSimple -- the deck shuffle, hand
  // draw, and lane/opponent randomization can't run during the initial
  // render (server and client would each roll different results and React
  // would flag a hydration mismatch), so this starts null and gets filled
  // in client-side after mount instead.
  const [state, setState] = useState<MatchState | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setState(freshMatch(cards));
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

  if (!state) {
    return <div className="mt-8 h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />;
  }

  const cardById = new Map(cards.map((c) => [c.id, c]));
  const energyAvailable = state.turn - state.energyUsed;

  function placeCard(cardId: string, laneIndex: number) {
    if (revealed || !state) return;
    const card = cardById.get(cardId);
    if (!card) return;
    const lane = state.lanes[laneIndex];
    if (lane.cardId) return;
    const cost = energyCostForPower(card.power);
    if (cost > energyAvailable) return;

    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hand: prev.hand.filter((c) => c.id !== cardId),
        lanes: prev.lanes.map((l, i) => (i === laneIndex ? { ...l, cardId } : l)),
        energyUsed: prev.energyUsed + cost,
      };
    });
  }

  function reveal(finalLanes: LaneState[]) {
    setRevealed(true);
    let wins = 0;
    let losses = 0;
    for (const lane of finalLanes) {
      const card = lane.cardId ? cardById.get(lane.cardId) : undefined;
      const yourPower = card ? lane.effect.apply(card.power) : 0;
      const oppPower = lane.effect.apply(lane.opponentCard.power);
      if (yourPower > oppPower) wins++;
      else if (oppPower > yourPower) losses++;
    }
    setResult(wins > losses ? "You win the match! 🎉" : wins < losses ? "You lose this one." : "Draw.");
  }

  function endTurn() {
    if (revealed || !state) return;
    if (state.turn >= MAX_TURNS) {
      reveal(state.lanes);
      return;
    }
    setState((prev) => {
      if (!prev) return prev;
      const nextTurn = prev.turn + 1;
      const needed = Math.max(0, MAX_HAND - prev.hand.length);
      const drawn = prev.deck.slice(0, needed);
      return {
        ...prev,
        turn: nextTurn,
        energyUsed: 0,
        hand: [...prev.hand, ...drawn],
        deck: prev.deck.slice(needed),
      };
    });
  }

  function playAgain() {
    setState(freshMatch(cards));
    setRevealed(false);
    setResult(null);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs">
        <span className="font-semibold text-white">
          Turn {Math.min(state.turn, MAX_TURNS)}/{MAX_TURNS}
        </span>
        <span className="text-amber-400">⚡ {revealed ? 0 : energyAvailable} energy left</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {state.lanes.map((lane, i) => {
          const card = lane.cardId ? cardById.get(lane.cardId) : undefined;
          const yourPower = card ? lane.effect.apply(card.power) : 0;
          const oppPower = lane.effect.apply(lane.opponentCard.power);
          const laneOutcome = revealed ? (yourPower > oppPower ? "win" : oppPower > yourPower ? "loss" : "tie") : null;
          const oppPlayed = state.turn >= lane.opponentPlayTurn;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`relative aspect-[2/3] w-full rounded-lg ${
                  !revealed && !oppPlayed ? "border-2 border-dashed border-white/15 bg-white/[0.03]" : ""
                }`}
              >
                {revealed ? (
                  <>
                    <BattleCardFace card={lane.opponentCard} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                      {oppPower}
                    </span>
                  </>
                ) : oppPlayed ? (
                  <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/25 bg-slate-800 text-lg">
                    🎴
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">?</div>
                )}
              </div>

              <div className="aspect-[2/3] w-full">
                <LocationCardFace lane={lane.effect} />
              </div>

              <div
                className={`relative aspect-[2/3] w-full rounded-lg ${!card && "border-2 border-dashed border-white/15 bg-white/[0.03]"}`}
              >
                {card && (
                  <>
                    <BattleCardFace card={card} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
                      {yourPower}
                    </span>
                  </>
                )}
              </div>

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
          <p className="mb-1.5 text-xs font-semibold text-slate-400">
            Your hand — tap a card, then an empty lane
          </p>
          <div className="flex flex-wrap gap-2">
            {state.hand.map((c) => {
              const cost = energyCostForPower(c.power);
              const affordable = cost <= energyAvailable;
              return (
                <div key={c.id} className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                    {state.lanes.map((lane, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={!affordable || !!lane.cardId}
                        onClick={() => placeCard(c.id, i)}
                        className="h-4 w-4 rounded-full border border-white/20 text-[8px] text-slate-400 hover:border-amber-400 hover:text-amber-300 disabled:cursor-default disabled:opacity-20"
                        aria-label={`Place ${c.name} in lane ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className={`relative h-16 w-12 rounded-md ${!affordable && "opacity-40"}`}>
                    <BattleCardFace card={c} iconSize="text-base" />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                      {c.power}·⚡{cost}
                    </span>
                  </div>
                </div>
              );
            })}
            {state.hand.length === 0 && <p className="text-xs text-slate-500">Your hand is empty.</p>}
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
          onClick={endTurn}
          className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
        >
          {state.turn >= MAX_TURNS ? "Reveal" : "End turn"}
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
