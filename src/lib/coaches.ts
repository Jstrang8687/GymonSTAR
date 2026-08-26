export interface CoachSeed {
  slug: string;
  name: string;
  title: string;
  focus: string;
  description: string;
  icon: string;
}

export const COACHES: CoachSeed[] = [
  {
    slug: "rex-ironjaw",
    name: "Rex \"Ironjaw\" Diesel",
    title: "Powerlifting Coach",
    focus: "Raw strength",
    description:
      "Bench, squat, deadlift, repeat. Rex has never met a plate he didn't want to add.",
    icon: "\u{1F3CB}️",
  },
  {
    slug: "sunny-flex",
    name: "Sunny Flex",
    title: "Bodybuilding Coach",
    focus: "Aesthetics & hypertrophy",
    description: "Mind-muscle connection, controlled tempo, and a pump that never quits.",
    icon: "\u{1F3C6}",
  },
  {
    slug: "marathon-mo",
    name: "Marathon Mo",
    title: "Endurance Coach",
    focus: "Cardio & stamina",
    description: "Mo's never met a hill she didn't sprint up twice.",
    icon: "\u{1F3C3}",
  },
  {
    slug: "zen-steele",
    name: "Zen Steele",
    title: "Mobility Coach",
    focus: "Core, balance & recovery",
    description: "Slow is smooth, smooth is strong. Zen keeps your core honest.",
    icon: "\u{1F9D8}",
  },
  {
    slug: "coach-vertex",
    name: "Coach Vertex",
    title: "Calisthenics Coach",
    focus: "Bodyweight mastery",
    description: "No gym, no problem. Vertex builds monSTARs out of thin air.",
    icon: "\u{1F938}",
  },
];
