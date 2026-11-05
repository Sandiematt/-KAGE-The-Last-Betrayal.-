<h1 align="center">KAGE — The Last Betrayal</h1>

<p align="center"><i>Brothers until the end.</i></p>

KAGE — The Last Betrayal is a story-driven, side-view 2D stickman action game. You play Kage (影, "shadow"), a black silhouette with a white face-wrap and one red sash, searching for his missing brother Rem through a world rebuilt from fragments of memory. The fights use katanas, spears, hammers and bare hands, with elemental sword arcs, perfect parries, slow-motion finishers and a dark Japanese ink identity.

The game is being rebuilt from the earlier arena duel game into this story campaign. The combat, VFX, HUD and audio carry over; the campaign map and the side-scrolling stretches and the regular enemies (Order of Silence soldiers and Hollows) are in place, while the authored stretch content, story scenes, bosses and gear arrive in later updates. The Prologue, *The Man With No Past*, is fully playable; until the other chapters are authored their stretches have placeholder content and every sub-boss stage is an arena fight against a placeholder rig. Act I's boss, **Raikon, the Lightning Ascendant**, is in, with the story boss fight format every later boss uses; Akari, Takashi and the Witness still fight a placeholder rig in that format.

The whole game ships as **one self-contained `index.html`**: HTML5, Canvas 2D, vanilla JavaScript and Web Audio, with no libraries. The fonts and key-art images are inlined by the build, so it runs offline and wraps easily for mobile.

- **Opening and home screen:** the splash writes K-A-G-E stroke by stroke under the red moon, then *The Last Betrayal* and its tagline. On the home screen the key art comes alive: the moon breathes, Kage's face-wrap strip blows in the wind, his blade glows, the cracked ground smoulders and embers rise, and the 2.5D parallax layers follow your pointer.
- **Story scenes:** dialogue panels with portrait medallions and typewriter text, flat 2D illustrations drawn in code, and a single video placeholder card at the start of the Prologue.
- **Campaign:** Prologue (1 stretch) → Act I (4 stretches, each followed by a sub-boss, then Raikon) → Interlude (the Rem spar) → Act II (the same shape, ending with Akari) → Act III (ending with Takashi) → The Core (1 stretch, the echoes of Raikon, Akari, Takashi and Rem, then the Witness) → Epilogue, *The Last Choice* (no combat). Stages unlock in story order, and cleared stages can be replayed.
- **Survival:** endless waves, a sub-boss every 5th wave, coins every wave and a gem every 5 waves.
- **Armory:** the gear of Yomi, each item with a one-line lore. Kage starts with **Kagetsu** ("Shadow Moon", his katana), the **White Face-Wrap** and the **Tachibana Yoroi**. The shop sells six more weapons (one per combat style: Shizuka, Tsubame, Onikiri, Mizuchi, Yamigama, Iwakudaki), 10 helmets and 10 armours in Common, Rare and Epic tiers; everything can be bought, upgraded and equipped. Boss weapons (Shinsen, Raikō no Tachi, Kagehira & Yūrei, Mugen no Ha) and boss trophies (Raijin Kabuto, Kasa, Mei-En Garb, Kysmei Robe, Kurokumo Yoroi, and the New Game+ only Shinsei Yoroi) are shown locked until their boss drops them.
- **Progression:** coins, gems, XP and levels, performance ratings, honor seals, New Game+, and saves in `localStorage` (key `kage.lastbetrayal.save.v2`, schema version 2). Saves from the old game (`kage.save.v1`, `ashbound.save.v1`) are deleted on first launch and nothing is carried over.
- **Look and feel:** procedural skeletal stickmen, inverted impact frames, stamped onomatopoeia, hit-stop, trauma-based screen shake, slow-motion finishers and ink-wipe screen transitions.
- **UI:** a dark Japanese identity — brush KAGE logo, brush-stroke menu buttons, crimson and muted gold, a premium combat HUD (portrait medallions, gold-framed health bars with smooth drain, glowing rage meter, cinematic boss bar). Layout tokens started from the Wonder design file *Vole*.
- **Sword animation:** every technique runs on a timeline (anticipation → wind-up → whipping strike → follow-through → stance) with torso and hip twist, per-weapon weight, and over-extended recovery after a heavy whiff.
- **Elemental effects:** smears are built from the real blade history. each weapon carries an element (`el`): Kagetsu = moon crescents, Mizuchi = water, Onikiri = flame (with heat haze), Iwakudaki = earth shockwaves and ground shards, Tsubame = lightning, Yamigama = blood moon, bare hands = wind.
- **Cinematic moments:** perfect parry, perfect dodge (slow-motion), critical hits, combo milestones, blade clashes, boss phase transitions and a full-screen finishing slash, each with its own calligraphy mark.

