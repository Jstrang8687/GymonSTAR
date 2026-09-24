"use client";

import { useState } from "react";
import Link from "next/link";
import { computeDamage, generateOpponentCard, type BattleCard } from "@/lib/quickBattle";
import { hpForLevel } from "@/lib/game";
import { MONSTER_LORE } from "@/lib/monsterLore";
import { BattleCardFace } from "../BattleCardFace";
import { playAttackSound, playFaintSound, playHitSound, playLossSound, playSwitchSound, playWinSound } from "@/lib/battleSounds";

const MAX_TEAM = 3;
// How long each animated beat (punch/shake/faint/pop-in) stays on screen
// before the next step in the sequence plays -- matches the ~0.4-0.5s CSS
// animation durations in globals.css with a little breathing room after.
const STEP_MS = 550;

interface Fighter {
  card: BattleCard;
  maxHp: number;
  hp: number;
}

interface BattleState {
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  activePlayer: number;
  activeOpponent: number;
  log: string[];
  /** The player's active fighter just fainted and they must pick a replacement before anything else can happen. */
  awaitingPlayerSwitch: boolean;
}

// A single animated beat in a round -- who's attacking/fainting/switching
// in, so the card art can punch, shake, fade out, or pop in to match.
type BattleEffect =
  | { kind: "attack"; side: "player" | "opponent"; damage: number }
  | { kind: "faint"; side: "player" | "opponent" }
  | { kind: "switch-in"; side: "player" | "opponent" };

interface Step {
  state: BattleState;
  effect: BattleEffect;
}

function toFighter(card: BattleCard): Fighter {
  const maxHp = hpForLevel(card.power);
  return { card, maxHp, hp: maxHp };
}

function cloneTeam(team: Fighter[]): Fighter[] {
  return team.map((f) => ({ ...f }));
}

function livingIndex(team: Fighter[]): number {
  return team.findIndex((f) => f.hp > 0);
}

function snapshot(
  playerTeam: Fighter[],
  opponentTeam: Fighter[],
  activePlayer: number,
  activeOpponent: number,
  log: string[]
): BattleState {
  return {
    playerTeam: cloneTeam(playerTeam),
    opponentTeam: cloneTeam(opponentTeam),
    activePlayer,
    activeOpponent,
    log,
    awaitingPlayerSwitch: false,
  };
}

// Builds the whole round as a sequence of animated steps rather than
// resolving straight to a final state -- each attack, faint, and switch-in
// gets its own beat so the cards visibly trade blows instead of the HP
// bars just jumping to their end values.
function buildAttackSteps(battle: BattleState): Step[] {
  const steps: Step[] = [];
  const playerTeam = cloneTeam(battle.playerTeam);
  const opponentTeam = cloneTeam(battle.opponentTeam);
  let log = battle.log;
  const p = playerTeam[battle.activePlayer];
  const o = opponentTeam[battle.activeOpponent];

  // Higher power acts first, same "power doubles as speed" simplification
  // the other Solo Card Battle modes already use.
  const order: { atk: Fighter; def: Fighter; side: "player" | "opponent" }[] =
    p.card.power >= o.card.power
      ? [
          { atk: p, def: o, side: "player" },
          { atk: o, def: p, side: "opponent" },
        ]
      : [
          { atk: o, def: p, side: "opponent" },
          { atk: p, def: o, side: "player" },
        ];

  for (const { atk, def, side } of order) {
    if (atk.hp <= 0 || def.hp <= 0) continue;
    const dmg = computeDamage(atk.card.power, def.card.power, def.maxHp);
    def.hp = Math.max(0, def.hp - dmg);
    log = [...log, `${atk.card.name} uses ${MONSTER_LORE[atk.card.muscleType].move}! ${dmg} damage.`];
    steps.push({
      state: snapshot(playerTeam, opponentTeam, battle.activePlayer, battle.activeOpponent, log),
      effect: { kind: "attack", side, damage: dmg },
    });
    if (def.hp === 0) {
      log = [...log, `${def.card.name} fainted!`];
      steps.push({
        state: snapshot(playerTeam, opponentTeam, battle.activePlayer, battle.activeOpponent, log),
        effect: { kind: "faint", side: side === "player" ? "opponent" : "player" },
      });
    }
  }

  return steps;
}

