# GymonSTAR monster art — Common (tier 1) image generation script

Redesigned so every monster is a genuinely different creature in a different
setting — no more "same reptilian bodybuilder in a stone dungeon" 32 times.
Each one is themed off the animal/object already on its collection-grid icon
in the app, so the art will actually match what's shown elsewhere in the UI.

Covers all 32 monsters except Chest and Lats, which already have real art
(dinosaur / horned dino-dragon — keep those as they are, don't regenerate).

## How to use this

**Try the batches first, not 32 individual prompts.** Each region section
below is one paste — most image generators (Gemini, Bing) can produce several
distinct images in a single response when told to explicitly. Paste one
region block, see how many images come back:

- If you get all the images in that block at once — great, move to the next region.
- If the tool only gives you one image per message — that's fine too, just
  paste each **individual prompt** underneath the batch block one at a time
  instead. The individual prompts are there as a fallback either way, and are
  also what you want if you need to redo just one monster later.

Save each result under the filename given, into `public/monstars/`.

---

## BATCH 1 — Shoulders (4 images)

> Generate 4 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image — do not combine them into one image or a grid. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Deltoid** (save as `side_delts.png`): a serpentine rock wyrm with sky-blue stone-plated scales, performing a standing side lateral raise with dumbbells, arms out wide. Set on a windswept mountain peak with jagged cliffs and clouds below.
> 2. **Deltalope** (save as `front_delts.png`): a griffin-like eagle-warrior beast with indigo-blue feathers and a sharp eagle head, performing a standing barbell overhead press at full lockout. Set on a sky-high cliffside aerie among floating rock spires.
> 3. **Deltback** (save as `rear_delts.png`): an owl-headed sentinel beast with violet-purple feathers, performing a bent-over rear delt fly with dumbbells winged out behind him. Set on moonlit stone watchtower battlements at night.
> 4. **Cuffling** (save as `rotator_cuff.png`): a small armored pangolin warrior with cyan-teal scaled plates, performing a cable external rotation with his elbow pinned to his side. Set in a rocky sandstone canyon burrow.

---

## BATCH 2 — Back (excluding Lats) (4 images)

> Generate 4 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Trapzor** (save as `upper_traps.png`): a hulking mountain golem made of emerald-green living rock, performing a heavy barbell shrug with his traps peaked toward his ears. Set on a snowy alpine summit with boulders.
> 2. **Trapling** (save as `lower_traps.png`): a small bark-hided drake with lime-green wood-grain scales, performing a cable face pull, elbows high, shoulder blades pinched. Set in a dense misty forest canopy.
> 3. **Rhombite** (save as `rhomboids.png`): a crystal-plated boar beast with amber-gold gem-studded hide, performing a seated cable row at full contraction. Set in a glittering underground crystal cave.
> 4. **Erectling** (save as `lower_back.png`): an ancient stone tortoise-golem with gray-brown weathered rock shell, performing a barbell good morning, hinged forward at the hips. Set among crumbling stone ruins on a canyon floor.

---

## BATCH 3 — Arms (5 images)

> Generate 5 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Bicepsion** (save as `biceps.png`): a royal-purple-furred minotaur with a bull's head and huge horns, performing a standing barbell curl at peak contraction. Set in a sandy gladiator arena.
> 2. **Tricepod** (save as `triceps.png`): a hot-pink spiked hedgehog warrior beast, performing an overhead triceps extension at full lockout. Set in a thorned bramble training yard.
> 3. **Flexling** (save as `forearm_flexors.png`): a bright-blue clockwork golem with visible brass gears in its arm, performing a seated barbell wrist curl, palms up. Set in a steampunk gear-forge workshop.
> 4. **Extensor** (save as `forearm_extensors.png`): a slate-gray clockwork golem with piston-driven mechanical legs, performing a seated reverse wrist curl, palms down. Set in a steam-powered gearworks chamber.
> 5. **Gripling** (save as `grip.png`): a magenta-fuchsia giant crab beast crushing a heavy grip strengthener in one massive claw. Set on a rocky tidepool shoreline at sunset.

---

## BATCH 4 — Core (5 images)

> Generate 5 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Abdomite** (save as `upper_abs.png`): a teal armored beetle warrior with a gem-plated shell, performing a kneeling cable crunch, torso curled forward. Set in an ancient sunlit temple courtyard.
> 2. **Loweret** (save as `lower_abs.png`): an olive-gold alligator beast, performing a hanging leg raise from a bar, knees pulled to his chest. Set in a murky mangrove swamp.
> 3. **Obliquid** (save as `obliques.png`): a deep-violet cobra beast rising on his coiled tail, performing a standing cable woodchop, torso twisted sharply. Set on sun-baked desert dunes.
> 4. **Coreling** (save as `deep_core.png`): a dark slate-gray turtle-golem with a mechanical, gear-lined shell, holding a rigid plank with a weight plate stacked on his back. Set in an underground vault chamber lit by glowing gears.
> 5. **Serratooth** (save as `serratus.png`): a burnt-orange saber-tooth tiger boxer beast, at the top of a wide-grip pull-up, torso twisted. Set in a torch-lit boxing ring.

---

## BATCH 5 — Neck (2 images)

> Generate 2 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Necklet** (save as `neck_flexors.png`): a light-pink-spotted giraffe beast wearing a neck harness, tucking his chin down against resistance. Set on a golden savanna at sunset.
> 2. **Napeling** (save as `neck_extensors.png`): a turquoise flamingo beast wearing a neck harness, pressing his head back against resistance. Set in a misty wetland marsh.

---

## BATCH 6 — Legs, part 1 (6 images)

> Generate 6 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Quadrilla** (save as `outer_quads.png`): a massive golden-yellow-furred elk beast with huge antlers, performing a heavy barbell back squat at full depth. Set in a dense forest clearing.
> 2. **Teardroplet** (save as `inner_quads.png`): a bright-yellow mountain goat beast with curled horns, performing a leg extension at full lockout. Set on a steep rocky cliffside.
> 3. **Hamstrix** (save as `hamstrings.png`): a deep-red centaur-like horse beast, performing a Romanian deadlift, hinged forward with a barbell. Set on an open-plains racetrack.
> 4. **Glutox** (save as `glute_max.png`): a rose-red spotted leopard beast, performing a barbell hip thrust at full lockout. Set on a savanna hunting ground at dusk.
> 5. **Glutelet** (save as `glute_med.png`): a salmon-pink kangaroo beast, performing a standing cable hip abduction, one leg kicked out to the side. Set in a red outback desert.
> 6. **Adductrix** (save as `adductors.png`): a lavender butterfly-fae beast with large iridescent wings, seated in an inner-thigh adductor machine, legs pressing inward. Set in a blooming flower garden.

---

## BATCH 7 — Legs, part 2 (5 images)

> Generate 5 separate, distinct 16-bit SNES-style pixel-art RPG monster portraits, one per creature below. Each is its own standalone image. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic gym-exercise pose, no text or watermark.
>
> 1. **Abductrix** (save as `abductors.png`): a soft-violet camel beast, seated in an outer-thigh abductor machine, legs pressing outward. Set on golden desert dunes.
> 2. **Flexoraptor** (save as `hip_flexors.png`): a golden-amber rabbit beast, caught mid-sprint driving one knee high toward his chest. Set in a green meadow sprint track.
> 3. **Gastroc** (save as `calves_gastroc.png`): a bright-green frog beast with powerful hind legs, performing a standing calf raise on a raised block, up on his toes. Set in a lily-padded swamp pond.
> 4. **Soleon** (save as `calves_soleus.png`): a cyan turtle beast, seated in a bent-knee calf raise machine, up on his toes. Set on a quiet riverbank.
> 5. **Tibialet** (save as `tibialis.png`): a pale slate-blue heron beast with long thin legs, seated and pulling his toes up against a resistance band. Set in reedy marshland at dawn.

---

## BATCH 8 — Cardio (1 image)

> Generate one 16-bit SNES-style pixel-art RPG monster portrait. Shared style: chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients, vibrant saturated colors, square-ish framing, character centered and filling most of the frame, dynamic pose, no text or watermark.
>
> **Pulsevolt** (save as `cardio.png`): a bright-red electric eel beast crackling with lightning-bolt energy patterns along its body, caught mid-sprint in a dynamic full-speed running pose with a glowing electric aura trailing behind. Set in a storm-charged coliseum with lightning striking in the background.

---

## Individual fallback prompts

Use these one at a time if a batch didn't come back as separate images, or to
redo a single monster later. Same style rules as above on each.

### side_delts.png — Deltoid
16-bit SNES-style pixel art RPG monster portrait of Deltoid, a serpentine rock wyrm with sky-blue stone-plated scales, performing a standing side lateral raise with dumbbells, arms out wide. Set on a windswept mountain peak with jagged cliffs and clouds below. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### front_delts.png — Deltalope
16-bit SNES-style pixel art RPG monster portrait of Deltalope, a griffin-like eagle-warrior beast with indigo-blue feathers and a sharp eagle head, performing a standing barbell overhead press at full lockout. Set on a sky-high cliffside aerie among floating rock spires. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### rear_delts.png — Deltback
16-bit SNES-style pixel art RPG monster portrait of Deltback, an owl-headed sentinel beast with violet-purple feathers, performing a bent-over rear delt fly with dumbbells winged out behind him. Set on moonlit stone watchtower battlements at night. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### rotator_cuff.png — Cuffling
16-bit SNES-style pixel art RPG monster portrait of Cuffling, a small armored pangolin warrior with cyan-teal scaled plates, performing a cable external rotation with his elbow pinned to his side. Set in a rocky sandstone canyon burrow. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### upper_traps.png — Trapzor
16-bit SNES-style pixel art RPG monster portrait of Trapzor, a hulking mountain golem made of emerald-green living rock, performing a heavy barbell shrug with his traps peaked toward his ears. Set on a snowy alpine summit with boulders. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### lower_traps.png — Trapling
16-bit SNES-style pixel art RPG monster portrait of Trapling, a small bark-hided drake with lime-green wood-grain scales, performing a cable face pull, elbows high, shoulder blades pinched. Set in a dense misty forest canopy. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### rhomboids.png — Rhombite
16-bit SNES-style pixel art RPG monster portrait of Rhombite, a crystal-plated boar beast with amber-gold gem-studded hide, performing a seated cable row at full contraction. Set in a glittering underground crystal cave. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### lower_back.png — Erectling
16-bit SNES-style pixel art RPG monster portrait of Erectling, an ancient stone tortoise-golem with a gray-brown weathered rock shell, performing a barbell good morning, hinged forward at the hips. Set among crumbling stone ruins on a canyon floor. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### biceps.png — Bicepsion
16-bit SNES-style pixel art RPG monster portrait of Bicepsion, a royal-purple-furred minotaur with a bull's head and huge horns, performing a standing barbell curl at peak contraction. Set in a sandy gladiator arena. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### triceps.png — Tricepod
16-bit SNES-style pixel art RPG monster portrait of Tricepod, a hot-pink spiked hedgehog warrior beast, performing an overhead triceps extension at full lockout. Set in a thorned bramble training yard. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### forearm_flexors.png — Flexling
16-bit SNES-style pixel art RPG monster portrait of Flexling, a bright-blue clockwork golem with visible brass gears in its arm, performing a seated barbell wrist curl, palms up. Set in a steampunk gear-forge workshop. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### forearm_extensors.png — Extensor
16-bit SNES-style pixel art RPG monster portrait of Extensor, a slate-gray clockwork golem with piston-driven mechanical legs, performing a seated reverse wrist curl, palms down. Set in a steam-powered gearworks chamber. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### grip.png — Gripling
16-bit SNES-style pixel art RPG monster portrait of Gripling, a magenta-fuchsia giant crab beast crushing a heavy grip strengthener in one massive claw. Set on a rocky tidepool shoreline at sunset. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### upper_abs.png — Abdomite
16-bit SNES-style pixel art RPG monster portrait of Abdomite, a teal armored beetle warrior with a gem-plated shell, performing a kneeling cable crunch, torso curled forward. Set in an ancient sunlit temple courtyard. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### lower_abs.png — Loweret
16-bit SNES-style pixel art RPG monster portrait of Loweret, an olive-gold alligator beast, performing a hanging leg raise from a bar, knees pulled to his chest. Set in a murky mangrove swamp. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### obliques.png — Obliquid
16-bit SNES-style pixel art RPG monster portrait of Obliquid, a deep-violet cobra beast rising on his coiled tail, performing a standing cable woodchop, torso twisted sharply. Set on sun-baked desert dunes. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### deep_core.png — Coreling
16-bit SNES-style pixel art RPG monster portrait of Coreling, a dark slate-gray turtle-golem with a mechanical, gear-lined shell, holding a rigid plank with a weight plate stacked on his back. Set in an underground vault chamber lit by glowing gears. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### serratus.png — Serratooth
16-bit SNES-style pixel art RPG monster portrait of Serratooth, a burnt-orange saber-tooth tiger boxer beast, at the top of a wide-grip pull-up, torso twisted. Set in a torch-lit boxing ring. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### neck_flexors.png — Necklet
16-bit SNES-style pixel art RPG monster portrait of Necklet, a light-pink-spotted giraffe beast wearing a neck harness, tucking his chin down against resistance. Set on a golden savanna at sunset. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### neck_extensors.png — Napeling
16-bit SNES-style pixel art RPG monster portrait of Napeling, a turquoise flamingo beast wearing a neck harness, pressing his head back against resistance. Set in a misty wetland marsh. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### outer_quads.png — Quadrilla
16-bit SNES-style pixel art RPG monster portrait of Quadrilla, a massive golden-yellow-furred elk beast with huge antlers, performing a heavy barbell back squat at full depth. Set in a dense forest clearing. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### inner_quads.png — Teardroplet
16-bit SNES-style pixel art RPG monster portrait of Teardroplet, a bright-yellow mountain goat beast with curled horns, performing a leg extension at full lockout. Set on a steep rocky cliffside. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### hamstrings.png — Hamstrix
16-bit SNES-style pixel art RPG monster portrait of Hamstrix, a deep-red centaur-like horse beast, performing a Romanian deadlift, hinged forward with a barbell. Set on an open-plains racetrack. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### glute_max.png — Glutox
16-bit SNES-style pixel art RPG monster portrait of Glutox, a rose-red spotted leopard beast, performing a barbell hip thrust at full lockout. Set on a savanna hunting ground at dusk. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### glute_med.png — Glutelet
16-bit SNES-style pixel art RPG monster portrait of Glutelet, a salmon-pink kangaroo beast, performing a standing cable hip abduction, one leg kicked out to the side. Set in a red outback desert. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### adductors.png — Adductrix
16-bit SNES-style pixel art RPG monster portrait of Adductrix, a lavender butterfly-fae beast with large iridescent wings, seated in an inner-thigh adductor machine, legs pressing inward. Set in a blooming flower garden. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### abductors.png — Abductrix
16-bit SNES-style pixel art RPG monster portrait of Abductrix, a soft-violet camel beast, seated in an outer-thigh abductor machine, legs pressing outward. Set on golden desert dunes. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### hip_flexors.png — Flexoraptor
16-bit SNES-style pixel art RPG monster portrait of Flexoraptor, a golden-amber rabbit beast, caught mid-sprint driving one knee high toward his chest. Set in a green meadow sprint track. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic explosive pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### calves_gastroc.png — Gastroc
16-bit SNES-style pixel art RPG monster portrait of Gastroc, a bright-green frog beast with powerful hind legs, performing a standing calf raise on a raised block, up on his toes. Set in a lily-padded swamp pond. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### calves_soleus.png — Soleon
16-bit SNES-style pixel art RPG monster portrait of Soleon, a cyan turtle beast, seated in a bent-knee calf raise machine, up on his toes. Set on a quiet riverbank. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### tibialis.png — Tibialet
16-bit SNES-style pixel art RPG monster portrait of Tibialet, a pale slate-blue heron beast with long thin legs, seated and pulling his toes up against a resistance band. Set in reedy marshland at dawn. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.

### cardio.png — Pulsevolt
16-bit SNES-style pixel art RPG monster portrait of Pulsevolt, a bright-red electric eel beast crackling with lightning-bolt energy patterns along its body, caught mid-sprint in a dynamic full-speed running pose with a glowing electric aura trailing behind. Set in a storm-charged coliseum with lightning striking in the background. Chunky pixel shading, thick dark outlines, hard pixel edges, no blur or smooth gradients. Vibrant saturated colors. Square-ish framing, character centered and filling most of the frame, dynamic explosive pose. Single standalone image — no sprite sheet, no grid, no text, no watermark.
