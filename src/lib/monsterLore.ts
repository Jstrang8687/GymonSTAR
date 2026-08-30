import type { MuscleType } from "@/lib/muscleTypes";

interface MonsterLore {
  /** A flavor-only named attack, Pokemon/Yu-Gi-Oh card style -- no numeric power, just character. */
  move: string;
  lore: string;
}

export const MONSTER_LORE: Record<MuscleType, MonsterLore> = {
  CHEST: {
    move: "Bench Press Slam",
    lore: "Born in the last open rack of a 24-hour gym, Pecsaur's roar echoes through empty locker rooms at 5am. Legend says it evolved from skipping leg day one too many times — all upper body, zero regrets.",
  },
  SIDE_DELTS: {
    move: "Lateral Raise Storm",
    lore: "Deltoid grows a little wider with every set of raises, until doorframes start apologizing first. It naps standing up so the pump never fully fades.",
  },
  FRONT_DELTS: {
    move: "Front Raise Charge",
    lore: "Deltalope charges shoulder-first into anything in its path, a habit picked up from one too many overhead presses. Mirrors love it; doorways do not.",
  },
  REAR_DELTS: {
    move: "Rear Delt Flyby",
    lore: "Most trainers forget Deltback exists until their posture falls apart. It lives for face pulls and holds a quiet grudge against everyone who skips them.",
  },
  ROTATOR_CUFF: {
    move: "Cuff Spin Cyclone",
    lore: "Small, easily overlooked, and absolutely vital — Cuffling spins band after band of resistance work into quiet, unshakeable stability.",
  },
  LATS: {
    move: "Lat Pulldown Crush",
    lore: "Latragon spreads its wings a little wider with every pull-up, chasing that elusive V-taper one rep at a time. Wide-grip is a personality trait.",
  },
  UPPER_TRAPS: {
    move: "Shrug Slam",
    lore: "Trapzor shrugs off heavy loads like they're nothing, slowly building a neckline that makes turtlenecks obsolete.",
  },
  LOWER_TRAPS: {
    move: "Scap Squeeze",
    lore: "Trapling lives between the shoulder blades, squeezing tighter with every face pull and Y-raise until good posture finally sticks.",
  },
  RHOMBOIDS: {
    move: "Row Rampage",
    lore: "Rhombite grows in the gap between the shoulder blades, one row at a time, until slouching simply stops being an option.",
  },
  LOWER_BACK: {
    move: "Deadlift Drive",
    lore: "Erectling braces against every deadlift like it's the last one on earth, and treats a rounded spine as a personal insult.",
  },
  BICEPS: {
    move: "Curl Combo",
    lore: "Bicepsion flexes reflexively at any reflective surface — windows, spoons, phone screens — and has never once regretted it.",
  },
  TRICEPS: {
    move: "Pushdown Punch",
    lore: "Tricepod quietly does two-thirds of the work every time someone flexes their arm, then lets the biceps take the photo credit.",
  },
  FOREARM_FLEXORS: {
    move: "Wrist Curl Whip",
    lore: "Flexling trains grip and forearm alike in secret, waiting for the day someone finally notices its veins before its biceps.",
  },
  FOREARM_EXTENSORS: {
    move: "Reverse Curl Snap",
    lore: "Extensor keeps the forearm balanced against every curl its neighbor does, quietly preventing tennis elbow one reverse curl at a time.",
  },
  GRIP: {
    move: "Vice Grip Crush",
    lore: "Gripling has crushed more jar lids than the gym has plates. It considers a handshake a light warm-up.",
  },
  UPPER_ABS: {
    move: "Crunch Combo",
    lore: "Abdomite surfaces slowly, crunch by crunch, chasing a six-pack it insists is 'in progress, not lost.'",
  },
  LOWER_ABS: {
    move: "Leg Raise Lash",
    lore: "Loweret hangs from any bar it can find, raising its legs long after everyone else has quit, purely out of spite.",
  },
  OBLIQUES: {
    move: "Twist Strike",
    lore: "Obliquid coils tighter with every wood chop and Russian twist, waiting to strike anyone who skips core day for the third week running.",
  },
  DEEP_CORE: {
    move: "Plank Pulse",
    lore: "Coreling doesn't move much — it just holds, plank after plank, silently outlasting everyone who thought thirty seconds sounded easy.",
  },
  SERRATUS: {
    move: "Pushup Plus",
    lore: "Serratooth ripples along the ribs during every pushup-plus, proof that even the sneakiest muscles show up eventually.",
  },
  NECK_FLEXORS: {
    move: "Neck Curl Snap",
    lore: "Necklet trains in secret with a light plate and a towel, dreaming of a neck that finally matches the traps above it.",
  },
  NECK_EXTENSORS: {
    move: "Neck Bridge Slam",
    lore: "Napeling holds its head high through every neck bridge, building the kind of neck that makes collars fit a little different.",
  },
  OUTER_QUADS: {
    move: "Squat Stomp",
    lore: "Quadrilla stomps out of the squat rack leg day after leg day, the only monSTAR that actually looks forward to stairs.",
  },
  INNER_QUADS: {
    move: "Leg Extension Blast",
    lore: "Teardroplet forms slowly above the knee through set after set of leg extensions, chasing the elusive teardrop shape by name.",
  },
  HAMSTRINGS: {
    move: "Deadlift Snap",
    lore: "Hamstrix snaps taut with every Romanian deadlift, and remembers every single missed hamstring day for at least a week.",
  },
  GLUTE_MAX: {
    move: "Hip Thrust Slam",
    lore: "Glutox thrusts its way through every hip day, growing steadily louder in both strength and reputation across the gym floor.",
  },
  GLUTE_MED: {
    move: "Clamshell Crush",
    lore: "Glutelet works quietly on the side, one resistance band clamshell at a time, keeping knees stable and hips honest.",
  },
  ADDUCTORS: {
    move: "Inner Thigh Squeeze",
    lore: "Adductrix squeezes the machine shut rep after rep, unbothered by the stares — someone has to train inner thighs.",
  },
  ABDUCTORS: {
    move: "Side Kick Sweep",
    lore: "Abductrix pushes outward against every band and machine it meets, quietly responsible for hips that don't wobble on squat day.",
  },
  HIP_FLEXORS: {
    move: "Knee Drive",
    lore: "Flexoraptor drives its knee high with every sprint and mountain climber, always first off the line and first up the stairs.",
  },
  CALVES_GASTROC: {
    move: "Calf Raise Rocket",
    lore: "Gastroc claims it's 'genetics, not effort' after every single calf raise, despite training harder than almost anything else in the gym.",
  },
  CALVES_SOLEUS: {
    move: "Seated Raise Slam",
    lore: "Soleon trains low and slow on the seated raise machine, building the kind of calf density that only shows up after months, not weeks.",
  },
  TIBIALIS: {
    move: "Toe Raise Tap",
    lore: "Tibialet taps out toe raise after toe raise along the shin, the quiet stabilizer nobody trains until it starts barking back.",
  },
  CARDIO: {
    move: "Sprint Surge",
    lore: "Pulsevolt's heart rate never really comes down, sprint after sprint, mile after mile — pure electric endurance with nowhere to plug in.",
  },
};