---

## Run it locally

Open `index.html` in any desktop browser. Double-clicking works, because everything is inline.

Alternatively, serve the folder:

```bash
python -m http.server 5317
```

Then open http://localhost:5317.

### Editing the source

The shipped file is built from readable modules in `src/`:

| File | What lives there |
|---|---|
| `src/js/00-core.js` | constants, **SaveManager**, **AudioManager** (procedural SFX + generative music), **InputManager** (keyboard / touch / gamepad) |
| `src/js/10-data.js` | pure data: poses, move tables, **weapons**, helmets, armor, **enemies & bosses**, AI profiles, acts, survival |
| `src/js/12-scenes.js` | pure data: **SCENES**, the story scenes (dialogue lines, illustrations, the one video placeholder card) |
| `src/js/15-logic.js` | **Logic**: the pure rules — the campaign map (chapters, stages, unlocks, next stage, completing a stage), fight rewards and ratings, economy formulas and shop actions, save key and schema, deleting the old game's saves, save defaults / loading / corrupt-save fallback. No DOM, canvas, storage, audio or input; tested under Node |
| `src/js/20-fighter.js` | **Player / Enemy** `Fighter`: skeleton, pose blending, state machine, cloth physics, gear & weapon art |
| `src/js/30-combat.js` | **CombatSystem**, **WeaponSystem** (projectiles, shockwaves, dropped weapons, rage arts), **ParticleSystem** + effects |
| `src/js/40-ai.js` | enemy **AI** profiles and **BossAI** abilities / phases |
| `src/js/50-world.js` | **Renderer**: parallax environments (rooftops, highlands, wasteland, and Hoshimura, the burnt village of the Prologue), stretch props and tutorial prompts, title / pre-fight / result scenes, impact frames |
| `src/js/52-story-art.js` | **SPEAKERS** (portrait medallions) and **ILLUSTRATIONS** (static story pictures), drawn in code in flat 2D |
| `src/js/60-engine.js` | **GameEngine**: fixed 60 FPS timestep, fight sessions (arena **FightSession**: rounds, survival waves; side-scrolling **StretchSession**: follow camera, encounters, clues), rewards |
| `src/js/68-story.js` | **StoryPlayer**: plays a scene over the game: dialogue panel, typewriter, illustrations, video card |
| `src/js/70-ui.js` | **UIManager**: every DOM screen, HUD, overlays, touch controls |
| `src/js/35-vfx.js` | elemental sword smears, impacts, rings, finisher slash, heat haze |
| `src/styles.css` | identity tokens, brush buttons, HUD and all screen styles |
| `src/fonts/` | embedded fonts (inlined by the build) |

After editing, rebuild the single file. Node 18+ is required; there are no dependencies.

```bash
node build.mjs
```

### Tests and the logic module

All progression rules live in `src/js/15-logic.js`, exposed as the global `Logic` object. It is the single test seam of the game:

