import { computeDamage, type BattleCard } from "@/lib/quickBattle";
import { hpForLevel } from "@/lib/game";
import { MONSTER_LORE } from "@/lib/monsterLore";
import { MUSCLE_TYPE_META, type MuscleRegion } from "@/lib/muscleTypes";

export interface Fighter {
  card: BattleCard;
  maxHp: number;
  hp: number;
  /** Chest's Overload counter -- every 3rd attack from this fighter hits harder. */
  hitCount: number;
  /** Shoulders' Brace -- true after this fighter attacks, consumed by the next hit it takes. */
  braced: boolean;
  /** Core's Stagger -- true after this fighter gets hit by a Core attacker, consumed on its next attack. */
  staggered: boolean;
}

export interface BattleState {
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  activePlayer: number;
  activeOpponent: number;
  log: string[];
  /** The player's active fighter just fainted and they must pick a replacement before anything else can happen. */
  awaitingPlayerSwitch: boolean;
}

// A single animated beat in a round -- who's attacking/healing/fainting/
// switching in, so the card art and sound can match.
export type BattleEffect =
  | { kind: "attack"; side: "player" | "opponent"; damage: number; blocked?: boolean }
  | { kind: "heal"; side: "player" | "opponent"; amount: number }
  | { kind: "faint"; side: "player" | "opponent" }
  | { kind: "switch-in"; side: "player" | "opponent" };

export interface Step {
  state: BattleState;
  effect: BattleEffect;
}

export function toFighter(card: BattleCard): Fighter {
  const maxHp = hpForLevel(card.power);
  return { card, maxHp, hp: maxHp, hitCount: 0, braced: false, staggered: false };
}

export function cloneTeam(team: Fighter[]): Fighter[] {
  return team.map((f) => ({ ...f }));
}

export function livingIndex(team: Fighter[]): number {
  return team.findIndex((f) => f.hp > 0);
}

function regionOf(card: BattleCard): MuscleRegion {
  return MUSCLE_TYPE_META[card.muscleType].region;
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

interface HitOutcome {
  damage: number;
  blocked: boolean;
  healAttacker: number;
}

// One swing's worth of trait-modified damage. Region traits stack with each
// other freely (e.g. a braced Neck fighter can still block on top of its
// reduced-damage buff) since each only ever multiplies the running total.
function resolveHit(attacker: Fighter, defender: Fighter, scale: number): HitOutcome {
  if (regionOf(defender.card) === "Neck" && Math.random() < 0.2) {
    return { damage: 0, blocked: true, healAttacker: 0 };
  }

  let dmg = Math.round(computeDamage(attacker.card.power, defender.card.power, defender.maxHp) * scale);

  if (regionOf(attacker.card) === "Legs") {
    dmg = Math.max(1, Math.round(dmg * (0.65 + Math.random() * 0.7)));
  }

  attacker.hitCount += 1;
  if (regionOf(attacker.card) === "Chest" && attacker.hitCount % 3 === 0) {
    dmg = Math.round(dmg * 1.5);
  }

  if (defender.braced) {
    dmg = Math.max(1, Math.round(dmg * 0.75));
    defender.braced = false;
  }

  if (attacker.staggered) {
    dmg = Math.max(1, Math.round(dmg * 0.75));
    attacker.staggered = false;
  }

  defender.hp = Math.max(0, defender.hp - dmg);

  let healAttacker = 0;
  if (regionOf(attacker.card) === "Back") {
    healAttacker = Math.max(1, Math.round(dmg * 0.25));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAttacker);
  }

  if (regionOf(attacker.card) === "Core") {
    defender.staggered = true;
  }

  return { damage: dmg, blocked: false, healAttacker };
}

// One fighter's full turn against one defender -- usually a single swing,
// but Arms' Flurry produces two at reduced damage each. Mutates the
// (already-cloned) teams in place and pushes one animated step per visual
// beat (a Cardio heal, each hit or block, a drain heal, a faint). Buff/
// debuff flavor text (brace, stagger) just rides along on the log without
// its own beat -- it'll surface on whatever step comes next.
function resolveTurn(
  attacker: Fighter,
  attackerSide: "player" | "opponent",
  defender: Fighter,
  playerTeam: Fighter[],
  opponentTeam: Fighter[],
  activePlayer: number,
  activeOpponent: number,
  log: string[],
  steps: Step[]
): string[] {
  const defenderSide: "player" | "opponent" = attackerSide === "player" ? "opponent" : "player";
  const push = (effect: BattleEffect) => {
    steps.push({ state: snapshot(playerTeam, opponentTeam, activePlayer, activeOpponent, log), effect });
  };

  if (regionOf(attacker.card) === "Cardio" && attacker.hp < attacker.maxHp) {
    const heal = Math.max(1, Math.round(attacker.maxHp * 0.1));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    log = [...log, `${attacker.card.name} catches its breath. +${heal} HP.`];
    push({ kind: "heal", side: attackerSide, amount: heal });
  }

  const isArms = regionOf(attacker.card) === "Arms";
  const swings = isArms ? 2 : 1;

  for (let i = 0; i < swings; i++) {
    if (defender.hp <= 0 || attacker.hp <= 0) break;

    const outcome = resolveHit(attacker, defender, isArms ? 0.6 : 1);

    if (outcome.blocked) {
      log = [...log, `${defender.card.name} blocks the hit!`];
      push({ kind: "attack", side: attackerSide, damage: 0, blocked: true });
      continue;
    }

    log = [...log, `${attacker.card.name} uses ${MONSTER_LORE[attacker.card.muscleType].move}! ${outcome.damage} damage.`];
    push({ kind: "attack", side: attackerSide, damage: outcome.damage });

    if (outcome.healAttacker > 0) {
      log = [...log, `${attacker.card.name} drains ${outcome.healAttacker} HP.`];
      push({ kind: "heal", side: attackerSide, amount: outcome.healAttacker });
    }

    if (defender.hp === 0) {
      log = [...log, `${defender.card.name} fainted!`];
      push({ kind: "faint", side: defenderSide });
      break;
    }

    if (defender.staggered) {
      log = [...log, `${defender.card.name} is staggered!`];
    }
  }

  if (regionOf(attacker.card) === "Shoulders" && attacker.hp > 0) {
    attacker.braced = true;
    log = [...log, `${attacker.card.name} braces for the next hit.`];
  }

  return log;
}

// Builds the whole round as a sequence of animated steps rather than
// resolving straight to a final state -- each attack, heal, and faint gets
// its own beat so the cards visibly trade blows instead of the HP bars
// just jumping to their end values.
export function buildAttackSteps(battle: BattleState): Step[] {
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
    log = resolveTurn(atk, side, def, playerTeam, opponentTeam, battle.activePlayer, battle.activeOpponent, log, steps);
  }

  return steps;
}

// Voluntary switch: the new fighter pops in, then the foe gets a free turn
// against them -- same real cost a Pokemon-style switch has.
export function buildSwitchSteps(battle: BattleState, index: number): Step[] {
  const steps: Step[] = [];
  const playerTeam = cloneTeam(battle.playerTeam);
  const opponentTeam = cloneTeam(battle.opponentTeam);
  const log = [...battle.log, `Go, ${playerTeam[index].card.name}!`];

  steps.push({
    state: snapshot(playerTeam, opponentTeam, index, battle.activeOpponent, log),
    effect: { kind: "switch-in", side: "player" },
  });

  const p = playerTeam[index];
  const o = opponentTeam[battle.activeOpponent];
  resolveTurn(o, "opponent", p, playerTeam, opponentTeam, index, battle.activeOpponent, log, steps);

  return steps;
}
