import {
  MUSCLE_TYPES,
  MUSCLE_TYPE_META,
  artUrlForLevel,
  monsterNameForLevel,
  stageForLevel,
  type EvolutionTier,
  type MuscleType,
} from "@/lib/muscleTypes";

// Shared, no-persistence logic for the two Quick Battle prototypes. Nothing
// here touches the database -- battles are simulated entirely client-side
// so both prototypes are cheap to compare before committing to one.

export interface BattleCard {
  id: string;
  name: string;
  icon: string;
  /** Real pixel-art sprite for this monSTAR's evolution stage, when one exists -- falls back to icon otherwise. */
  artUrl?: string;
  tier: EvolutionTier;
  power: number;
  muscleType: MuscleType;
}

// Same tier styling MonsterTradingCard uses, so a card looks like the same
// card whether it's on your collection page or on a battlefield.
export const TIER_BORDER: Record<EvolutionTier, string> = {
  1: "border-white/15",
  2: "border-slate-300/70 shadow-[0_0_10px_-3px_rgba(203,213,225,0.5)]",
  3: "border-amber-300 shadow-[0_0_14px_-3px_rgba(252,211,77,0.7)]",
};

export interface LaneEffect {
  /** Stable slug -- doubles as the expected filename under /public/locations/<id>.png once real art exists. */
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Short label for the prominent on-card badge, e.g. "+2", "×2", "—". */
  badge: string;
  /** Badge color hint -- "up" (boost), "down" (penalty), or "neutral" (no change). */
  badgeKind: "up" | "down" | "neutral";
  /** Real location card art, once it exists -- falls back to the icon placeholder until then. */
  artUrl?: string;
  apply: (power: number) => number;
}

// Real places you can actually work out, Snap-location style -- each with
// its own effect on whoever plays there (you or the opponent). Each gets a
// full location CARD in the UI (not just a text header), same size as the
// monSTAR cards. Art lives at /public/locations/<id>.jpg -- entries without
// matching art on disk just fall back to the icon placeholder.
const LANE_EFFECTS_BASE: Omit<LaneEffect, "artUrl">[] = [
  { id: "crossfit-box", name: "CrossFit box", icon: "🏋️", description: "Power x2 here", badge: "×2", badgeKind: "up", apply: (p) => p * 2 },
  { id: "community-center", name: "Community center", icon: "🏢", description: "+3 power here", badge: "+3", badgeKind: "up", apply: (p) => (p > 0 ? p + 3 : 0) },
  { id: "the-park", name: "The park", icon: "🌳", description: "+2 power here", badge: "+2", badgeKind: "up", apply: (p) => (p > 0 ? p + 2 : 0) },
  { id: "garage-gym", name: "Garage gym", icon: "🚪", description: "+1 power here", badge: "+1", badgeKind: "up", apply: (p) => (p > 0 ? p + 1 : 0) },
  { id: "24-hour-gym", name: "24-hour gym", icon: "🌙", description: "+3 power here", badge: "+3", badgeKind: "up", apply: (p) => (p > 0 ? p + 3 : 0) },
  { id: "track-and-field", name: "Track & field", icon: "🏃", description: "+2 power here", badge: "+2", badgeKind: "up", apply: (p) => (p > 0 ? p + 2 : 0) },
  { id: "rooftop-gym", name: "Rooftop gym", icon: "🌆", description: "+1 power here", badge: "+1", badgeKind: "up", apply: (p) => (p > 0 ? p + 1 : 0) },
  { id: "the-beach", name: "The beach", icon: "🏖️", description: "No bonus, just sand", badge: "—", badgeKind: "neutral", apply: (p) => p },
  // Debuff locations, mirroring Marvel Snap's flat power-penalty spots
  // (Sewer System -1, Necrosha -2, Negative Zone -3) -- same escalating
  // tiers as the boost locations above, just the other direction. No real
  // art yet, so these render icon-only until art gets generated for them.
  { id: "overcrowded-gym-floor", name: "Overcrowded gym floor", icon: "😤", description: "-1 power here (every machine's taken)", badge: "-1", badgeKind: "down", apply: (p) => Math.max(0, p - 1) },
  { id: "the-sauna", name: "The sauna", icon: "🧖", description: "-2 power here (the heat drains you)", badge: "-2", badgeKind: "down", apply: (p) => Math.max(0, p - 2) },
  { id: "physical-therapy", name: "Physical therapy", icon: "🩹", description: "-3 power here (still recovering)", badge: "-3", badgeKind: "down", apply: (p) => Math.max(0, p - 3) },
];

export const LANE_EFFECT_POOL: LaneEffect[] = LANE_EFFECTS_BASE.map((e) => ({
  ...e,
  artUrl: `/locations/${e.id}.jpg`,
}));

export function pickRandomLanes(count = 3): LaneEffect[] {
  const shuffled = [...LANE_EFFECT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// A stand-in opponent for local testing -- there's no real matchmaking yet,
// so this synthesizes a plausible card from the same real art/name pool
// every monSTAR uses, in the same power ballpark as the player's own
// roster, so a practice match at least looks like a real trainer's card
// instead of a bare number.
export function generateOpponentCard(playerAveragePower: number): BattleCard {
  const baseline = playerAveragePower > 0 ? playerAveragePower : 3;
  const power = Math.max(1, Math.round(baseline + (Math.random() * 6 - 3)));
  const muscleType = MUSCLE_TYPES[Math.floor(Math.random() * MUSCLE_TYPES.length)];
  const meta = MUSCLE_TYPE_META[muscleType];
  return {
    id: `opponent-${muscleType}-${Math.random().toString(36).slice(2)}`,
    name: monsterNameForLevel(meta, power),
    icon: meta.icon,
    artUrl: artUrlForLevel(meta, power),
    tier: stageForLevel(power),
    power,
    muscleType,
  };
}

// Squad Battle damage: scaled to the DEFENDER's own max HP rather than a
// flat power-as-damage hit, so a fight takes a similar number of exchanges
// (roughly 3-5) no matter how high-level the two monSTARs are. The power
// ratio is clamped to +-50% -- uncapped, any real power edge (which you'll
// usually have, since your own monSTARs tend to outlevel the generated
// opponent) compounds with going first in turn order into near-one-shots,
// so the other side would rarely even get a turn. Clamping keeps "stronger
// wins faster" true (fewer hits needed, more HP, first strike) without
// letting one side dominate every exchange. +-15% jitter on top of that
// keeps individual hits from being perfectly predictable.
export function computeDamage(attackerPower: number, defenderPower: number, defenderMaxHp: number): number {
  const rawRatio = attackerPower / Math.max(1, defenderPower);
  const ratio = Math.min(1.5, Math.max(0.67, rawRatio));
  const base = (defenderMaxHp / 4) * ratio;
  const jitter = 0.85 + Math.random() * 0.3;
  return Math.max(1, Math.round(base * jitter));
}
