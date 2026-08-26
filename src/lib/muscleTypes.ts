export const MUSCLE_TYPES = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "QUADS",
  "HAMSTRINGS_GLUTES",
  "CORE",
  "CARDIO",
] as const;

export type MuscleType = (typeof MUSCLE_TYPES)[number];

interface MuscleTypeMeta {
  label: string;
  icon: string;
  color: string;
  ring: string;
  bg: string;
  /** Evolution-stage names, base -> evolved -> ultimate. See stageForLevel(). */
  stageNames: readonly [string, string, string];
}

export const MUSCLE_TYPE_META: Record<MuscleType, MuscleTypeMeta> = {
  CHEST: {
    label: "Chest",
    icon: "\u{1F6E1}️",
    color: "#f97316",
    ring: "ring-orange-400",
    bg: "from-orange-500 to-orange-700",
    stageNames: ["Pecsaur", "Pecsaurus", "Pecs Rex"],
  },
  BACK: {
    label: "Back",
    icon: "\u{1F409}",
    color: "#22c55e",
    ring: "ring-green-400",
    bg: "from-green-500 to-green-700",
    stageNames: ["Latragon", "Wyverack", "Latitan"],
  },
  SHOULDERS: {
    label: "Shoulders",
    icon: "⛰️",
    color: "#38bdf8",
    ring: "ring-sky-400",
    bg: "from-sky-500 to-sky-700",
    stageNames: ["Deltoid", "Deltowyrm", "Deltoid Colossus"],
  },
  BICEPS: {
    label: "Biceps",
    icon: "\u{1F4AA}",
    color: "#a855f7",
    ring: "ring-purple-400",
    bg: "from-purple-500 to-purple-700",
    stageNames: ["Bicepsion", "Bicepticore", "Bicep Titan"],
  },
  TRICEPS: {
    label: "Triceps",
    icon: "\u{1F994}",
    color: "#ec4899",
    ring: "ring-pink-400",
    bg: "from-pink-500 to-pink-700",
    stageNames: ["Tricepod", "Tricepodon", "Tri-Titan"],
  },
  QUADS: {
    label: "Quads",
    icon: "\u{1F98C}",
    color: "#eab308",
    ring: "ring-yellow-400",
    bg: "from-yellow-500 to-yellow-700",
    stageNames: ["Quadrilla", "Quadzilla", "Quadragon"],
  },
  HAMSTRINGS_GLUTES: {
    label: "Hams & Glutes",
    icon: "\u{1F406}",
    color: "#f43f5e",
    ring: "ring-rose-400",
    bg: "from-rose-500 to-rose-700",
    stageNames: ["Glutox", "Glutoxus", "Glute Behemoth"],
  },
  CORE: {
    label: "Core",
    icon: "\u{1F4A0}",
    color: "#14b8a6",
    ring: "ring-teal-400",
    bg: "from-teal-500 to-teal-700",
    stageNames: ["Abdomite", "Abdomitor", "Core Colossus"],
  },
  CARDIO: {
    label: "Cardio",
    icon: "⚡",
    color: "#ef4444",
    ring: "ring-red-400",
    bg: "from-red-500 to-red-700",
    stageNames: ["Pulsevolt", "Pulsevolt Max", "Cardio Fury"],
  },
};

export type EvolutionTier = 1 | 2 | 3;

const TIER_2_LEVEL = 10;
const TIER_3_LEVEL = 25;

export function stageForLevel(level: number): EvolutionTier {
  if (level >= TIER_3_LEVEL) return 3;
  if (level >= TIER_2_LEVEL) return 2;
  return 1;
}

export function monsterNameForLevel(meta: MuscleTypeMeta, level: number): string {
  return meta.stageNames[stageForLevel(level) - 1];
}

export const TIER_LABEL: Record<EvolutionTier, string> = {
  1: "Common",
  2: "Rare",
  3: "Legendary",
};
