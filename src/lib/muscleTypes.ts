export const MUSCLE_REGIONS = [
  "Chest",
  "Shoulders",
  "Back",
  "Arms",
  "Core",
  "Neck",
  "Legs",
  "Cardio",
] as const;

export type MuscleRegion = (typeof MUSCLE_REGIONS)[number];

export const MUSCLE_TYPES = [
  "CHEST",
  "SIDE_DELTS",
  "FRONT_DELTS",
  "REAR_DELTS",
  "ROTATOR_CUFF",
  "LATS",
  "UPPER_TRAPS",
  "LOWER_TRAPS",
  "RHOMBOIDS",
  "LOWER_BACK",
  "BICEPS",
  "TRICEPS",
  "FOREARM_FLEXORS",
  "FOREARM_EXTENSORS",
  "GRIP",
  "UPPER_ABS",
  "LOWER_ABS",
  "OBLIQUES",
  "DEEP_CORE",
  "SERRATUS",
  "NECK_FLEXORS",
  "NECK_EXTENSORS",
  "OUTER_QUADS",
  "INNER_QUADS",
  "HAMSTRINGS",
  "GLUTE_MAX",
  "GLUTE_MED",
  "ADDUCTORS",
  "ABDUCTORS",
  "HIP_FLEXORS",
  "CALVES_GASTROC",
  "CALVES_SOLEUS",
  "TIBIALIS",
  "CARDIO",
] as const;

export type MuscleType = (typeof MUSCLE_TYPES)[number];

export type EvolutionTier = 1 | 2 | 3;

interface MuscleTypeMeta {
  label: string;
  region: MuscleRegion;
  icon: string;
  color: string;
  ring: string;
  bg: string;
  /** Evolution-stage names, base -> evolved -> ultimate. See stageForLevel(). */
  stageNames: readonly [string, string, string];
  /** Real character art per evolution tier, for whichever tiers we have it. Falls back to icon. */
  artUrls?: Partial<Record<EvolutionTier, string>>;
}

