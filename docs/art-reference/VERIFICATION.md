# KAGE anime redesign: verification (ticket 13, SAN-58)

The redesign brief asked for zero stickman artwork left in the game, every character drawn with a **black face, white eyes and detailed dark samurai clothing**, and nothing else changed: gameplay, combat, attack patterns, AI, VFX, screen shake, camera, HUD, main menu and backgrounds. This page records how that was checked at the end of the redesign (tickets 01 to 13, `f4756e6..` on the `redesign` branch) and what was found.

All captures are in `progress/13-*.png`. The UI captures compare against the pre-redesign baseline, commit `f4756e6` (ticket 01), checked out in a temporary worktree and served side by side with the current build.

## Acceptance criteria

- [x] **Automated check: no fighter, gear item or story figure can render with the old stickman or primitive art.** `tests/anime-coverage.test.js` (10 tests, details below).
- [x] **Screenshot sweep reviewed:** black faces, white eyes, detailed clothing, correct facing, no cropping, weapons in hand. Every character in idle, attack, hurt and death, every helmet, armour and weapon on Kage, and in-game fights with the HUD.
- [x] **HUD, main menu and backgrounds are identical to the pre-redesign captures outside the character areas.** Pixel diffs of seven screens against `f4756e6` (table below).
- [x] **Gameplay-lock test and full suite green; the build produces `index.html`.** `node --test tests/`: 350 tests, 350 pass. `tests/gameplay-lock.test.js` (9 tests) passes against the snapshot recorded in ticket 01, which was never regenerated (`git diff f4756e6 -- tests/snapshots` is empty). `node build.mjs` writes `index.html`.

## 1. The zero-stickman test

`tests/anime-coverage.test.js` loads the whole game headlessly (`tests/helpers/load-sim.js`) and draws into a recording 2D context (`tests/helpers/record-ctx.js`) that logs every fill and stroke colour, every clip and every even-odd fill. `celFill`, the anime body's part painter, always clips and paints its shade strips with even-odd fills. The old primitive overlays (ball heads, torso blobs, stroked antlers, flat cowls) never did either. That is the fingerprint the test reads.