- It may only use the data tables from `src/js/10-data.js` and `src/js/12-scenes.js` (also pure). It must never touch `document`, `window`, `localStorage`, canvas, `AudioManager`, `InputManager`, `SaveManager`, `Game` or `UIManager`; `tests/purity.test.js` fails if it does.
- It works on plain save objects. Functions that change progression (`applyFightResult`, `startNewGamePlus`, `buyItem`, `upgradeItem`, `equipItem`) update the save in place and return what happened; the caller persists it with `SaveManager.save()`.
- `SaveManager` (in `00-core.js`) only does storage. On launch it reads `Logic.SAVE_KEY` and every key in `Logic.LEGACY_SAVE_KEYS`, and hands the texts to `Logic.openSave(stored)`. That returns `{ save, error, remove, fresh }`: the save to play with (read from the current key only, defaults filled in, a fresh save when the text is corrupt), the old game's keys to delete, and whether a fresh save should be written. `SaveManager` then removes those keys from `localStorage` and writes the fresh save.
- The engine (`Game.finishFight`, `nextStage`, `stageUnlocked`, `playScene`, `rate`, `stageConfig`, `startNewGamePlus`, survival wave rewards) and the UI (campaign map, stage card, chapter locks, Armory buy/upgrade/equip) call `Logic` instead of holding the rules. New rules go into `Logic` first, with a test.
- **The campaign map** is `CAMPAIGN` in `10-data.js`: chapters (`prologue`, `act1`, `interlude`, `act2`, `act3`, `core`, `epilogue`) with their stages in play order. Every stage has a stable string id (`prologue.1`, `act1.stretch1`, `act1.sub1` … `act1.boss`, `interlude.spar`, `core.echo4`, `core.witness`, `epilogue`) and a `kind`: `stretch`, `subboss`, `boss`, `spar`, `echo` or `scene`. Saves record `cleared[stageId]` (this cycle) and `defeated[stageId]` (lifetime). `Logic` answers `chapters()`, `chapter(id)`, `stages()`, `stage(id)`, `chapterOf(id)`, `isStageUnlocked`, `isStageComplete`, `isChapterUnlocked`, `isChapterComplete`, `chapterProgress`, `nextStage`, `isCampaignComplete`, `stageConfig` and `completeStage(save, id)`, which clears the stage and returns the chapter or New Game+ it opened. Finishing the Epilogue unlocks New Game+.
- The economy formulas (`weaponMul(id, lvl)`, `weaponStats`, `weaponTotal`, `gearDef`, `gearHp`, `gearLook`, `maxLevel`, `upgradeCost`, `playerMaxHp`, `xpForLevel`, `gearTable`) are also top-level functions in `15-logic.js`, because combat code calls them directly; they are on `Logic` too.
- **Gear and tiers.** Weapons, helmets and armours live in `WEAPONS`, `HELMETS` and `ARMORS` (`10-data.js`). Every item has a `tier` (`GEAR_TIERS`: `starter`, `common`, `rare`, `epic`, `trophy`, `boss`) and a `lore` line. A weapon's `stats` are `[damage, speed, reach]` at level 1; each upgrade adds 8% damage, 2.5% speed and 1.5% reach. In a fight `weaponMul(id, lvl)` gives its damage relative to the weapon whose move-set it uses (`base`), so a boss weapon on the katana forms hits far harder than Kagetsu; speed and reach multipliers are capped at ×1.25 and ×1.2. Helmets and armours give `def` (+1.2 points per level) and `hp` (+10% per level) plus `perks`; `look` names their drawing in `20-fighter.js`. Shop weapons go to level 8 and climb a tier as they are upgraded (`Logic.itemTier`: Kagetsu is Common, Rare from level 4, Epic from level 7); helmets and armours go to level 5; trophies and boss weapons are fixed at level 1 (`Logic.maxLevel`). The tests hold the tier rule: every boss weapon has at least 1.5× the total stats of the best fully upgraded shop weapon, and every trophy beats every fully upgraded shop item of its slot. `Logic.playerCombatStats(save)` is what the equipped gear does in a fight (health, defence capped at 50%, weapon damage, summed perks); boss stats never scale with player level.
- **Difficulty modes.** Easy, Normal, Hard and Impossible (`Logic.DIFFICULTY_IDS`, `Logic.difficulty(id)`). Each mode is a set of multipliers: regular and boss health and damage (`hp`, `dmg`, `bossHp`, `bossDmg`), AI timing (`windup`, `react`, `recovery`, `idle`), AI choices (`aggr`, `guard`, `punish`, `branch` = chance of a mixed weapon-punch string), the player's dash-dodge window (`dodge`, ×1.5 on Easy) and Impossible's `unique` combo variations. Normal is all ×1 (branch 0.15), which is the original tuning. The save keeps `difficulty` (default `normal`; unknown values load as Normal) and `difficultyPicked`. The first Play, Campaign or Survival entry on a new save opens the mode picker; the pause menu and Settings change it with `Logic.setDifficulty`. A change made mid-fight re-tunes the live foes (`FightSession.applyDifficulty`), and the game never changes the mode on its own. Every foe (campaign, survival waves, boss minions and clones) is built from `Logic.enemyStats(save, cfg, enemyId, { wave, role })` and `Logic.aiTuning(profile, { level, ng, difficulty, role })`. These depend only on the mode and the authored curve (`Logic.stageLevel`: chapter tier, stage position, survival wave, plus New Game+), never on the player's level, XP or gear. `AI_PROFILES` live in `10-data.js`.
- **Locked gear and stage rewards.** An item marked `exclusive` is never sold; `Logic.isLocked(save, kind, id)` is true until it is owned and `Logic.lockHint(kind, id)` is what the Armory shows (the item's `hint`, such as "Defeat Raikon", else the stage that rewards it). A campaign stage grants gear with a `reward` field:

  ```js
  { id: 'act1.boss', kind: 'boss', /* ... */, reward: { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] } }
  ```

  `Logic.completeStage` (and so `applyFightResult` on a win) calls `Logic.grantStageReward`, which gives each listed item at level 1 exactly once: the first time the stage is cleared while the item is not owned. An item flagged `ngOnly` (Shinsei Yoroi) is only granted when the stage is cleared during New Game+. Granted items come back in the result's `gear` and in `unlocks` as `{ kind: 'weapons' | 'helmets' | 'armors', id }`, which the result screen and toasts show. Raikon's stage (`act1.boss`) gives Raikō no Tachi and the Raijin Kabuto; the other boss and sub-boss updates add theirs (and the 12 sub-boss trophies).
- **Stretches.** A `stretch` stage is a side-scrolling level, data on its `CAMPAIGN` entry:

  ```js
  { id: 'prologue.1', kind: 'stretch', /* ... */, stretch: {
      length: 4600, start: 160,                       // level width (the screen is 1280) and Kage's start x; env? overrides the chapter's
      encounters: [{ x: 1250, gate: 1950, waves: [['hollow_shade', 'hollow_shade'], ['hollow_shade', 'order_footman']] }, /* ... */],
      clues: [{ id: 'clue1', x: 2450, label: 'A torn page' }] } }
  ```

  `Logic.stretch(id)` returns it (null for other stages) and `Logic.stageConfig` hands it to the engine, which then runs a `StretchSession` instead of the arena: no rounds and no timer, a follow camera (deadzone, look-ahead, clamped to the level), and parallax layers that repeat across the level. Encounters are cleared in order: `Logic.encounterAt(stretch, cleared, x)` says when Kage's x starts the next one, `Logic.stretchLimit(stretch, cleared)` is how far he may walk (the gate of the first uncleared encounter, else the end), and `Logic.isStretchComplete(stretch, cleared, x)` is reached at the end with every encounter cleared; the win goes through `applyFightResult` like any fight. An encounter locks a 1500-wide arena ending at its gate and spawns its 1–3 waves (each wave's foes all at once, from both sides, built by `Logic.enemyStats` like every foe); only the two nearest foes press the attack while the others circle. Clues are picked up by walking over them: `Logic.collectClue(save, stageId, clueId)` records `save.clues[stageId][clueId]` (kept through New Game+; unknown ids are dropped on load) and `Logic.cluesFound(save, stageId)` lists them. Stretches the story updates have not reached yet get placeholder content (`stretchDefaults` in `10-data.js`: two encounters drawn from the stretch's squad of four units in `SQUADS`, the last wave four foes, one clue). Authored stretches can also carry:
  - `tutorial: [{ step, at }]`: in-world prompts (a paper slip above Kage, `Renderer.drawTutorial`), one at a time and in order. A prompt shows once every earlier one is cleared and Kage has reached its `at`, and clears when he performs its action while it shows (`Logic.tutorialPrompt`, `Logic.advanceTutorial`). The steps are `TUTORIAL_STEPS` in `10-data.js` (`move`, `jump`, `slash`, `block`, `dodge`), and `Logic.tutorialLabel(step, device)` gives the keys for the input device in use: `keyboard`, `touch` (the touch buttons' captions) or `pad` (`InputManager.lastDevice`, which starts as `touch` on a touch screen).
  - `props: [{ type, x }]`: set dressing drawn in the world (`house`, `shrine`, `collapsed`), and `ashTrail: { from, to }`: once every encounter is cleared, violet memory ash drifts up off the road between the two x.
  - An encounter's `mimicIntro: seconds`: its first wave stands in plain view mirroring Kage's idle stance, breathing and facing (as his mirror image) for that long, then attacks; it breaks early if Kage closes in or strikes it (`AIController.startMimic`, `Fighter.mimic`). The FIGHT mark lands when the copy breaks.
  The stretch's title banner shows after its `before` scene, never frozen behind it.
- **The Prologue** (`prologue.1`, *The Empty Village*, `tests/prologue.test.js`): Hoshimura (env `hoshimura`). The `before` scene `prologue.open` holds the one video card; Kage wakes remembering the sword but not why. The road teaches move, jump, slash, block and dodge, and holds three clues, each with its scene: the broken recording ("Find the Witness", `prologue.clue.recording`), the photograph in a burnt-out house (`prologue.clue.photograph`, flag `prologue.photo_found`) and the second message ("If you remember everything, he will find you.", `prologue.clue.message`). One `hollow_shade` with `mimicIntro` is the only fight; then the memory-ash trail, and the `after` scene `prologue.close`. Clearing it unlocks `act1.stretch1`. The Prologue never says who planted the clues or who "he" is.
- **Regular enemies.** Two families (`ENEMY_FAMILIES` in `10-data.js`), each with one unit of every type in `UNIT_TYPES` (`regular`, `agile`, `defensive`, `ranged`, `heavy`); a unit's `unit` is also its `AI_PROFILES` profile, and units have no personal names. **Order of Silence:** `order_footman`, `order_runner`, `order_shieldbearer`, `order_chainthrower`, `order_ironclad`: one slate uniform with a pale grey sash and the Order mark on the chest, a cloth hood and dark mask (an iron helm for rank 2+), rank shown as small pale shoulder bars. **Hollows:** `hollow_shade`, `hollow_flicker`, `hollow_ward`, `hollow_mimic`, `hollow_husk`: flat violet silhouettes whose fill flickers between close tones and whose frames now and then glitch (the body skips sideways, a pale ghost and a jittering outline double it). A beaten Hollow never ragdolls: it freezes, comes apart into flat violet memory-ash flakes (`Effects.memoryAsh`) and fades out (`FightSession.dissolve`). The family palette lives on `ENEMY_FAMILIES`; the hood, helm, shard and uniform drawings are `order_hood`, `order_kabuto`, `hollow_shard`, `order_garb`, `order_plate` and `hollow_rags` in `20-fighter.js`. Stretches mix them per chapter (the Order holds Act I, Hollows gather in Act II and take over Act III's later stretches and the Core), survival draws from all ten (`SURVIVAL.pool`, wave 1 from `SURVIVAL.opening`), and bosses summon `Logic.minionId(cfg)` (`BOSS_MINIONS`: Order footmen, Hollow Shades in Act II and the Core). `tests/enemies.test.js` holds that every enemy id the campaign, stretches, survival and minions name exists and that both families have all five unit types.
- **Story scenes.** A scene is pure data in `SCENES` (`src/js/12-scenes.js`): an ordered list of steps.

  ```js
  'prologue.open': { memory: false, steps: [
    { video: 'Kage wakes in the ashes of Hoshimura ...' },          // the ONE video placeholder card (Prologue only)
    { illus: 'hoshimura_ruins', caption: 'Hoshimura. What the fire left of it.' },  // full-screen illustration (+ narration)
    { say: 'kage', text: '...Ash. Still warm.' },                    // dialogue line (optional name, memory)
    { wait: 0.6 }, { flag: 'prologue.photo_found' }, { illus: null } ] }
  ```

  Scenes attach by id: a `CAMPAIGN` stage takes `scenes: { before, after, defeat }` (`before` as the stage starts, `defeat` the moment the foe is beaten and before the outro, `after` after a won stage and before the result screen; a `scene`-kind stage such as the Epilogue is just its `before` scene), and a stretch clue takes `scene`. `Logic.stageScene(stageId, hook)` and `Logic.clueScene(stageId, clueId)` answer which scene plays; `Logic.markSceneSeen` / `isSceneSeen` keep `save.seenScenes` and `Logic.setStoryFlag` / `storyFlag` keep `save.storyFlags` (a skipped scene still sets its flags). Seen scenes still replay every time. Speakers (`kage`, `rem`, `takashi`, `raikon`, `akari`, `witness`, `narrator`, `recording`) and illustrations (`hoshimura_ruins`, `photograph`, `memory_ash`, `memory`) live in `src/js/52-story-art.js`; add new ones there. `StoryPlayer` freezes gameplay while a scene plays: one press (Enter, Space, J, K, U, a tap, gamepad A/X/Y/RB) finishes the line, the next advances, and Skip (Esc, P, the Skip button, gamepad Start/Back) ends the scene. `tests/story.test.js` holds that exactly one video step exists in all scene data and that every speaker and illustration a scene names exists.
- **The story boss format.** `Logic.fightFormat(cfg)` (also `stageConfig(...).format`) says how a fight is staged: `{ name, roundsToWin, timer, phases, defeat }`. Story boss stages (kind `boss`, or a stage with `format: 'boss'`, which sub-bosses may use) are `boss`: ONE round, ONE health bar, three phases and `timer: 0`, so no round clock and no time-out loss. Other arena fights are `duel` (best of three, 75 s), survival waves `survival` (90 s), stretches `stretch`. A boss's phases are data on its `ENEMIES` entry: `phases: [{ name, at, abilities, ...flags }]`, where `at` is the health fraction the phase opens at (1, 0.66, 0.33 by default; `Logic.bossPhases(id)`, `Logic.bossPhaseAt(id, hpFraction)`), and the boss bar draws a divider at each. How a beaten boss leaves is `defeat` on the entry (`Logic.BOSS_DEFEATS`, `Logic.bossDefeat(id)`): `'finisher'` (full-screen finishing slash, the `defeat` scene, then a violet-ash dissolve), `'escape'` (he kneels, no killing blow, the `defeat` scene, then he leaves in smoke) or `'reabsorb'` (the Witness; a placeholder until SAN-42: it dissolves and its light streams into Kage). Winning a boss-format stage records the boss's fate in `save.bossFates[stageId]` (`'killed'`, `'escaped'` or `'reabsorbed'`, kept through New Game+; `Logic.bossFate(save, stageId)`, also `completeStage(...).fate`). `FightSession.bossExit` (60-engine.js) plays the exit. The dialogue-panel line a beaten placeholder says is `defeatLine`.
- **Raikon** (`raikon`, Act I boss, `tests/boss.test.js`): heavy armour (light hits never make him flinch) and no throws, Raikō no Tachi (`raikon_tachi`, the enemy copy of the boss weapon), Raijin Kabuto, layered plates (`raikon_plate`) and a long dark scarf (`longScarf`). His abilities (`BOSS_ABILITIES` in 40-ai.js) all wind up for about `0.6 × Logic.aiTuning(...).windup` seconds with a readable pose, white eyes, a heated red groove, crackling red lightning and a red glint before release: **Thunder Swing** (a wide flat arc and a travelling ground wave, WeaponSystem `thunderwave`: jump it or dash through it; in phase 3 the phase's `secondWave` delay sends a second wave late), **Storm Break** (overhead strike and a short ground shockwave) and **Redline Counter** (from phase 2: a guard stance; a melee hit on it is turned aside and punished with a fast diagonal cut). His scenes are `act1.raikon.before` and `act1.raikon.defeat` (the defeat scene sets the story flag `act1.access_token`). Red lightning is the `redline` element and `Effects.lightning` (hand-drawn branching bolts redrawn every other frame). The player's Raikō no Tachi rage art is **Thunder Swing** (`SPECIAL_IMPL.thunderSwing`).
- In the browser console it is available as `KAGE.Logic`.

Run the tests (Node 18+, no dependencies, built-in test runner):

```bash
node --test tests/
```

How the tests load the code: `tests/helpers/load-logic.js` reads `10-data.js`, `12-scenes.js` and `15-logic.js`, joins them in build order and runs them as one strict-mode function, exactly as the build's IIFE would, then returns `{ Logic, CAMPAIGN, ENEMIES, WEAPONS, HELMETS, ARMORS, GEAR_MAX, SURVIVAL, AI_PROFILES, SCENES }`. Every call gives fresh copies. If the logic module ever needs another pure module, add it to `PURE_MODULES` in that helper. Test files are `tests/*.test.js`; `tests/index.js` loads them all so `node --test tests/` works on every Node version (plain `node --test` also finds them). Tests drive `Logic` through its public functions only and check what a player would notice (coins earned, stages unlocked), with expected values written out by hand rather than recomputed.

---

## Controls

### Keyboard

| Action | Keys |
|---|---|
| Move | `A` / `D` or `←` / `→` (hold to break into a run) |
| Jump / double jump (flip) | `W` or `Space` |
| Punch string: jab → cross → rising uppercut | `J` |
| Rear-leg roundhouse kick; **hold to charge** a spinning side kick | `K` |
| Dash / dodge (invulnerable frames) | `L` or `Shift` |
| Block — **press just before a hit to parry** | `S` |
| Weapon string | `U` |
| Kunai (limited ammo) — **Rage art when the meter is full** | `I` |
| Grab & throw (close range) | `S` + `J` |
| Lunge punch (oi-zuki) / spinning low sweep | `L` then `J` / `L` then `K` |
| Counter-slash after a block or parry | `S` then `U` |
| Pause | `Esc` or `P` |

Menus can be navigated with the arrow keys, `Enter` and `Esc`.

### Combat notes

- **Martial technique:** every attack runs anticipation → wind-up → strike → follow-through, then returns to stance. Unarmed fighters keep a bladed guard with shuffle footwork. The katana works from chudan-no-kamae and cuts kesa-giri (diagonal), kiri-age (rising), tsuki (lunging thrust) and the nukitsuke draw counter.

- **Parry:** a well-timed block stuns the attacker and opens the weapon's counter-slash. Holding block for too long cracks your guard, which leads to a guard break.
- **Repetition:** repeating the same move loses damage, and bosses that adapt actively read it and counter. After a hit, any attack button cancels into another string.
- **Knockback and juggles:** launchers juggle, heavy blows bounce enemies off walls, and some strikes **disarm**. Walk over a dropped weapon to recover it.

### Touch (phones in landscape)

Touch controls appear automatically on touch screens. They can be forced on or off in Settings.

- **Left thumb:** the movement stick. It floats by default; a fixed stick is in Settings. Push it up to jump.
- **Right thumb:** Strike (weapon), Punch, Kick, Jump, Dash, Block (shield) and the Rage diamond (kunai, or rage art when full).

### Gamepad

| Action | Button |
|---|---|
| Jump | A |
| Punch | X |
| Kick | Y |
| Dash | B / LB |
| Weapon | RB |
| Block | LT / D-pad down |
| Special | RT |
| Pause | Start |

---

## Add a new weapon

In `src/js/10-data.js`, add an entry to `WEAPONS`:

```js
storm_glaive: {
  name: 'Arashi', cls: 'Glaive', tab: 'polearms', tier: 'rare',
  hands: 2, len: 170, stance: 'spear',            // stance from STANCES
  stats: [58, 55, 88], price: 1800,                // damage, speed, reach at level 1
  trail: '#7fb8ff', el: 'lightning', desc: 'Sweeping lightning arcs.',
  lore: 'A glaive from a Silent War signal tower, still humming with the storm.',   // one line, shown in the Armory
  moves: ['g1', 'g2'], air: 'sa', special: 'dragonLance', counter: 'g1',
  defs: {
    g1: { kind: 'weapon', w: { fs: 150, wa: 200 }, s: { lean: 20, fs: 70, wa: 30 },
          t: [0.1, 0.08, 0.2], dmg: 10, kb: 260, hs: 0.35, box: [20, -200, 200, 150],
          limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 'g2' },
    g2: { /* ... */ }
  }
}
```

A weapon that reuses another weapon's move-set names it with `base: 'mizuchi'` and needs only its own name, tier, stats, look and lore (see Shizuka and the boss weapons). Then:

1. Map its drawing in `SHAPE` in `src/js/20-fighter.js`, for example `storm_glaive: 'spear'`, or add a new shape case in `drawWeaponShape`.
2. Run `node build.mjs`. The weapon appears in the Armory and in the pre-fight weapon dock.

Move fields:

- `t: [startup, active, recovery]`
- `box: [x, y, w, h]`, relative to the feet, facing right
- `imp`: impact tier 0–3, which drives hit-stop, shake and impact frames
- Optional: `kd` knockdown, `up` launch, `gb` guard damage, `low`, `unb` unblockable, `pull`, `shock`, `multi`, `rot`, `armor`

## Add a new boss

Add an entry to `ENEMIES` in `src/js/10-data.js`:

```js
ronin_king: {
  name: 'Sorai', title: 'the Ronin King', type: 'boss', ai: 'boss',
  weapon: 'kagetsu', helmet: 'tetsu_kabuto', armor: 'cloak', hp: 800, dmg: 1.2,
  build: { scale: 1.2, w: 12 }, eye: '#c9a45c', accent: '#c9a45c',
  taunt: 'Opening line', defeatLine: 'Defeat line', win: 'Victory line', tip: 'Defeat-screen hint',
  defeat: 'finisher',                               // or 'escape' / 'reabsorb' (see the story boss format above)
  phases: [
    { name: 'Phase one', at: 1, abilities: ['lunge'] },
    { name: 'Phase two', at: 0.66, abilities: ['teleport', 'orbVolley'] },
    { name: 'Phase three', at: 0.33, abilities: ['moonDash', 'groundSlam'], berserk: 1, unblockable: 1 }
  ]
}
```

Then point a stage of the campaign map (`CAMPAIGN` in the same file) at it with `enemy: 'ronin_king'`.

- **Abilities** come from `BOSS_ABILITIES` in `src/js/40-ai.js`: `lunge`, `teleport`, `smokeBomb`, `moonDash`, `clones`, `shieldBash`, `float`, `orbVolley`, `counterStance`, `barrier`, `timeAura`, `groundSlam`, `hook`, `charge`, `summon`, and Raikon's `thunderSwing`, `stormBreak`, `redlineCounter`. Write a new one with `f.startAbility({ dur, pose, update(f, world, t, dt) {...} })`.
- **Phase flags:**
  - `berserk`: faster
  - `poison`: poison trails
  - `unblockable`: breaks guards
  - `aggressive`: attacks more often
- **Boss flags:**
  - `flashEyes`: telegraphs attacks
  - `adapts`: counters spam
  - `shield`: auto-blocks frontal hits
  - `heavyArmor`: no flinch from light hits
  - `noGrab`: cannot be thrown

---

## Wrap it for Android with Capacitor

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Kage com.yourstudio.kage --web-dir www
```

Copy the game into the web directory:

```bash
mkdir www
cp index.html www/
```

Add the Android platform and open it in Android Studio:

```bash
npx cap add android
npx cap sync android
npx cap open android
```

Configure the app before building:

- **Lock landscape:** in `android/app/src/main/AndroidManifest.xml`, add `android:screenOrientation="sensorLandscape"` to the main `<activity>`.
- **Fullscreen:** optionally hide the status bar with `@capacitor/status-bar`, or use an immersive theme.

The game is already Capacitor-ready:

- **No network or asset loading:** everything is inline, so it runs offline in the WebView.
- **Touch input:** uses pointer events, blocks page scroll, includes a landscape hint, and has a large touch layout.
- **Saves and audio:** saves use `localStorage`, which persists in the WebView. Audio unlocks on the first tap.

---

## Design references and originality

The dark silhouette atmosphere follows the brief's Shadow Fight 2 direction. The impact presentation follows the IMPACT FRAME reference: inverted impact frames, stamps, shake and pop-ins. Both are used as high-level principles only.

Every character, name, weapon, environment, line of dialogue, animation and sound in KAGE is original. The UI follows the Wonder design file "Vole", with the static design stickmen replaced by the procedural fighters.

Typography uses five Google Fonts under the SIL Open Font License: Permanent Marker (brush titles), Cinzel (headings and boss names), Teko (menus and labels), Rajdhani (numbers) and a kanji subset of Yuji Boku (calligraphy marks). They are embedded inside `index.html` as data, so the game still loads nothing from the network and works offline and in Capacitor.

The elemental effects are original interpretations of elemental sword combat; no character techniques, assets or signature animations from other works are reproduced.
