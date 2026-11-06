# KAGE anime redesign: style guide

One page for tickets 02 to 12. The reference material sits next to this file:

| Folder | What it holds |
|---|---|
| `sheets/slash-single.webp` | Kage against the fox-masked Order samurai, full size. The clearest read of both designs. The white card in Kage's hand is an artefact of the generated image; ignore it. |
| `sheets/techniques-9-panel.webp` | Guard, Parry, Counter, Combo, Air Launch, Follow Up, Shadow Step, Finisher, Idle / Ready. |
| `sheets/dash-slash-aerial-burst-4-panel.webp` | Dash, Slash, Aerial Slash, Kage Burst. |
| `video-frames/01..12-*.webp` | 12 key frames from the 10 s reference clip: idle stance, slash, parry, two combo frames, air launch, aerial slash, Shadow Step, Kage Burst, the finisher cut and its aftermath, and the end idle. |
| `boss-art/boss_*.webp`, `boss-art/face_*.webp` | The existing boss key art (Raikon, Akari, Takashi, the Witness) and the dialogue portraits (those four plus Rem). These are copies; the game still loads them from `src/img/`. |

The references set the character look only. The red sun, the HUD, the tutorial cards, the slash arcs, sparks and kanji are already in the game or belong to VFX. Do not copy them into character art, and do not change the game's own versions.

## The rule

**Black face + white eyes + detailed dark samurai clothing.** Every character, enemies included, has a flat black face with two softly glowing white eyes and no nose or mouth. Each is dressed in layered charcoal and black fabric with dark metal armour, crimson embroidery, muted-silver weapon detail and a fine red rim light. Draw them as cel-shaded vector parts on the existing skeleton (`Fighter.sk`), not with the stickman primitives.

## Palette tokens

Values were pulled down in the ticket 02 polish pass: figures read near-black with a narrow separation tone; layers separate by shadow strips, fine dark seams and a thin crimson rim, not by mid-grey cloth.

Add these as one table in the renderer, for example `ANIME` in `20-fighter.js`. Use the tokens, not raw hex, so the family tints below stay in one place.