// Voluntary switch: the new fighter pops in, then the foe gets a free hit
// on them -- same real cost a Pokemon-style switch has.
function buildSwitchSteps(battle: BattleState, index: number): Step[] {
  const steps: Step[] = [];
  const playerTeam = cloneTeam(battle.playerTeam);
  const opponentTeam = cloneTeam(battle.opponentTeam);
  let log = [...battle.log, `Go, ${playerTeam[index].card.name}!`];

  steps.push({
    state: snapshot(playerTeam, opponentTeam, index, battle.activeOpponent, log),
    effect: { kind: "switch-in", side: "player" },
  });

  const p = playerTeam[index];
  const o = opponentTeam[battle.activeOpponent];
  const dmg = computeDamage(o.card.power, p.card.power, p.maxHp);
  p.hp = Math.max(0, p.hp - dmg);
  log = [...log, `${o.card.name} uses ${MONSTER_LORE[o.card.muscleType].move}! ${dmg} damage.`];
  steps.push({
    state: snapshot(playerTeam, opponentTeam, index, battle.activeOpponent, log),
    effect: { kind: "attack", side: "opponent", damage: dmg },
  });

  if (p.hp === 0) {
    log = [...log, `${p.card.name} fainted!`];
    steps.push({
      state: snapshot(playerTeam, opponentTeam, index, battle.activeOpponent, log),
      effect: { kind: "faint", side: "player" },
    });
  }

  return steps;
}