| Guard | How a regression fails |
|---|---|
| Every `ENEMIES` def (regulars, sub-bosses, bosses, the Core echoes, young and Hollow Rem) has its own `ANIME_SKINS` entry (by id or `echoOf`) | A new def without one resolves to the generic fallback skin |
| Every fighter (each def, the player, young Kage, adult Rem from the story, Hollow Kage holding Kage's blade) draws ≥ 25 cel-shaded parts, the black face fill (`ANIME.face`) and the white eye fill, in idle, hurt and death | A stickman or a faceless figure has no parts, face or eyes |
| Flat passes (`opt.color`: impact frame, flash, afterimages, glitch ghost) draw exactly one colour for every fighter | Any accent colour leaking into a silhouette |
| Every helmet and armour look (each `HELMETS` / `ARMORS` look, and each look a def wears) reaches cel-shaded art in `drawHelmet` / `drawArmor`, and its flat pass is one colour | A look key with no case draws nothing; a primitive case draws no parts. Two documented exceptions: `training` (the plain gi is the look) and `tachibana` (checked for its ANIME metal and crimson tokens) |
| Kage with every helmet and every armour is still the full anime body with a clean flat pass | |
| Every weapon a fighter can hold (equippable ones and each def's) draws coloured steel in the hand and one colour on the flat pass; a shapeless weapon may only be bare hands or the iron fists (gauntlet art) | |
| Every story bust and illustration figure with an in-game design is the live fighter (`STORY_CAST`), every speaker portrait paints without falling back, and the code-drawn civilians keep a black face and white eyes | A story id with no live fighter, or a figure error |
| The deleted primitive code stays deleted (`torsoShape`, `TORSO_FRONT/BACK`, `reaper_cowl`, `ashen_crown`, the `colossus` helmet, `drawDetails`), and `drawHelmet` / `drawArmor` have no `default:` fallback | |

Mutation check: adding a def without a skin and renaming a helmet's look to an unknown key made 6 of the 10 tests fail. Both changes were reverted.

## 2. What the test found, and the fixes

| Found | Fix |
|---|---|
| Four helmets and four armours that only Kage can wear still drew primitive overlays: Kuro Zukin (`ronin_hood`, a black ball hood), Shika Kabuto (`sage_antlers`, stroked lines), Utsuro Kabuto (`hollow_crest`, a floating crescent), Shikkō Zukin (`executioner`, a black triangle), Kozane-dō (`lamellar`), Shikkō Garb (`executioner_garb`) and Kurogane-dō (`colossus_plate`) as torso blobs with bands, and the Raiun Mantle (`storm_mantle`) as a single blue string | Redrawn as anime gear in `src/js/29g-anime-gear.js`: a black cloth hood with an eye slit and crimson cord; a riveted kabuto with jade-laced shikoro and lacquered antlers; a kabuto under a great hollow crescent lit violet; a tall peaked hood with a crimson-stitched seam; a lamellar dō of laced scales with scale sode; a long leather vest with a baldric of iron rings; a heavy riveted iron dō with great studded sode; a storm-blue mantle with a lightning-cloud band and a tapered streamer (`progress/13-gear-redesigned-closeup.png`) |
| The Raijin Kabuto on Kage (not Raikon's own jingasa) was flat single-tone polygons | Same shapes, now cel-shaded dark iron with a red crest |
| Flat-pass colour leaks: the spear tassels (Order shieldbearer, Shiden), the cleaver's hole (Order ironclad), Iwakudaki's face bands (Kage) | Those details are skipped or drawn in the flat colour on flat passes |

## 3. Dead code removed

Nothing that draws a visible pixel in the shipped game was removed: the unreachable paths below were proved dead by a before/after pixel diff of every enemy def and every helmet, armour and weapon on Kage, in idle, attack, flat, impact-white and facing-left passes, with `Math.random` seeded. Every cell is pixel-identical except the eight redesigned looks, Kasane's chain (fix 3c below) and three enemy-only weapons shown on Kage, which no fighter can hold (`progress/13-cleanup-diff-enemies.png`, `progress/13-cleanup-diff-gear.png`).

- `20-fighter.js`: `TORSO_FRONT`, `TORSO_BACK` and `torsoShape` (the old V torso); the helmet cases `reaper_cowl`, `ashen_crown` and `colossus` (unreferenced) and the primitive `ronin_hood`, `hollow_crest`, `sage_antlers` and `executioner` shapes; the armour helpers `bands` and `plate` and the primitive `executioner_garb`, `lamellar` and `colossus_plate` torsos; the no-op `drawDetails`; the primitive round shield, the square iron-fist and the blue storm-orb fallbacks; the `sage_staff` ring; the constructor's bare `storm_mantle` string (now the mantle's cloth in `gearCloths`).
- The anime modules (`22` to `29w`): the unreachable `torsoShape` fallbacks (`if (!A || !A.S)`) and the ball-head fallbacks (`if (!f)`). `drawArmor` and `drawHelmet` are only called from the anime body, which always sets the draw state first.
- Gameplay code (the `SHAPE` and `CARRY` tables, weapon data, AI) was not touched.

## 4. Earlier tickets' leftovers

| Item | Result |
|---|---|
| **3a** Title and splash screens painted the old white face-wrap over the illustrated hero | The painted hero already has a black face and white eyes. The overlay now only inks out the old headband. On the title, the trailing white strips are Kage's red scarf tails from the scarf painted at his neck. On the splash, a crimson scarf is wound at his neck with two tails from its knot. Layout, typography, buttons, timing and backgrounds are unchanged (`progress/13-ui-title-compare.png`, `13-ui-splash-before.png` → `13-ui-splash-after.png`) |
| **3b** hollow_ward's staff drew teal ring marks into the flat pass | Already fixed in SAN-50 (`d2823fa`). Re-checked: the staff's bands are drawn only on the normal pass, the recording test holds hollow_ward's flat pass to one colour, and the in-game glitch ghost is one clean violet silhouette (`progress/13-ingame-hollow-ward-glitch.png`) |
| **3c** Kasane's kusari chain dropped out of the flat silhouette | The chain is now part of the flat and outline passes (`SUBB_WEAPON_FLAT.ledger_kusari`, sharing `_kusariChain` with the drawn chain) (`progress/13-kasane-flat-chain-before-after.png`, `13-ingame-kasane-impact.png`) |
| **3d** Shiden's tall back banner could overlap the HUD in close shots | It could reach the top HUD band when he is airborne. The pole now ends half a torso lower and leans further back; grounded close shots clear the HUD (`progress/13-ingame-shiden-banner.png`). His yari held upright is a gameplay pose and was left alone |

## 5. Screenshot sweep

| Capture | What it shows |
|---|---|
| `13-sheet-1-kage-rem-order-hollow.png` … `13-sheet-4-subbosses-echoes.png` | All 38 characters (Kage, young Kage, adult Rem, all 35 defs) in idle, attack, hurt and death |
| `13-kage-helmets.png`, `13-kage-armours.png`, `13-kage-weapons.png` | Kage wearing every helmet and every armour, and holding every weapon mid-cut |
| `13-gear-redesigned-closeup.png` | The nine looks redrawn in this ticket, close up |
| `13-ingame-sweep.png` | Real fights with the HUD: an Order footman, hollow_ward (and a glitch frame), Kasane (and an impact frame), Raikon, Takashi, the Witness and Shiden |

Review, per capture: every face is the black face fill with two white eyes (masks show the eyes through their holes; Akari's and the Witness's eyes are drawn with their masks), and nobody has a nose, mouth or skin tone. Every figure wears layered dark cloth and armour in its family accent. Facing follows `f.facing` (each sheet's left-facing passes are in the diff sheets). Weapons sit in the mitten grip in every attack and stance frame, and drop with the body in death. Nothing is cropped in-game. The contact sheets clip a few long weapons and Raikon's mantle at their cell edges, which is the sheet layout, not the game.

## 6. UI comparison against the pre-redesign build

The two builds were captured in the same headless browser at 1280 × 720 with a frozen, frame-stepped clock and a reseeded `Math.random`, so the canvases draw comparable frames. The HUD fight was stepped through the real simulation to the same frame in both builds. Columns: pixels that differ (> 8/255) in total, inside the character areas, and outside them; the last column is the current build against itself (run-to-run noise of animated canvases) outside the character areas.

| Screen | Changed px | In character areas | Outside | Noise, run to run | What differs outside |
|---|---:|---:|---:|---:|---|
| Main menu (title) | 6,871 | 5,794 | 1,077 | 0 | Drifting petals and ember sparks only (particle positions); the hero is the 3a change |
| Profile overlay | 2,893 | 2,865 | 28 | 23 | Noise of the animated title behind the overlay |
| Armory (gear shop) | 27,110 | 26,881 | 229 | 302 | Noise of the preview's animation |
| Echo Trials | 151,047 | 151,047 | 0 | 0 | None |
| Boss Rush | 32,270 | 32,270 | 0 | 0 | None |
| HUD in a fight (Kuroe) | 54,107 | 54,107 | 0 | 0 | None; the fighters stand on the same pixels in both builds |
| Results | 56,190 | 56,190 | 0 | 0 | None |

Comparison sheets (baseline | after | red difference mask): `progress/13-ui-title-compare.png`, `13-ui-profile-compare.png`, `13-ui-armory-compare.png`, `13-ui-trials-compare.png`, `13-ui-bossrush-compare.png`, `13-ui-hud-compare.png`, `13-ui-result-compare.png`.

Outside the characters the menus, typography, buttons, HUD bars and backgrounds are pixel-identical apart from animation noise. In source, since `f4756e6` no commit touched `styles.css`, the HTML template, the backgrounds (`50-world.js`), the VFX modules (`34`–`37`), the engine (`60-engine.js`), AI, scenes or logic. `70-ui.js` changed in one line (the Armory helmet icon draws the anime head), and `30-combat.js` changed only in how afterimages are drawn (an anime silhouette in place of stick lines).

## 7. Remaining weaknesses

- The title and splash heroes are still the painted key art: the overlay can recolour them but not redraw them, so their bodies keep the illustration's own proportions (slim limbs, round head) under the anime colouring.
- A few looks draw no shading parts of their own and are held by token checks instead: `training` (the gi is the look) and `tachibana` (Kage's default sode, flat ANIME metal tones).
- Under Node, the story module still keeps its code-drawn stand-in busts for when no `Fighter` exists (`tests/story.test.js` loads it alone). The game never reaches them; the coverage test holds that every story figure is the live fighter in the full game.
- The UI pixel comparison is done in a headless browser by a script, not in CI. The coverage test runs in CI, but there is no automated screenshot test.