| Token | Hex | Use |
|---|---|---|
| `face` | `#050404` | Faces and the darkest silhouette mass. Darker than any cloth so the eyes read. |
| `cloth0` | `#060505` | Shadow tone of black fabric |
| `cloth1` | `#0d0b0b` | Base black fabric (coat, hakama) |
| `cloth2` | `#1b1817` | Lit fold or highlight tone of black fabric |
| `char0` | `#0d0c0e` | Shadow tone of charcoal fabric (Kage's coat, Order under-robes) |
| `char1` | `#161518` | Base charcoal fabric |
| `char2` | `#252329` | Charcoal highlight |
| `metal0` | `#09090b` | Shadow tone of dark armour plates (do, sode, kote, suneate) |
| `metal1` | `#141518` | Base armour metal |
| `metal2` | `#2c2f35` | Armour highlight edge, one thin band per plate |
| `crimson` | `#7e161b` | Embroidery, armour lacing (odoshi), the inner coat lining |
| `crimsonHi` | `#b02a31` | Embroidery highlights; Kage's scarf base |
| `scarf` | `#c8343a` | Kage's scarf lit side (matches `C.emberBright` closely; reuse that if it reads) |
| `silver` | `#9a9ea4` | Blade flats, tsuba, habaki, kashira, buckles: a muted silver, never pure white |
| `silverHi` | `#d6d9dd` | One edge line on a blade only |
| `rim` | `rgba(168,30,36,0.55)` | The thin crimson rim inside a part (celFill), on the side away from the camera light. The silhouette rim of the outline pass is the stage's rim colour deepened toward crimson (`animeRimColor`), about 1.1 px at scale 1, on the back and top edges only |
| `eye` | `#f4f1ea` | Eye fill |
| `eyeGlow` | `rgba(244,241,234,0.35)` | Eye halo, about 2.5× the eye's size, additive |
| `outline` | `#030303` | Ink outline (the game's `C.ink`) |

Family accents stay as they are and replace `crimson` only where the design calls for it: Hollow violet (`ENEMY_FAMILIES.hollow`), Akari violet `#b48ae6`, Takashi gold `#e8c25c`, the Witness violet `#a77bff` with crimson veins, and Raikon's red.

## Line weight and outline

- The silhouette carries the design. Draw an outer ink outline of about 1.5 px at scale 1 (`1.5 * f.scale` world px, near-black `C.ink`) around the whole figure. The existing outline pass (`OUTLINE_DIRS`, 12-direction offset) already does this and must keep working on the new body.
- Interior lines are thinner, about 1 px, in `outline` or `cloth0`. Use them for fold lines, plate seams, sleeve openings and the hakama pleats. Draw no interior line that does not describe a fold, seam or edge.
- Rim light is a separate thin stroke in `rim`, on the back edge of the head, shoulders, arms and coat hem only. It is the "fine red rim light" of the rule. Do not outline the whole figure in red.
- Embroidery is a pattern, not a line drawing. Use filled crimson shapes such as waves, clouds and asanoha triangles along the coat hem and cuffs, clipped to the cloth panel.

## Cel shading

- Use **two tones per material**: base and shadow. Add a **third tone** only for a lit fold or a plate highlight. Never use gradients. The game flattens gradients into steps anyway (`flatGradients` in `00-core.js`), and characters should not rely on that.
- Light comes from the upper front, the `light` option `Fighter.draw` already gets (`{x: 0.5..0.6, y: -0.8..-0.86}`). The shadow tone sits on the far side of each limb and under the coat's overlaps.
- Flat passes have to stay flat. The impact frame (`opt.color`), the flash, the memory filter and the Hollow glitch draw the figure in one colour, and the new parts must honour `opt.color` and the `flat` path exactly like `silhouette()` does today.

## Proportions

Keep the existing skeleton (`BODY` in `20-fighter.js`); the art dresses it.

- **Kage**: a head about **1/6.5 of standing height**. The skeleton's head radius (`BODY.head` 18) reads larger once the spiky hair is on, so draw the face about 0.9 of that radius and let the hair carry the volume. Shoulders are narrow and the long coat makes the lower half read longer, as in `slash-single`.
- **Order samurai**: the same height as Kage, broader at the shoulder from the sode, and a smaller-reading head under the helmet. The fox mask adds height through its ears, not through the body.
- **Bosses**: the same rig at their build scale. Raikon and Takashi read top-heavy (wide jingasa or kasa about 3× head width, fur mantle or cape). Akari is slimmer, about 1/7 head, with long legs. The Witness is the tallest read, with its crown adding about half a head.
- Hands are mitten-shaped grips around the weapon handle (fingers implied by one line). Feet are boots or waraji with a clear sole, never round caps.

## Face and eyes

- The face is a flat `face` shape that follows the head. Draw no nose, no mouth and no skin tone.
- Draw two eyes: short, sharp, slightly upswept almond strokes about 0.28 head-radius wide, set at 45% of head height. They glow white (`eye` plus an `eyeGlow` halo). Narrow them while attacking, as in the references' slash frames. Keep `opt.noEyes` and per-fighter `f.eye` working: a clone or decoy sets the eye to transparent.
- **Raikon exception, resolved by the rule:** his key art has red eyes. Draw his eyes white like everyone else's, and add a faint red rim light around the eye sockets and the jingasa brim.
- Masks (the fox, oni, Witness, Akari's half-mask) cover the face shape. The eyes still show white through the eye holes.

## Character notes

**Kage (ticket 02).** The `slash-single`, `techniques-9-panel` and `video-frames/12-idle-end` references show him.
- Wild, spiky black hair in long swept points, sweeping back and up. It is a bigger, sharper mass than the current `HERO_HAIR`.
- A red scarf around the neck, with two long tails streaming back. It replaces the white face-wrap tail as his signature cloth, using the existing cloth system (`Cloth`).
- A long charcoal coat open at the front, split at the back, falling to mid-calf. It has a high collar and a **crimson embroidered hem** (wave or cloud pattern) on its lower quarter and cuffs, and a crimson lining that shows when it flares.
- A dark sash and belt with a silver buckle. Under the coat he wears a dark inner kimono and hakama gathered into **tall dark boots** with straps.
- A katana with a muted-silver blade, a round dark tsuba and a dark wrapped handle, and the saya at his left hip.
- Black face and white eyes. He wears no face-wrap; the current white wrap is retired, and the `shiro_maki` helmet keeps its id but now draws this look.

**Order samurai, fox-masked (ticket 03).** Shown on the left of `slash-single`.
- A white or bone fox mask (kitsune) with tall pointed ears and black eye slits. The white eyes glow through the slits.
- A dark lacquered do with crimson lacing (odoshi), layered sode on the shoulders, a kusazuri skirt of plates over a dark hakama, kote on the forearms, suneate on the shins, and waraji.
- Muted-silver katana. Each type gets its own crest or helmet so the silhouette tells them apart (ticket 03), with the fox mask as the family face.
- As built (ticket 03, `22-anime-order.js`): the masks are dark slate lacquer with crimson kitsune markings, as in `slash-single`, rather than bone, so the faces stay black under the rule. Footman: full fox helm with tall ears. Runner: peaked hood with two long tails and a fox half-mask. Shieldbearer: kabuto with a silver crescent and a tall tate shield. Chainthrower: wide jingasa and a chain bandolier. Ironclad: horned kabuto, heavy dō with a gorget, huge sode.

**Raikon (ticket 08), from `boss_raikon.webp`.**
- A wide black jingasa edged in red, with a tall red flame crest on top and red tassels hanging from the brim.
- A white fur mantle over one shoulder, and a dark armoured coat with a red cloud crest (mitsudomoe-like) on the shoulder plate.
- Red cords cross the chest, with a ring belt (a silver ring at the obi). Dark gauntlets, and a crimson-lit tachi.
- The eyes are white, with a faint red rim (see above).

**Akari (ticket 09), from `boss_akari.webp` and `face_akari.webp`.**
- A long black high ponytail with a violet sheen, a violet sakura ornament at its root and short violet ribbons. Side bangs frame the face.
- A dark half-mask over the lower face, so only the eyes show.
- Fitted black garb with long arm guards and a belt with pouches, and one long violet sash down the front with a sakura crest near its end.
- Twin short blades with violet edge light.

**Takashi (ticket 10), from `boss_takashi.webp` and `face_takashi.webp`.**
- A wide straw kasa with a gold rim and gold ribs, and a long red ribbon from the back of the hat.
- White hair at the sides and a long white beard and moustache, drawn as shapes around a black face. The beard covers where a mouth would be, so there is still no mouth.
- Layered dark robes and a cape with gold trim, a round gold clasp at the chest, gold tasselled cords and a knotted obi, with gold wave embroidery near the hem.
- A katana with a gold-and-black diamond tsuka wrap.

**The Witness (ticket 11), from `boss_witness.webp` and `face_witness.webp`.**
- A tall, jagged crown of black spikes like sharp hair.
- A white mask-like face plate with violet-lit white eyes. Under the rule the face reads black around the mask, and the eyes stay white with a violet halo.
- A high-collared armoured coat with long blade-like tails, and violet and crimson veins running over the black armour.
- A glowing white-violet chest core with rune cards, the halo ring behind it, and the Mugen shards. These pieces already exist (`drawCore`, `drawRuneCards`, `drawWitnessHalo`, `drawWitnessCoat`) and must be re-anchored to the new body.

**Rem (ticket 07), from `face_rem.webp`.**
- Swept, spiky black hair. Its spikes are shorter and swept further back than Kage's, so their silhouettes differ.
- A white headband with a silver ring at the knot and long white tails. Black face and white eyes.
- As young Rem, a training gi. As adult Rem, a worn travel coat with a violet collar band. Hollow Rem uses the Hollow treatment on top.

## Hollow treatment (tickets 04, 07 to 11)

A Hollow version is the same design with these changes: the fabric is torn and frayed at the hems, the crimson accents become the Hollow violet, and the white eyes get a faint violet halo. The existing glitch, offset ghost, flicker and memory-ash dissolve stay on top, unchanged.