function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const color = pct > 50 ? "bg-emerald-400" : pct > 20 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function FighterPanel({
  fighter,
  side,
  effect,
  effectKey,
  flip = false,
}: {
  fighter: Fighter;
  side: "player" | "opponent";
  effect: BattleEffect | null;
  effectKey: number;
  flip?: boolean;
}) {
  const isAttacker = effect?.kind === "attack" && effect.side === side;
  const isDefender = effect?.kind === "attack" && effect.side !== side;
  const isFainting = effect?.kind === "faint" && effect.side === side;
  const isPoppingIn = effect?.kind === "switch-in" && effect.side === side;

  const animClass = isFainting
    ? "battle-faint"
    : isAttacker
      ? side === "player"
        ? "battle-lunge-up"
        : "battle-lunge-down"
      : isDefender
        ? "battle-shake"
        : isPoppingIn
          ? "battle-pop-in"
          : "";

  return (
    <div className={`flex items-center gap-3 ${flip ? "flex-row-reverse text-right" : ""}`}>
      <div className="relative h-20 w-14 shrink-0">
        <div key={animClass ? `card-${effectKey}` : "card-idle"} className={animClass}>
          <BattleCardFace card={fighter.card} />
        </div>
        {isDefender && effect?.kind === "attack" && (
          <span
            key={`dmg-${effectKey}`}
            className="damage-float pointer-events-none absolute top-0 left-1/2 text-sm font-black text-red-400"
          >
            -{effect.damage}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">{fighter.card.name}</p>
        <HpBar hp={fighter.hp} maxHp={fighter.maxHp} />
        <p className="mt-0.5 text-[10px] text-slate-400">
          {fighter.hp}/{fighter.maxHp} HP
        </p>
      </div>
    </div>
  );
}

function BenchRow({ team, activeIndex }: { team: Fighter[]; activeIndex: number }) {
  return (
    <div className="mt-1 flex gap-1.5">
      {team.map((f, i) => (
        <div
          key={f.card.id}
          className={`h-8 w-8 overflow-hidden rounded border transition-opacity ${
            i === activeIndex ? "border-amber-400" : "border-white/10"
          } ${f.hp === 0 ? "opacity-25 grayscale" : ""}`}
        >
          <BattleCardFace card={f.card} iconSize="text-xs" />
        </div>
      ))}
    </div>
  );
}

function SwitchPicker({
  team,
  activeIndex,
  onPick,
  onCancel,
}: {
  team: Fighter[];
  activeIndex: number;
  onPick: (index: number) => void;
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
      <div className="grid grid-cols-3 gap-2">
        {team.map((f, i) => (
          <button
            key={f.card.id}
            type="button"
            disabled={f.hp === 0 || i === activeIndex}
            onClick={() => onPick(i)}
            className="rounded-lg border border-white/10 p-1.5 text-center text-xs text-white transition hover:border-amber-400/50 disabled:opacity-30"
          >
            <div className="mx-auto h-16 w-12">
              <BattleCardFace card={f.card} />
            </div>
            <p className="mt-1 truncate">{f.card.name}</p>
            <p className="text-[10px] text-slate-400">
              {f.hp}/{f.maxHp}
            </p>
          </button>
        ))}
      </div>
      {onCancel && (
        <button type="button" onClick={onCancel} className="mt-2 text-xs text-slate-400 hover:text-white">
          Cancel
        </button>
      )}
    </div>
  );
}

export function SquadBattle({ cards }: { cards: BattleCard[] }) {
  const [phase, setPhase] = useState<"select" | "battle" | "over">("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [outcome, setOutcome] = useState<"win" | "loss" | null>(null);
  const [choosingSwitch, setChoosingSwitch] = useState(false);
  const [effect, setEffect] = useState<BattleEffect | null>(null);
  const [effectKey, setEffectKey] = useState(0);
  const [animating, setAnimating] = useState(false);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_TEAM) return prev;
      return [...prev, id];
    });
  }

  function startBattle() {
    const chosen = cards.filter((c) => selectedIds.includes(c.id));
    if (chosen.length === 0) return;
    const playerTeam = chosen.map(toFighter);
    const avgPower = chosen.reduce((sum, c) => sum + c.power, 0) / chosen.length;
    const opponentTeam = chosen.map(() => toFighter(generateOpponentCard(avgPower)));
    setBattle({
      playerTeam,
      opponentTeam,
      activePlayer: 0,
      activeOpponent: 0,
      log: [`Go, ${playerTeam[0].card.name}!`, `Foe sends out ${opponentTeam[0].card.name}!`],
      awaitingPlayerSwitch: false,
    });
    setEffect(null);
    setOutcome(null);
    setPhase("battle");
  }

  function resetToSelect() {
    setBattle(null);
    setOutcome(null);
    setChoosingSwitch(false);
    setEffect(null);
    setPhase("select");
  }

  function playEffectSound(effectToPlay: BattleEffect) {
    if (effectToPlay.kind === "attack") {
      playAttackSound();
      setTimeout(playHitSound, 80);
    } else if (effectToPlay.kind === "faint") {
      playFaintSound();
    } else {
      playSwitchSound();
    }
  }

  // One-shot visual beat outside the step player -- used for automatic
  // swaps (the foe's own faint-triggered switch, the player's free
  // post-faint switch) that don't need a whole animated sequence.
  function flash(next: BattleEffect) {
    setEffectKey((k) => k + 1);
    setEffect(next);
    playEffectSound(next);
    setTimeout(() => setEffect(null), STEP_MS);
  }

  // Plays a precomputed sequence of steps one beat at a time, then hands
  // the final state to the caller to run its own end-of-round logic on.
  function playSteps(steps: Step[], onDone: (final: BattleState) => void) {
    if (steps.length === 0) return;
    setAnimating(true);
    let i = 0;
    const playNext = () => {
      const step = steps[i];
      setBattle(step.state);
      setEffect(step.effect);
      setEffectKey((k) => k + 1);
      playEffectSound(step.effect);
      i++;
      if (i < steps.length) {
        setTimeout(playNext, STEP_MS);
      } else {
        setTimeout(() => {
          setEffect(null);
          setAnimating(false);
          onDone(step.state);
        }, STEP_MS);
      }
    };
    playNext();
  }

  // Shared cleanup after any exchange: auto-advances a fainted opponent to
  // its next living fighter (opponent never voluntarily switches -- it only
  // ever reacts to fainting), decides win/loss, or asks the player to pick
  // their next fighter when their active one is the one that went down.
  function finishRound(
    playerTeam: Fighter[],
    opponentTeam: Fighter[],
    activePlayer: number,
    activeOpponent: number,
    log: string[]
  ) {
    let nextActiveOpponent = activeOpponent;
    if (opponentTeam[activeOpponent].hp === 0) {
      const next = livingIndex(opponentTeam);
      if (next === -1) {
        setBattle({ playerTeam, opponentTeam, activePlayer, activeOpponent, log, awaitingPlayerSwitch: false });
        setOutcome("win");
        setPhase("over");
        playWinSound();
        return;
      }
      nextActiveOpponent = next;
      log = [...log, `Foe sends out ${opponentTeam[next].card.name}!`];
      flash({ kind: "switch-in", side: "opponent" });
    }

    if (playerTeam[activePlayer].hp === 0) {
      const next = livingIndex(playerTeam);
      if (next === -1) {
        setBattle({
          playerTeam,
          opponentTeam,
          activePlayer,
          activeOpponent: nextActiveOpponent,
          log,
          awaitingPlayerSwitch: false,
        });
        setOutcome("loss");
        setPhase("over");
        playLossSound();
        return;
      }
      setBattle({
        playerTeam,
        opponentTeam,
        activePlayer,
        activeOpponent: nextActiveOpponent,
        log,
        awaitingPlayerSwitch: true,
      });
      return;
    }

    setBattle({
      playerTeam,
      opponentTeam,
      activePlayer,
      activeOpponent: nextActiveOpponent,
      log,
      awaitingPlayerSwitch: false,
    });
  }

  function handleAttack() {
    if (!battle || phase !== "battle" || battle.awaitingPlayerSwitch || animating) return;
    const steps = buildAttackSteps(battle);
    playSteps(steps, (final) =>
      finishRound(final.playerTeam, final.opponentTeam, final.activePlayer, final.activeOpponent, final.log)
    );
  }

  function handleVoluntarySwitch(index: number) {
    if (!battle || phase !== "battle" || battle.awaitingPlayerSwitch || animating) return;
    setChoosingSwitch(false);
    const steps = buildSwitchSteps(battle, index);
    playSteps(steps, (final) =>
      finishRound(final.playerTeam, final.opponentTeam, final.activePlayer, final.activeOpponent, final.log)
    );
  }

  // Replacing a fighter that just fainted is free -- the round already
  // ended when they went down, so no extra hit lands on the replacement.
  function handleForcedSwitch(index: number) {
    if (!battle) return;
    const log = [...battle.log, `Go, ${battle.playerTeam[index].card.name}!`];
    setBattle({ ...battle, activePlayer: index, log, awaitingPlayerSwitch: false });
    flash({ kind: "switch-in", side: "player" });
  }

  if (phase === "select") {
    return (
      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-300">
          Squad ({selectedIds.length}/{MAX_TEAM})
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {cards.map((c) => {
            const selected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleSelect(c.id)}
                className={`aspect-[2/3] rounded-lg border-2 transition ${
                  selected ? "border-amber-400" : "border-white/10 hover:border-white/30"
                }`}
              >
                <BattleCardFace card={c} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={startBattle}
          className="mt-4 w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-40"
        >
          ⚔️ Start Battle
        </button>
      </div>
    );
  }

  if (!battle) return null;

  return (
    <div className="mt-6 space-y-4">
      <div>
        <FighterPanel
          fighter={battle.opponentTeam[battle.activeOpponent]}
          side="opponent"
          effect={effect}
          effectKey={effectKey}
          flip
        />
        <div className="flex justify-end">
          <BenchRow team={battle.opponentTeam} activeIndex={battle.activeOpponent} />
        </div>
      </div>

      <div className="h-28 space-y-1 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 text-xs text-slate-300">
        {battle.log.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div>
        <FighterPanel fighter={battle.playerTeam[battle.activePlayer]} side="player" effect={effect} effectKey={effectKey} />
        <BenchRow team={battle.playerTeam} activeIndex={battle.activePlayer} />
      </div>

      {phase === "battle" && battle.awaitingPlayerSwitch && (
        <div>
          <p className="mb-2 text-sm font-semibold text-red-300">Choose your next fighter!</p>
          <SwitchPicker team={battle.playerTeam} activeIndex={battle.activePlayer} onPick={handleForcedSwitch} />
        </div>
      )}

      {phase === "battle" && !battle.awaitingPlayerSwitch && choosingSwitch && (
        <SwitchPicker
          team={battle.playerTeam}
          activeIndex={battle.activePlayer}
          onPick={handleVoluntarySwitch}
          onCancel={() => setChoosingSwitch(false)}
        />
      )}

      {phase === "battle" && !battle.awaitingPlayerSwitch && !choosingSwitch && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={animating}
            onClick={handleAttack}
            className="flex-1 rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
          >
            ⚔️ Attack
          </button>
          <button
            type="button"
            disabled={animating}
            onClick={() => setChoosingSwitch(true)}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-bold text-white transition hover:border-amber-400/50 disabled:opacity-50"
          >
            🔁 Switch
          </button>
        </div>
      )}

      {phase === "over" && (
        <div className="text-center">
          <p className={`text-lg font-black ${outcome === "win" ? "text-emerald-400" : "text-red-400"}`}>
            {outcome === "win" ? "You win! 🎉" : "You lose."}
          </p>
          <button
            type="button"
            onClick={resetToSelect}
            className="mt-3 w-full rounded-lg border border-white/10 py-2.5 text-sm font-bold text-white transition hover:border-amber-400/50"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