export const MUSCLE_TYPE_META: Record<MuscleType, MuscleTypeMeta> = {
  CHEST: {
    label: "Chest",
    region: "Chest",
    icon: "\u{1F6E1}️",
    color: "#f97316",
    ring: "ring-orange-400",
    bg: "from-orange-500 to-orange-700",
    stageNames: ["Pecsaur", "Pecsaurus", "Pecs Rex"],
    artUrls: { 1: "/monstars/chest.png", 2: "/monstars/chest_2.png", 3: "/monstars/chest_3.png" },
  },
  SIDE_DELTS: {
    label: "Side Delts",
    region: "Shoulders",
    icon: "⛰️",
    color: "#38bdf8",
    ring: "ring-sky-400",
    bg: "from-sky-500 to-sky-700",
    stageNames: ["Deltoid", "Deltowyrm", "Deltoid Colossus"],
    artUrls: { 1: "/monstars/side_delts.png", 2: "/monstars/side_delts_2.png", 3: "/monstars/side_delts_3.png" },
  },
  FRONT_DELTS: {
    label: "Front Delts",
    region: "Shoulders",
    icon: "\u{1F985}",
    color: "#6366f1",
    ring: "ring-indigo-400",
    bg: "from-indigo-500 to-indigo-700",
    stageNames: ["Deltalope", "Deltalope Alpha", "Front Vanguard"],
    artUrls: { 1: "/monstars/front_delts.png", 2: "/monstars/front_delts_2.png", 3: "/monstars/front_delts_3.png" },
  },
  REAR_DELTS: {
    label: "Rear Delts",
    region: "Shoulders",
    icon: "\u{1F989}",
    color: "#8b5cf6",
    ring: "ring-violet-400",
    bg: "from-violet-500 to-violet-700",
    stageNames: ["Deltback", "Deltback Warden", "Rear Sentinel"],
    artUrls: { 1: "/monstars/rear_delts.png", 2: "/monstars/rear_delts_2.png", 3: "/monstars/rear_delts_3.png" },
  },
  ROTATOR_CUFF: {
    label: "Rotator Cuff",
    region: "Shoulders",
    icon: "\u{1F300}",
    color: "#06b6d4",
    ring: "ring-cyan-400",
    bg: "from-cyan-500 to-cyan-700",
    stageNames: ["Cuffling", "Cuffwing", "Rotor Juggernaut"],
    artUrls: { 1: "/monstars/rotator_cuff.png", 2: "/monstars/rotator_cuff_2.png", 3: "/monstars/rotator_cuff_3.png" },
  },
  LATS: {
    label: "Lats",
    region: "Back",
    icon: "\u{1F409}",
    color: "#22c55e",
    ring: "ring-green-400",
    bg: "from-green-500 to-green-700",
    stageNames: ["Latragon", "Wyverack", "Latitan"],
    artUrls: { 1: "/monstars/back.png", 2: "/monstars/back_2.png", 3: "/monstars/back_3.png" },
  },
  UPPER_TRAPS: {
    label: "Upper Traps",
    region: "Back",
    icon: "\u{1F3D4}️",
    color: "#10b981",
    ring: "ring-emerald-400",
    bg: "from-emerald-500 to-emerald-700",
    stageNames: ["Trapzor", "Trapzorath", "Trap Colossus"],
    artUrls: { 1: "/monstars/upper_traps.png", 2: "/monstars/upper_traps_2.png", 3: "/monstars/upper_traps_3.png" },
  },
  LOWER_TRAPS: {
    label: "Mid/Lower Traps",
    region: "Back",
    icon: "\u{1F332}",
    color: "#84cc16",
    ring: "ring-lime-400",
    bg: "from-lime-500 to-lime-700",
    stageNames: ["Trapling", "Trapdrake", "Trap Sovereign"],
    artUrls: { 1: "/monstars/lower_traps.png", 2: "/monstars/lower_traps_2.png", 3: "/monstars/lower_traps_3.png" },
  },
  RHOMBOIDS: {
    label: "Rhomboids",
    region: "Back",
    icon: "\u{1F536}",
    color: "#f59e0b",
    ring: "ring-amber-400",
    bg: "from-amber-500 to-amber-700",
    stageNames: ["Rhombite", "Rhomboar", "Rhombus Warlord"],
    artUrls: { 1: "/monstars/rhomboids.png", 2: "/monstars/rhomboids_2.png", 3: "/monstars/rhomboids_3.png" },
  },
  LOWER_BACK: {
    label: "Lower Back",
    region: "Back",
    icon: "\u{1FAA8}",
    color: "#78716c",
    ring: "ring-stone-400",
    bg: "from-stone-500 to-stone-700",
    stageNames: ["Erectling", "Erectowyrm", "Spine Ancient"],
    artUrls: { 1: "/monstars/lower_back.png", 2: "/monstars/lower_back_2.png", 3: "/monstars/lower_back_3.png" },
  },
  BICEPS: {
    label: "Biceps",
    region: "Arms",
    icon: "\u{1F4AA}",
    color: "#a855f7",
    ring: "ring-purple-400",
    bg: "from-purple-500 to-purple-700",
    stageNames: ["Bicepsion", "Bicepticore", "Bicep Titan"],
    artUrls: { 1: "/monstars/biceps.png", 2: "/monstars/biceps_2.png", 3: "/monstars/biceps_3.png" },
  },
  TRICEPS: {
    label: "Triceps",
    region: "Arms",
    icon: "\u{1F994}",
    color: "#ec4899",
    ring: "ring-pink-400",
    bg: "from-pink-500 to-pink-700",
    stageNames: ["Tricepod", "Tricepodon", "Tri-Titan"],
    artUrls: { 1: "/monstars/triceps.png", 2: "/monstars/triceps_2.png", 3: "/monstars/triceps_3.png" },
  },
  FOREARM_FLEXORS: {
    label: "Forearm Flexors",
    region: "Arms",
    icon: "\u{1F9BE}",
    color: "#3b82f6",
    ring: "ring-blue-400",
    bg: "from-blue-500 to-blue-700",
    stageNames: ["Flexling", "Flexadon", "Flex Champion"],
    artUrls: { 1: "/monstars/forearm_flexors.png", 2: "/monstars/forearm_flexors_2.png", 3: "/monstars/forearm_flexors_3.png" },
  },
  FOREARM_EXTENSORS: {
    label: "Forearm Extensors",
    region: "Arms",
    icon: "\u{1F9BF}",
    color: "#64748b",
    ring: "ring-slate-400",
    bg: "from-slate-500 to-slate-700",
    stageNames: ["Extensor", "Extendrake", "Extension Overlord"],
    artUrls: { 1: "/monstars/forearm_extensors.png", 2: "/monstars/forearm_extensors_2.png", 3: "/monstars/forearm_extensors_3.png" },
  },
  GRIP: {
    label: "Grip",
    region: "Arms",
    icon: "\u{1F980}",
    color: "#d946ef",
    ring: "ring-fuchsia-400",
    bg: "from-fuchsia-500 to-fuchsia-700",
    stageNames: ["Gripling", "Gripzilla", "Grip Behemoth"],
    artUrls: { 1: "/monstars/grip.png", 2: "/monstars/grip_2.png", 3: "/monstars/grip_3.png" },
  },
  UPPER_ABS: {
    label: "Upper Abs",
    region: "Core",
    icon: "\u{1F4A0}",
    color: "#14b8a6",
    ring: "ring-teal-400",
    bg: "from-teal-500 to-teal-700",
    stageNames: ["Abdomite", "Abdomitor", "Core Colossus"],
    artUrls: { 1: "/monstars/upper_abs.png", 2: "/monstars/upper_abs_2.png", 3: "/monstars/upper_abs_3.png" },
  },
  LOWER_ABS: {
    label: "Lower Abs",
    region: "Core",
    icon: "\u{1F40A}",
    color: "#ca8a04",
    ring: "ring-yellow-600",
    bg: "from-yellow-600 to-yellow-800",
    stageNames: ["Loweret", "Loweraptor", "Lower Core Sentinel"],
    artUrls: { 1: "/monstars/lower_abs.png", 2: "/monstars/lower_abs_2.png", 3: "/monstars/lower_abs_3.png" },
  },
  OBLIQUES: {
    label: "Obliques",
    region: "Core",
    icon: "\u{1F40D}",
    color: "#7c3aed",
    ring: "ring-violet-600",
    bg: "from-violet-600 to-violet-800",
    stageNames: ["Obliquid", "Obliquake", "Oblique Serpent"],
    artUrls: { 1: "/monstars/obliques.png", 2: "/monstars/obliques_2.png", 3: "/monstars/obliques_3.png" },
  },
  DEEP_CORE: {
    label: "Deep Core",
    region: "Core",
    icon: "⚙️",
    color: "#475569",
    ring: "ring-slate-600",
    bg: "from-slate-600 to-slate-800",
    stageNames: ["Coreling", "Coredrake", "Deep Core Warden"],
    artUrls: { 1: "/monstars/deep_core.png", 2: "/monstars/deep_core_2.png", 3: "/monstars/deep_core_3.png" },
  },
  SERRATUS: {
    label: "Serratus Anterior",
    region: "Core",
    icon: "\u{1F94A}",
    color: "#ea580c",
    ring: "ring-orange-600",
    bg: "from-orange-600 to-orange-800",
    stageNames: ["Serratooth", "Serratosaur", "Serratus Rex"],
    artUrls: { 1: "/monstars/serratus.png", 2: "/monstars/serratus_2.png", 3: "/monstars/serratus_3.png" },
  },
  NECK_FLEXORS: {
    label: "Neck Flexors",
    region: "Neck",
    icon: "\u{1F992}",
    color: "#f472b6",
    ring: "ring-pink-400",
    bg: "from-pink-400 to-pink-600",
    stageNames: ["Necklet", "Neckadon", "Neck Vanguard"],
    artUrls: { 1: "/monstars/neck_flexors.png", 2: "/monstars/neck_flexors_2.png", 3: "/monstars/neck_flexors_3.png" },
  },
  NECK_EXTENSORS: {
    label: "Neck Extensors",
    region: "Neck",
    icon: "\u{1F9A9}",
    color: "#2dd4bf",
    ring: "ring-teal-400",
    bg: "from-teal-400 to-teal-600",
    stageNames: ["Napeling", "Napedrake", "Nape Sentinel"],
    artUrls: { 1: "/monstars/neck_extensors.png", 2: "/monstars/neck_extensors_2.png", 3: "/monstars/neck_extensors_3.png" },
  },
  OUTER_QUADS: {
    label: "Outer Quads",
    region: "Legs",
    icon: "\u{1F98C}",
    color: "#eab308",
    ring: "ring-yellow-400",
    bg: "from-yellow-500 to-yellow-700",
    stageNames: ["Quadrilla", "Quadzilla", "Quadragon"],
    artUrls: { 1: "/monstars/outer_quads.png", 2: "/monstars/outer_quads_2.png", 3: "/monstars/outer_quads_3.png" },
  },
  INNER_QUADS: {
    label: "Inner Quads",
    region: "Legs",
    icon: "\u{1F410}",
    color: "#facc15",
    ring: "ring-yellow-300",
    bg: "from-yellow-400 to-yellow-600",
    stageNames: ["Teardroplet", "Teardropzilla", "Teardrop Prime"],
    artUrls: { 1: "/monstars/inner_quads.png", 2: "/monstars/inner_quads_2.png", 3: "/monstars/inner_quads_3.png" },
  },
  HAMSTRINGS: {
    label: "Hamstrings",
    region: "Legs",
    icon: "\u{1F40E}",
    color: "#dc2626",
    ring: "ring-red-600",
    bg: "from-red-600 to-red-800",
    stageNames: ["Hamstrix", "Hamstryx", "Hamstring Juggernaut"],
    artUrls: { 1: "/monstars/hamstrings.png", 2: "/monstars/hamstrings_2.png", 3: "/monstars/hamstrings_3.png" },
  },
  GLUTE_MAX: {
    label: "Glute Max",
    region: "Legs",
    icon: "\u{1F406}",
    color: "#f43f5e",
    ring: "ring-rose-400",
    bg: "from-rose-500 to-rose-700",
    stageNames: ["Glutox", "Glutoxus", "Glute Behemoth"],
    artUrls: { 1: "/monstars/glute_max.png", 2: "/monstars/glute_max_2.png", 3: "/monstars/glute_max_3.png" },
  },
  GLUTE_MED: {
    label: "Glute Med/Min",
    region: "Legs",
    icon: "\u{1F998}",
    color: "#fb7185",
    ring: "ring-rose-300",
    bg: "from-rose-400 to-rose-600",
    stageNames: ["Glutelet", "Glutewing", "Glute Guardian"],
    artUrls: { 1: "/monstars/glute_med.png", 2: "/monstars/glute_med_2.png", 3: "/monstars/glute_med_3.png" },
  },
  ADDUCTORS: {
    label: "Adductors",
    region: "Legs",
    icon: "\u{1F98B}",
    color: "#c084fc",
    ring: "ring-purple-400",
    bg: "from-purple-400 to-purple-600",
    stageNames: ["Adductrix", "Adductorath", "Adductor Titan"],
    artUrls: { 1: "/monstars/adductors.png", 2: "/monstars/adductors_2.png", 3: "/monstars/adductors_3.png" },
  },
  ABDUCTORS: {
    label: "Abductors",
    region: "Legs",
    icon: "\u{1F42B}",
    color: "#a78bfa",
    ring: "ring-violet-400",
    bg: "from-violet-400 to-violet-600",
    stageNames: ["Abductrix", "Abductorath", "Abductor Warlord"],
    artUrls: { 1: "/monstars/abductors.png", 2: "/monstars/abductors_2.png", 3: "/monstars/abductors_3.png" },
  },
  HIP_FLEXORS: {
    label: "Hip Flexors",
    region: "Legs",
    icon: "\u{1F407}",
    color: "#fbbf24",
    ring: "ring-amber-300",
    bg: "from-amber-400 to-amber-600",
    stageNames: ["Flexoraptor", "Flexoraptor Alpha", "Hip Juggernaut"],
    artUrls: { 1: "/monstars/hip_flexors.png", 2: "/monstars/hip_flexors_2.png", 3: "/monstars/hip_flexors_3.png" },
  },
  CALVES_GASTROC: {
    label: "Calves (Gastroc)",
    region: "Legs",
    icon: "\u{1F9B5}",
    color: "#4ade80",
    ring: "ring-green-300",
    bg: "from-green-400 to-green-600",
    stageNames: ["Gastroc", "Gastrocorn", "Gastro Behemoth"],
    artUrls: { 1: "/monstars/calves_gastroc.png", 2: "/monstars/calves_gastroc_2.png", 3: "/monstars/calves_gastroc_3.png" },
  },
  CALVES_SOLEUS: {
    label: "Calves (Soleus)",
    region: "Legs",
    icon: "\u{1F422}",
    color: "#22d3ee",
    ring: "ring-cyan-300",
    bg: "from-cyan-400 to-cyan-600",
    stageNames: ["Soleon", "Soleodon", "Sole Titan"],
    artUrls: { 1: "/monstars/calves_soleus.png", 2: "/monstars/calves_soleus_2.png", 3: "/monstars/calves_soleus_3.png" },
  },
  TIBIALIS: {
    label: "Tibialis Anterior",
    region: "Legs",
    icon: "\u{1F9B6}",
    color: "#94a3b8",
    ring: "ring-slate-300",
    bg: "from-slate-400 to-slate-600",
    stageNames: ["Tibialet", "Tibialope", "Tibial Warden"],
    artUrls: { 1: "/monstars/tibialis.png", 2: "/monstars/tibialis_2.png", 3: "/monstars/tibialis_3.png" },
  },
  CARDIO: {
    label: "Cardio",
    region: "Cardio",
    icon: "⚡",
    color: "#ef4444",
    ring: "ring-red-400",
    bg: "from-red-500 to-red-700",
    stageNames: ["Pulsevolt", "Pulsevolt Max", "Cardio Fury"],
    artUrls: { 1: "/monstars/cardio.png", 2: "/monstars/cardio_2.png", 3: "/monstars/cardio_3.png" },
  },
};

export function typesForRegion(region: MuscleRegion): MuscleType[] {
  return MUSCLE_TYPES.filter((t) => MUSCLE_TYPE_META[t].region === region);
}

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

export function artUrlForLevel(meta: MuscleTypeMeta, level: number): string | undefined {
  return meta.artUrls?.[stageForLevel(level)];
}

export const TIER_LABEL: Record<EvolutionTier, string> = {
  1: "Common",
  2: "Rare",
  3: "Legendary",
};

// Maps the 9 old (pre-expansion) muscle-type keys onto the specific new
// sub-muscle each one is closest to, so existing saved data (MonSTAR rows,
// WorkoutLog.muscleTypes, TrainingProgram.schedule) can be remapped 1:1
// instead of losing history when the roster expanded from 9 to 34.
export const LEGACY_MUSCLE_TYPE_MAP: Record<string, MuscleType> = {
  CHEST: "CHEST",
  BACK: "LATS",
  SHOULDERS: "SIDE_DELTS",
  BICEPS: "BICEPS",
  TRICEPS: "TRICEPS",
  QUADS: "OUTER_QUADS",
  HAMSTRINGS_GLUTES: "GLUTE_MAX",
  CORE: "UPPER_ABS",
  CARDIO: "CARDIO",
};
