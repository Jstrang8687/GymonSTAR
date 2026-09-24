import type { MuscleRegion } from "@/lib/muscleTypes";

// Every muscle region gets a real mechanical trait in Squad Battle, not
// just a flavor name -- a different verb per region (stacking buff,
// lifesteal, damage reduction, multi-hit, debuff, block chance, variance,
// regen) so squad composition actually matters, not just total power.
// The engine (squadBattleEngine.ts) implements each of these; this file is
// the single source of truth for the numbers plus display copy.
export interface RegionTrait {
  name: string;
  description: string;
}

export const REGION_TRAITS: Record<MuscleRegion, RegionTrait> = {
  Chest: {
    name: "Overload",
    description: "Every 3rd attack deals +50% damage.",
  },
  Shoulders: {
    name: "Brace",
    description: "Takes 25% less damage on the next hit after attacking.",
  },
  Back: {
    name: "Drain",
    description: "Heals 25% of the damage it deals.",
  },
  Arms: {
    name: "Flurry",
    description: "Attacks twice per turn at reduced damage each.",
  },
  Core: {
    name: "Stagger",
    description: "Hitting the foe makes their next attack weaker.",
  },
  Neck: {
    name: "Guard",
    description: "20% chance to fully block an incoming hit.",
  },
  Legs: {
    name: "Power Swing",
    description: "Damage varies a lot more per hit -- boom or bust.",
  },
  Cardio: {
    name: "Second Wind",
    description: "Heals a little HP at the start of its own turn.",
  },
};
