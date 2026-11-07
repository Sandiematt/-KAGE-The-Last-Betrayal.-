<h1 align="center">KAGE — The Last Betrayal</h1>

<p align="center"><i>Brothers until the end.</i></p>

KAGE — The Last Betrayal is a story-driven, side-view 2D action game with cel-shaded anime samurai. You play Kage (影, "shadow"), a black-faced swordsman with glowing white eyes, spiky hair, a long charcoal coat and a red scarf, searching for his missing brother Rem through a world rebuilt from fragments of memory. The fights use katanas, spears, hammers and bare hands, with elemental sword arcs, perfect parries, slow-motion finishers and a dark Japanese ink identity.

The game is being rebuilt from the earlier arena duel game into this story campaign. The combat, VFX, HUD and audio carry over; the campaign map and the side-scrolling stretches and the regular enemies (Order of Silence soldiers and Hollows) are in place, while the authored stretch content, story scenes, bosses and gear arrive in later updates. The Prologue, *The Man With No Past*, Act I, *The Missing Brother*, Act II's City of Echoes and Act III's Fortress of Silence, *The Father's Sin* (each four authored stretches and four sub-bosses) are fully playable, and so is the Core (its stretch and the four echo fights); until the other chapters are authored their stretches have placeholder content and their sub-boss stages are arena fights against a placeholder rig. Act I's boss, **Raikon, the Lightning Ascendant**, is in, with the story boss fight format every later boss uses, so is Act II's boss, **Akari, the Memory Blade**, Act III's boss, **Takashi, the Master's Flow**, and the final boss, **the Witness, Mirror of the Self**. The Interlude, the brothers' sparring flashback, is in: young Kage against young Rem, both running the shared family form, ending when Takashi calls them in. So is the Epilogue, *The Last Choice*: the brothers' last scene, no combat, which grants the post-story gear (Mugen no Ha with its Echo Replication rage art, the Kysmei Robe, the Kurokumo Yoroi, and the Shinsei Yoroi in New Game+).

The whole game ships as **one self-contained `index.html`**: HTML5, Canvas 2D, vanilla JavaScript and Web Audio, with no libraries. The fonts and key-art images are inlined by the build, so it runs offline and wraps easily for mobile.

- **Opening and home screen:** the splash writes K-A-G-E stroke by stroke under the red moon, then *The Last Betrayal* and its tagline. On the home screen the key art comes alive: the moon breathes, the tails of Kage's red scarf blow in the wind, his blade glows, the cracked ground smoulders and embers rise, and the 2.5D parallax layers follow your pointer.
- **Story scenes:** dialogue panels with portrait medallions and typewriter text, flat 2D illustrations drawn in code, and a single video placeholder card at the start of the Prologue.
- **Campaign:** Prologue (1 stretch) → Act I (4 stretches, each followed by a sub-boss, then Raikon) → Interlude (the Rem spar) → Act II (the same shape, ending with Akari) → Act III (ending with Takashi) → The Core (1 stretch, the echoes of Raikon, Akari, Takashi and Rem, then the Witness) → Epilogue, *The Last Choice* (no combat). Stages unlock in story order, and cleared stages can be replayed.
- **Echo Trials** (replaces Survival): endless Hollow waves in a shifting memory arena; every 5th wave an echo of a boss you have beaten in the story (an elite Hollow pack until you have beaten one), coins every wave and a gem every 5 waves, on your difficulty mode.
- **Boss Rush:** in the main menu from the start. Its roster is every boss of the story in story order (the 12 act sub-bosses, Raikon, Akari, Takashi, the four Core echoes and the Witness); each joins once beaten in the story, the rest show as locked silhouettes. A run fights the available bosses back to back (optionally from a chosen start), in each boss's own arena, with no story scenes, health carried over with 30% restored between fights, on your difficulty mode, and ends with bosses defeated, time and a saved best record.
- **Armory:** the gear of Yomi, each item with a one-line lore. Kage starts with **Kagetsu** ("Shadow Moon", his katana), the **Crimson Scarf** (his look with no helmet) and the **Tachibana Yoroi**. The shop sells six more weapons (one per combat style: Shizuka, Tsubame, Onikiri, Mizuchi, Yamigama, Iwakudaki), 10 helmets and 10 armours in Common, Rare and Epic tiers; everything can be bought, upgraded and equipped. Boss weapons (Shinsen, Raikō no Tachi, Kagehira & Yūrei, Mugen no Ha), the act sub-boss trophies (Act I: Sumi Eboshi, Ikazuchi-dō, Hisame Zukin, Shiden Yoroi; Act II: Hakobi-gasa, Shirabe-dō, Utsushi-men, Kasane Haori; Act III: Tetsumon-dō, Deshi Tenugui, Kudamaki-dō, Mokushi Kabuto) and boss trophies (Raijin Kabuto, Kasa, Mei-En Garb, Kysmei Robe, Kurokumo Yoroi, and the New Game+ only Shinsei Yoroi) are shown locked until their boss (or, for Mugen no Ha, the Kysmei Robe, the Kurokumo Yoroi and the Shinsei Yoroi, the Epilogue) drops them.
- **Progression:** coins, gems, XP and levels, performance ratings, honor seals, New Game+, and saves in `localStorage` (key `kage.lastbetrayal.save.v2`, schema version 2). Saves from the old game (`kage.save.v1`, `ashbound.save.v1`) are deleted on first launch and nothing is carried over.
- **Look and feel:** anime samurai drawn as cel-shaded vector parts on a procedural skeleton (black faces, white eyes, detailed dark clothing; see *Character art* below), inverted impact frames, stamped onomatopoeia, hit-stop, trauma-based screen shake, slow-motion finishers and ink-wipe screen transitions.
- **UI:** a dark Japanese identity — brush KAGE logo, brush-stroke menu buttons, crimson and muted gold, a premium combat HUD (portrait medallions, gold-framed health bars with smooth drain, glowing rage meter, cinematic boss bar). Layout tokens started from the Wonder design file *Vole*.
- **Sword animation:** every technique runs on a timeline (anticipation → wind-up → whipping strike → follow-through → stance) with torso and hip twist, per-weapon weight, and over-extended recovery after a heavy whiff.
- **Elemental effects:** smears are built from the real blade history. each weapon carries an element (`el`): Kagetsu = moon crescents, Mizuchi = water, Onikiri = flame (with heat haze), Iwakudaki = earth shockwaves and ground shards, Tsubame = lightning, Yamigama = blood moon, Shinsen = gold (the Tachibana father style), bare hands = wind.
- **Cinematic moments:** perfect parry, perfect dodge (slow-motion), critical hits, combo milestones, blade clashes, boss phase transitions and a full-screen finishing slash, each with its own calligraphy mark.

---

## Run it locally

Open `index.html` in any desktop browser. Double-clicking works, because everything is inline.

Alternatively, serve the folder:

```bash
python -m http.server 5317
```

Then open http://localhost:5317.

### Developer unlock

`const DEV = { unlockAll: true, coins: 99999, gems: 999 }` at the top of `src/js/10-data.js` is a testing switch. While `unlockAll` is `true`:

- every chapter and stage is open and playable in any order (`Logic.isStageUnlocked` / `isChapterUnlocked` say yes; `completeStage` works as usual), every Boss Rush roster entry is available, Echo Trials boss echoes can come from every boss, and New Game+ is open;
- the save owns every weapon, helmet and armour (boss weapons, trophies, post-story and New Game+ items included) at level 1, so upgrades can still be tried, with at least 99,999 coins and 999 gems (`Logic.applyDevUnlock`);
- the game plays on its own save, `Logic.DEV_SAVE_KEY` (`kage.lastbetrayal.save.v2.dev`; `Logic.ACTIVE_SAVE_KEY` is the key in use), so the normal save (`Logic.SAVE_KEY`) is never read, written or deleted;
- the title shows a red **DEV · everything unlocked** badge.

**Set `unlockAll` to `false` before release.** The game then goes back to the untouched normal save with the normal locks. The tests load with the switch off whatever the source says (`loadLogic()`), so they keep testing the real locks; `loadLogic({ dev: true })` loads it on (`tests/dev.test.js`).

### Editing the source

The shipped file is built from readable modules in `src/`:

| File | What lives there |
|---|---|
| `src/js/00-core.js` | constants, **SaveManager**, **AudioManager** (procedural SFX + generative music), **InputManager** (keyboard / touch / gamepad) |
| `src/js/10-data.js` | pure data: poses, move tables, **weapons**, helmets, armor, **enemies & bosses**, AI profiles, acts, Echo Trials (`TRIALS`) |
| `src/js/12-scenes.js` | pure data: **SCENES**, the story scenes (dialogue lines, illustrations, the one video placeholder card) |
| `src/js/15-logic.js` | **Logic**: the pure rules — the campaign map (chapters, stages, unlocks, next stage, completing a stage), fight rewards and ratings, economy formulas and shop actions, save key and schema, deleting the old game's saves, save defaults / loading / corrupt-save fallback. No DOM, canvas, storage, audio or input; tested under Node |
| `src/js/20-fighter.js` | **Player / Enemy** `Fighter`: skeleton, pose blending, state machine, cloth physics, weapon shapes, the helmet / armour dispatch (`drawHelmet`, `drawArmor`) |
| `src/js/21-anime-body.js` … `29w-anime-witness.js` | **the anime character art** (see *Character art*): the cel-shaded body, `ANIME_SKINS`, and one module per family or character (Order, Hollows, sub-bosses A and B, Rem, Raikon, Akari, Takashi, the shop gear in `29g-anime-gear.js`, the Witness) |
| `src/js/30-combat.js` | **CombatSystem**, **WeaponSystem** (projectiles, shockwaves, dropped weapons, rage arts), **ParticleSystem** + effects |
| `src/js/40-ai.js` | enemy **AI** profiles and **BossAI** abilities / phases |
| `src/js/50-world.js` | **Renderer**: parallax environments (rooftops, the rain-soaked outer districts of Act I, highlands, wasteland, Hoshimura, the burnt village of the Prologue, Takashi's training yard for the Interlude, the City of Echoes, the Fortress of Silence and the Memory Core), the memory filter, stretch props and tutorial prompts, title / pre-fight / result scenes, impact frames |
| `src/js/52-story-art.js` | **SPEAKERS** (portrait medallions) and **ILLUSTRATIONS** (static story pictures), drawn in code in flat 2D |
| `src/js/60-engine.js` | **GameEngine**: fixed 60 FPS timestep, fight sessions (arena **FightSession**: rounds, Echo Trials waves; side-scrolling **StretchSession**: follow camera, encounters, clues), rewards |
| `src/js/68-story.js` | **StoryPlayer**: plays a scene over the game: dialogue panel, typewriter, illustrations, video card |
| `src/js/70-ui.js` | **UIManager**: every DOM screen, HUD, overlays, touch controls |
| `src/js/35-vfx.js` | elemental sword smears, impacts, rings, finisher slash, heat haze |
| `src/js/34-vfx-sheets.js` | **generated** by `vfx/tools/export_game.py`: the sprite-sheet data of the baked Effekseer effects (images in `src/img/raikon_*.webp`) |
| `src/js/37-vfx-sheets.js` | **VfxSheets**: plays the baked Effekseer effects additively in world space: Raikon's sky strike, blade charge, Thunder Swing wave, Redline guard and storm mantle (loop crossfaded) |
| `src/js/36-storm.js` | **storm VFX**: cinematic red lightning from the sky (stepped leader, re-struck bolt, ground cracks, crawling arcs, scorch), the arena light it throws, the storm sky (clouds, sheet lightning, distant strikes, rain), Raikon's lightning aura, and **StormDirector**, which decides when the sky strikes in sub-boss and Raikon fights. Purely cosmetic: no strike deals damage or changes timing |
| `src/styles.css` | identity tokens, brush buttons, HUD and all screen styles |
| `src/fonts/` | embedded fonts (inlined by the build) |

After editing, rebuild the single file. Node 18+ is required; there are no dependencies.

```bash
node build.mjs
```

### Tests and the logic module

All progression rules live in `src/js/15-logic.js`, exposed as the global `Logic` object. It is the single test seam of the game:

- It may only use the data tables from `src/js/10-data.js` and `src/js/12-scenes.js` (also pure). It must never touch `document`, `window`, `localStorage`, canvas, `AudioManager`, `InputManager`, `SaveManager`, `Game` or `UIManager`; `tests/purity.test.js` fails if it does.
- It works on plain save objects. Functions that change progression (`applyFightResult`, `startNewGamePlus`, `buyItem`, `upgradeItem`, `equipItem`) update the save in place and return what happened; the caller persists it with `SaveManager.save()`. A campaign win on a stage `completeStage` refuses (still locked) earns nothing (no coins, XP, gems or stats) and comes back flagged `rejected: true`.
- `SaveManager` (in `00-core.js`) only does storage. On launch it reads `Logic.ACTIVE_SAVE_KEY` (`Logic.SAVE_KEY`, or `Logic.DEV_SAVE_KEY` while the developer unlock is on) and every key in `Logic.LEGACY_SAVE_KEYS`, and hands the texts to `Logic.openSave(stored)`. That returns `{ save, error, remove, fresh }`: the save to play with (read from the current key only, defaults filled in, a fresh save when the text is corrupt), the old game's keys to delete, and whether a fresh save should be written. `SaveManager` then removes those keys from `localStorage` and writes the fresh save. When the stored text is unreadable, `openSave` also returns `backup: { key, raw }` and `SaveManager` copies the raw text to `Logic.CORRUPT_SAVE_KEY` (the active key plus `.corrupt`) and warns in the console before carrying on with a fresh save, so a corrupt save is never silently lost.
- The engine (`Game.finishFight`, `nextStage`, `stageUnlocked`, `playScene`, `rate`, `stageConfig`, `startNewGamePlus`, Echo Trials waves and rewards) and the UI (campaign map, stage card, chapter locks, Armory buy/upgrade/equip) call `Logic` instead of holding the rules. New rules go into `Logic` first, with a test.
- **The campaign map** is `CAMPAIGN` in `10-data.js`: chapters (`prologue`, `act1`, `interlude`, `act2`, `act3`, `core`, `epilogue`) with their stages in play order. Every stage has a stable string id (`prologue.1`, `act1.stretch1`, `act1.sub1` … `act1.boss`, `interlude.spar`, `core.echo4`, `core.witness`, `epilogue`) and a `kind`: `stretch`, `subboss`, `boss`, `spar`, `echo` or `scene`. Saves record `cleared[stageId]` (this cycle) and `defeated[stageId]` (lifetime). `Logic` answers `chapters()`, `chapter(id)`, `stages()`, `stage(id)`, `chapterOf(id)`, `isStageUnlocked`, `isStageComplete`, `isChapterUnlocked`, `isChapterComplete`, `chapterProgress`, `nextStage`, `isCampaignComplete`, `stageConfig` and `completeStage(save, id)`, which clears the stage and returns the chapter or New Game+ it opened. Finishing the Epilogue unlocks New Game+.
- The economy formulas (`weaponMul(id, lvl)`, `weaponStats`, `weaponTotal`, `gearDef`, `gearHp`, `gearLook`, `maxLevel`, `upgradeCost`, `playerMaxHp`, `xpForLevel`, `gearTable`) are also top-level functions in `15-logic.js`, because combat code calls them directly; they are on `Logic` too.
- **Gear and tiers.** Weapons, helmets and armours live in `WEAPONS`, `HELMETS` and `ARMORS` (`10-data.js`). Every item has a `tier` (`GEAR_TIERS`: `starter`, `common`, `rare`, `epic`, `trophy`, `boss`) and a `lore` line. A weapon's `stats` are `[damage, speed, reach]` at level 1; each upgrade adds 8% damage, 2.5% speed and 1.5% reach. In a fight `weaponMul(id, lvl)` gives its damage relative to the weapon whose move-set it uses (`base`), so a boss weapon on the katana forms hits far harder than Kagetsu; speed and reach multipliers are capped at ×1.25 and ×1.2. Helmets and armours give `def` (+1.2 points per level) and `hp` (+10% per level) plus `perks`; `look` names their drawing (`drawHelmet` / `drawArmor` in `20-fighter.js`, which hand each look to its anime part module). Shop weapons go to level 8 and climb a tier as they are upgraded (`Logic.itemTier`: Kagetsu is Common, Rare from level 4, Epic from level 7); helmets and armours go to level 5; trophies and boss weapons are fixed at level 1 (`Logic.maxLevel`). The tests hold the tier rule: every boss weapon has at least 1.5× the total stats of the best fully upgraded shop weapon, and every trophy beats every fully upgraded shop item of its slot. `Logic.playerCombatStats(save)` is what the equipped gear does in a fight (health, defence capped at 50%, weapon damage, summed perks); boss stats never scale with player level.
- **Difficulty modes.** Easy, Normal, Hard and Impossible (`Logic.DIFFICULTY_IDS`, `Logic.difficulty(id)`). Each mode is a set of multipliers: regular and boss health and damage (`hp`, `dmg`, `bossHp`, `bossDmg`), AI timing (`windup`, `react`, `recovery`, `idle`), AI choices (`aggr`, `guard`, `punish`, `branch` = chance of a mixed weapon-punch string), the player's dash-dodge window (`dodge`, ×1.5 on Easy) and Impossible's `unique` combo variations. Normal is all ×1 (branch 0.15), which is the original tuning. The save keeps `difficulty` (default `normal`; unknown values load as Normal) and `difficultyPicked`. The first Play, Campaign or Echo Trials entry on a new save opens the mode picker; the pause menu and Settings change it with `Logic.setDifficulty`. A change made mid-fight re-tunes the live foes (`FightSession.applyDifficulty`), and the game never changes the mode on its own. Every foe (campaign, Echo Trials waves, boss minions and clones) is built from `Logic.enemyStats(save, cfg, enemyId, { wave, role })` and `Logic.aiTuning(profile, { level, ng, difficulty, role })`. These depend only on the mode and the authored curve (`Logic.stageLevel`: chapter tier, stage position, survival wave, plus New Game+), never on the player's level, XP or gear. `AI_PROFILES` live in `10-data.js`.
- **Echo Trials** (replaces Survival; mode `'trials'`, data `TRIALS` in `10-data.js`). `Logic.echoTrialWave(save, n, rand)` says what wave `n` sends: `{ wave, foes, bossEcho, elite, env }`. `foes` are Hollow ids (`TRIALS.pool`, heavier units joining from later waves; one Hollow, then two from wave 4, three from wave 8); the first leads (the HUD bar) and the rest fight beside it as escorts, and the wave is cleared when the last is down. Every 5th wave is a boss echo `{ stageId, enemyId, name, kind }` drawn from `Logic.echoTrialBosses(save)`: every stage of kind `subboss`, `boss` or `echo` in `save.defeated`, so sub-bosses, the act bosses, the Witness and the Core echoes all count. It fights alone, as the real boss entry, in its own stage's arena. With no boss beaten that wave is an elite Hollow pack (a Husk leading, role `'elite'` in `Logic.enemyStats`: `TRIALS.elite` health and damage). The arena shifts through remembered places (`TRIALS.envs`) every 3 waves with a flat glitch (`FightSession.trialWave`). `rand` (default `Math.random`) makes every pick, so tests pass a fixed function. Rewards are `Logic.trialWaveReward(wave)` (coins every wave, a gem every 5); foes take the selected difficulty mode on top of the wave curve; the save keeps `trialsBest` (an older save's `survivalBest` carries over in `normalizeSave`). Tested in `tests/trials.test.js`.
- **Boss Rush** (mode `'bossrush'`, SAN-37; data `BOSS_RUSH` in `10-data.js`). `Logic.bossRushRoster(save)` returns `[{ stageId, enemyId, name, title, kind, chapter, available }]`: every `CAMPAIGN` stage of kind `subboss`, `boss` or `echo` (`TRIALS.bossKinds`) in story order, `available` once `save.defeated[stageId]` is set, so a boss added to the map joins on its own; `Logic.echoTrialBosses` is its available part. `Logic.bossRushRun(save, from?)` starts a run over the available bosses (from the stage `from` on), `{ stages, index, beaten, time, hp, done, cleared }`, or null when none is available. `Logic.bossRushConfig(save, stageId)` is the stage's own config (arena, chapter curve, foe name) in mode `'bossrush'`, whose `fightFormat` is always the story boss format (one round, one bar, phases, no clock) with `defeat: 'finisher'`: Takashi does not escape and the Witness is not reabsorbed, each just dissolves. `Logic.bossRushAdvance(run, { win, time, hp, maxHp })` moves to the next boss with `Logic.bossRushCarryHp(hp, maxHp)` (what was left plus `BOSS_RUSH.heal` = 30% of max health, capped), or ends the run on a loss or after the last boss. `Logic.applyBossRushResult(save, run)` pays `BOSS_RUSH.coins` (30) per boss beaten and keeps `save.bossRushBest` (`{ bosses, time }`: more bosses wins, then the faster time; normalised in `normalizeSave`). A run never clears stages, records defeats or fates, plays story scenes, or grants gear, gems or XP. The engine holds the run in `Game.rush` (`Game.startBossRush`, `finishBossRushFight`; `FightSession` takes `cfg.carryHp`); the roster screen and results are `UIManager.renderBossRush` / `showBossRushResult`. Tested in `tests/bossrush.test.js`.
- **Locked gear and stage rewards.** An item marked `exclusive` is never sold; `Logic.isLocked(save, kind, id)` is true until it is owned and `Logic.lockHint(kind, id)` is what the Armory shows (the item's `hint`, such as "Defeat Raikon", else the stage that rewards it). A campaign stage grants gear with a `reward` field:

  ```js
  { id: 'act1.boss', kind: 'boss', /* ... */, reward: { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] } }
  ```

  A stage can also pay gems instead: `reward: { gems: n }` (`Logic.stageRewardGems`) is paid into the save once ever, by `Logic.completeStage` on the stage's first clear when its lifetime `defeated` count was still 0 (returned as its `gems`; a New Game+ cycle's first clear pays only the usual first-clear gems and coins), on top of the usual first-clear gems; `applyFightResult` adds it to the result's `gems` and `stageRewardPreview` shows it on the stage card. The Core echoes use this (3 gems each, so 5 on the very first clear) and never list gear.

  `Logic.completeStage` (and so `applyFightResult` on a win) calls `Logic.grantStageReward`, which gives each listed item at level 1 exactly once: the first time the stage is cleared while the item is not owned. An item flagged `ngOnly` (Shinsei Yoroi) is only granted when the stage is cleared during New Game+ (its one source is the Epilogue's reward, so it drops the first time The Last Choice is finished in a New Game+ cycle). Granted items come back in the result's `gear` and in `unlocks` as `{ kind: 'weapons' | 'helmets' | 'armors', id }`, which the result screen and toasts show. Raikon's stage (`act1.boss`) gives Raikō no Tachi and the Raijin Kabuto; Akari's (`act2.boss`) gives Kagehira & Yūrei, the Mei-En Garb and **Shinsen** (its one source); the other boss and sub-boss updates add theirs (and the remaining sub-boss trophies).
- **Stretches.** A `stretch` stage is a side-scrolling level, data on its `CAMPAIGN` entry:

  ```js
  { id: 'prologue.1', kind: 'stretch', /* ... */, stretch: {
      length: 4600, start: 160,                       // level width (the screen is 1280) and Kage's start x; env? overrides the chapter's
      encounters: [{ x: 1250, gate: 1950, waves: [['hollow_shade', 'hollow_shade'], ['hollow_shade', 'order_footman']] }, /* ... */],
      clues: [{ id: 'clue1', x: 2450, label: 'A torn page' }] } }
  ```

  `Logic.stretch(id)` returns it (null for other stages) and `Logic.stageConfig` hands it to the engine, which then runs a `StretchSession` instead of the arena: no rounds and no timer, a follow camera (deadzone, look-ahead, clamped to the level), and parallax layers that repeat across the level. Encounters are cleared in order: `Logic.encounterAt(stretch, cleared, x)` says when Kage's x starts the next one, `Logic.stretchLimit(stretch, cleared)` is how far he may walk (the gate of the first uncleared encounter, else the end), and `Logic.isStretchComplete(stretch, cleared, x)` is reached at the end with every encounter cleared; the win goes through `applyFightResult` like any fight. An encounter locks a 1500-wide arena ending at its gate and spawns its 1–3 waves (each wave's foes all at once, from both sides, built by `Logic.enemyStats` like every foe); only the two nearest foes press the attack while the others circle. Clues are picked up by walking over them: `Logic.collectClue(save, stageId, clueId)` records `save.clues[stageId][clueId]` (kept through New Game+; unknown ids are dropped on load) and `Logic.cluesFound(save, stageId)` lists them. Stretches the story updates have not reached yet get placeholder content (`stretchDefaults` in `10-data.js`: two encounters drawn from the stretch's squad of four units in `SQUADS`, the last wave four foes, one clue). Authored stretches can also carry:
  - `tutorial: [{ step, at }]`: in-world prompts (a paper slip above Kage, `Renderer.drawTutorial`), one at a time and in order. A prompt shows once every earlier one is cleared and Kage has reached its `at`, and clears when he performs its action while it shows (`Logic.tutorialPrompt`, `Logic.advanceTutorial`). The steps are `TUTORIAL_STEPS` in `10-data.js` (`move`, `jump`, `slash`, `block`, `dodge`), and `Logic.tutorialLabel(step, device)` gives the keys for the input device in use: `keyboard`, `touch` (the touch buttons' captions) or `pad` (`InputManager.lastDevice`, which starts as `touch` on a touch screen).
  - `props: [{ type, x }]`: set dressing drawn in the world (`house`, `shrine`, `collapsed`, `edict`, `barricade`, the City of Echoes' `echo_house`, `lantern_post` and `sign`, the Fortress of Silence's `banner`, `conduit` and `record_shelf`, and the Memory Core's `fragment` and `shard`, both with an `alt` variant), and `ashTrail: { from, to }`: once every encounter is cleared, violet memory ash drifts up off the road between the two x.
  - An encounter's `mimicIntro: seconds`: its first wave stands in plain view mirroring Kage's idle stance, breathing and facing (as his mirror image) for that long, then attacks; it breaks early if Kage closes in or strikes it (`AIController.startMimic`, `Fighter.mimic`). The FIGHT mark lands when the copy breaks.
  The stretch's title banner shows after its `before` scene, never frozen behind it.
- **The Prologue** (`prologue.1`, *The Empty Village*, `tests/prologue.test.js`): Hoshimura (env `hoshimura`). The `before` scene `prologue.open` holds the one video card; Kage wakes remembering the sword but not why. The road teaches move, jump, slash, block and dodge, and holds three clues, each with its scene: the broken recording ("Find the Witness", `prologue.clue.recording`), the photograph in a burnt-out house (`prologue.clue.photograph`, flag `prologue.photo_found`) and the second message ("If you remember everything, he will find you.", `prologue.clue.message`). One Hollow with `mimicIntro` is the only fight: `hollow_tutorial`, a Hollow Shade in look and family (flagged `tutorial`, used only here) with far lower damage and some lower health, so a new player is not killed on any mode; then the memory-ash trail, and the `after` scene `prologue.close`. Clearing it unlocks `act1.stretch1`. The Prologue never says who planted the clues or who "he" is.
- **Regular enemies.** Two families (`ENEMY_FAMILIES` in `10-data.js`), each with one unit of every type in `UNIT_TYPES` (`regular`, `agile`, `defensive`, `ranged`, `heavy`); a unit's `unit` is also its `AI_PROFILES` profile, and units have no personal names. **Order of Silence:** `order_footman`, `order_runner`, `order_shieldbearer`, `order_chainthrower`, `order_ironclad`: armoured samurai in fox masks: a lacquered dō laced in crimson over a slate-tinted gi, a hood or kabuto per type, the Order mark (`22-anime-order.js`). **Hollows:** `hollow_shade`, `hollow_flicker`, `hollow_ward`, `hollow_mimic`, `hollow_husk`: torn spectral samurai in near-black cloth with a violet cast and cracked mask fragments (`23-anime-hollow.js`), whose fill flickers between close tones and whose frames now and then glitch (the body skips sideways, a pale ghost and a jittering outline double it). A beaten Hollow never ragdolls: it freezes, comes apart into flat violet memory-ash flakes (`Effects.memoryAsh`) and fades out (`FightSession.dissolve`). The family palette lives on `ENEMY_FAMILIES`; the hood, helm, shard and uniform looks are `order_hood`, `order_kabuto`, `hollow_shard`, `order_garb`, `order_plate` and `hollow_rags`, drawn by the Order and Hollow anime modules. Stretches mix them per chapter (the Order holds Act I, Hollows gather in Act II, rise through the Fortress in Act III's later stretches and take over the Core), Echo Trials sends only Hollows (`TRIALS.pool`), and bosses summon `Logic.minionId(cfg)` (`BOSS_MINIONS`: Order footmen, Hollow Shades in Act II and the Core). `tests/enemies.test.js` holds that every enemy id the campaign, stretches, survival and minions name exists and that both families have all five unit types.
- **Story scenes.** A scene is pure data in `SCENES` (`src/js/12-scenes.js`): an ordered list of steps.

  ```js
  'prologue.open': { memory: false, steps: [
    { video: 'Kage wakes in the ashes of Hoshimura ...' },          // the ONE video placeholder card (Prologue only)
    { illus: 'hoshimura_ruins', caption: 'Hoshimura. What the fire left of it.' },  // full-screen illustration (+ narration)
    { say: 'kage', text: '...Ash. Still warm.' },                    // dialogue line (optional name, memory)
    { wait: 0.6 }, { flag: 'prologue.photo_found' }, { illus: null } ] }
  ```

  Scenes attach by id: a `CAMPAIGN` stage takes `scenes: { before, after, defeat }` (`before` as the stage starts, `defeat` the moment the foe is beaten and before the outro, `after` after a won stage and before the result screen; a `scene`-kind stage such as the Epilogue is just its `before` scene), and a stretch clue takes `scene`. `Logic.stageScene(stageId, hook)` and `Logic.clueScene(stageId, clueId)` answer which scene plays; `Logic.markSceneSeen` / `isSceneSeen` keep `save.seenScenes` and `Logic.setStoryFlag` / `storyFlag` keep `save.storyFlags` (a skipped scene still sets its flags). Seen scenes still replay every time. Speakers (`kage`, `rem` (young), `rem_adult` (the Epilogue), `takashi`, `raikon`, `akari`, `witness`, `narrator`, `recording`, `survivor`, `order`) and illustrations (`hoshimura_ruins`, `photograph`, `memory_ash`, `memory`) live in `src/js/52-story-art.js`; add new ones there. `StoryPlayer` freezes gameplay while a scene plays: one press (Enter, Space, J, K, U, a tap, gamepad A/X/Y/RB) finishes the line, the next advances, and Skip (Esc, P, the Skip button, gamepad Start/Back) ends the scene. `tests/story.test.js` holds that exactly one video step exists in all scene data and that every speaker and illustration a scene names exists.
- **The story boss format.** `Logic.fightFormat(cfg)` (also `stageConfig(...).format`) says how a fight is staged: `{ name, roundsToWin, timer, phases, defeat }`. Story boss stages (kind `boss`, or a stage with `format: 'boss'`, which sub-bosses may use) are `boss`: ONE round, ONE health bar, three phases and `timer: 0`, so no round clock and no time-out loss. Other arena fights are `duel` (best of three, 75 s), Echo Trials waves `trials` (90 s; a boss-echo wave, `fightFormat({ mode: 'trials', bossEcho })`, has `timer: 0` and its boss's phases, so a story boss echo is never decided on time), stretches `stretch`. A boss's phases are data on its `ENEMIES` entry: `phases: [{ name, at, abilities, ...flags }]`, where `at` is the health fraction the phase opens at (1, 0.66, 0.33 by default; `Logic.bossPhases(id)`, `Logic.bossPhaseAt(id, hpFraction)`), and the boss bar draws a divider at each. How a beaten boss leaves is `defeat` on the entry (`Logic.BOSS_DEFEATS`, `Logic.bossDefeat(id)`): `'finisher'` (full-screen finishing slash, the `defeat` scene, then a violet-ash dissolve), `'escape'` (he kneels, no killing blow, the `defeat` scene, then he leaves in smoke) or `'reabsorb'` (the Witness: after the finishing slash and its `defeat` scene its chest core shatters into flat shards, violet and white light streams flow into Kage, Kage glows, and its fragments come apart into memory ash; `FightSession.stepReabsorb`). Winning a story boss stage (kind `boss`: Raikon, Akari, Takashi and the Witness; `Logic.isStoryBossStage`) records the boss's fate in `save.bossFates[stageId]` (sub-bosses and the Core echoes have none, and `normalizeSave` drops any it finds) (`'killed'`, `'escaped'` or `'reabsorbed'`, kept through New Game+; `Logic.bossFate(save, stageId)`, also `completeStage(...).fate`). `FightSession.bossExit` (60-engine.js) plays the exit. The dialogue-panel line a beaten placeholder says is `defeatLine`.
- **Raikon** (`raikon`, Act I boss, `tests/boss.test.js`): heavy armour (light hits never make him flinch) and no throws, Raikō no Tachi (`raikon_tachi`, the enemy copy of the boss weapon), Raijin Kabuto, layered plates (`raikon_plate`) and a long dark scarf (`longScarf`). His abilities (`BOSS_ABILITIES` in 40-ai.js) all wind up for about `0.6 × Logic.aiTuning(...).windup` seconds with a readable pose, white eyes, a heated red groove, crackling red lightning and a red glint before release: **Thunder Swing** (a wide flat arc and a travelling ground wave, WeaponSystem `thunderwave`: jump it or dash through it; in phase 3 the phase's `secondWave` delay sends a second wave late), **Storm Break** (overhead strike and a short ground shockwave) and **Redline Counter** (from phase 2: a guard stance; a melee hit on it is turned aside and punished with a fast diagonal cut). His scenes are `act1.raikon.before` and `act1.raikon.defeat` (the defeat scene sets the story flag `act1.access_token`). Red lightning is the `redline` element and `Effects.lightning` (hand-drawn branching bolts redrawn every other frame). The player's Raikō no Tachi rage art is **Thunder Swing** (`SPECIAL_IMPL.thunderSwing`).
- **Akari** (`akari`, Act II boss, City of Echoes, `tests/akari.test.js`): a former intelligence operative, slim and compact, charcoal (`body`, her flat fill) with muted violet: tied hair and a half-mask (`akari_mask`, the tail is cloth), the Mei-En Garb (`mei_en`: layered chest plates and split cloth panels at the hip), and Kagehira & Yūrei (`akari_blades`; `twin` weapons draw two different blades, `twinShape` in 20-fighter.js: Kagehira straight with a bar guard, Yūrei curved with a ring guard). Her blades' element is `petal`, a narrow violet slash. Her moves' numbers are `AKARI_MOVES` in `10-data.js` (`Logic.akariMove(id)`; each ability takes an optional override object so Act II's sub-bosses can reuse them), and every tell is `windup × Logic.aiTuning(...).windup` with white eyes, a held pose and a violet glint: **Twin Fang** (blades drawn low, then two quick alternating cuts), **Smoke Step** (smoke curls at her feet, she vanishes into a COMPACT puff, `Effects.smokePuff`: a few flat layered discs, gone in 0.5 s, and steps out of another a short way off to cut), **Blink** (short-range teleport: a violet marker on the floor shows where she lands, `Effects.groundMark`; twice in phase 3), **False Opening** (an afterimage, guard down, at half opacity with offset echoes, `FightSession.spawnDecoy`; any blow passes through it and it vanishes, `strikeDecoy`; the real Akari steps out behind Kage and punishes) and **Petal Cross** (phase 3 signature: blades crossed before her face while petals gather, then a dash with two crossing cuts and a narrow violet X, `Effects.petalCross`). Phases: Quiet Blade (Twin Fang, Smoke Step), False Opening (+ Blink, False Opening), Petal Cross (+ Petal Cross). Scenes `act2.akari.before` and `act2.akari.defeat` (her dying reveal; the illustration `shinsen` and the story flag `act2.shinsen_received`). Her stage gives Kagehira & Yūrei, the Mei-En Garb and Shinsen (see below); the weapon's rage art is **Smoke Step** (`SPECIAL_IMPL.smokeStep`: Kage vanishes into a puff, leaves an afterimage the foe turns to, and cuts twice from behind it).
- **Takashi** (`takashi`, Act III boss, Fortress of Silence, `tests/takashi.test.js`): the father. Long tied-back hair (`hair` on his entry: a cloth tail under the brim), his Kasa, the Shinsei Yoroi drawn as layered dark robes with a crossed collar, a waist guard of gold-edged plates, one small shoulder guard and a small gold family crest (look `shinsei`; wearing it grants nothing), a dark obi (`outfit: 'gi'`, `sash`), and a PLAIN blade (`takashi_blade`, the `katana` shape, never Shinsen) that cuts with Shinsen's forms (`sh1`-`sh3`, air `sha`, counter `shc`) and gold trails. His moves' numbers are `TAKASHI_MOVES` in `10-data.js` (`Logic.takashiMove(id)`; each ability takes an override object for Act III's sub-bosses); every tell is `windup × Logic.aiTuning(...).windup` with white eyes, a held grounded pose, gold embers on the blade and a gold glint: **Earth Cleave** (blade dragged low behind him, then one heavy low-to-high cut that steps in and launches), **Ground Smash** (overhead, then a downward impact with a gold ring and a SHORT shockwave), **Guard Return** (a low guard; a melee blow on it is turned aside and answered with a rising cut after a short gold glint) and **Final Flow** (phase 3: the shared runner at `dmg` 1.5, about 37 base damage for the sequence, blockable except the finisher). Guard Return reads predictability: `Logic.readsPattern(history, moveId)` (the same move three times running, or half of the last eight, `PATTERN_READ`) over `FightSession.history` (`FightSession.predictability` is `Logic.predictability`); when Kage starts an attack that is a pattern, `AIController.readStrike` raises the guard at once ("HE READS YOU"), at the mode's `punish` chance; varied attacks are never read. He also runs the family form in his own `takashi` style (long stance, measured gap, one aerial, `sh3` flow, `tempo` 1.12, `moves` swapping in Shinsen's `family` cuts). Phases: The Grounded Stance (Earth Cleave, Guard Return), The Father's Weight (+ Ground Smash), The Master's Flow (+ Final Flow). `defeat: 'escape'`: he kneels, `act3.takashi.defeat` reveals Rem bound to the Memory Core for ten years and sets the story flag `act3.core_route`, then he leaves in smoke (fate `escaped`). `act3.boss` rewards only the **Kasa**; the Shinsei Yoroi stays New Game+ only (the Epilogue's ngOnly reward).
- **The Witness** (`witness`, final boss, `core.witness`, `tests/witness.test.js`): Kage's original consciousness, stored in the Echo System. Tall, thin and almost weightless (it hovers a hand's width off the floor); a black face behind a cracked mask plate with white eyes under a swept crown of black spikes and long violet strands (helmet `witness_mask`, the eyes flare on a tell; `29w-anime-witness.js`), the Kysmei Robe (look `kysmei`: a narrow dark under-robe with flat shards drifting round the body, `Fighter.drawKysmei`; the player gets the same look once the Epilogue grants it) and a bright core in its chest (`core`, `Fighter.drawCore`). Its outline glitches (a violet double, too tall and too thin) and now and then flickers to Kage's own design, spiky hair, coat and red scarf (`kageFrame`, `Fighter.witnessFlicker`; every other slice while it copies him). Its blade is **Mugen no Ha** (`mugen_shards`, enemy-only, never the real `mugen_no_ha`): `mirrorWeapon` makes it take whatever Kage holds (`AIController.mirrorWeapon`: move-set, stance, reach; fists when he is disarmed), drawn as floating memory shards in that weapon's shape that scatter and re-form on a change (`drawShardWeapon`); it cannot be disarmed. All its cuts are the `void` element (violet over near-black). Its numbers are `WITNESS_MOVES` and `WITNESS_CORRUPT` in `10-data.js` (`Logic.witnessMove(id)`); every tell is `windup x Logic.aiTuning(...).windup`.
  - **Mirror** (phase 1, and phase 3): `FightSession.hitLog` records the player's moves (`{ id, t, hit }`, `hit` when the move landed on the boss). Its attacks replay Kage's latest string with his own timing (`Logic.mirrorSequence`, played by `AIController.startPlayback`), and while it waits it walks as his mirror image (he steps in, it steps in; he blocks, it blocks).
  - **Echo Replication** (all phases): `Logic.echoReplication(log)` cuts the log into strings (moves `ECHO_REPLICATION.gap` = 0.7 s apart or less; throws and grabs never count) and copies the LATEST string that landed, its last 5 moves. After a held tell with Kage's silhouette ghosting over it, it plays that string back. Landing the same string 3 times running (`repeats >= spam`) is spam: the playback hits harder (`punishMul`) and the first move of that string is read the moment Kage starts it (`AIController.readEcho`: a violet Guard Return, "I KNOW THIS ONE").
  - **Void Slash** (all phases): from up to 900 away, one sweep leaves a dark afterimage line across the floor ahead at chest height; it trembles and thickens for `delay` (0.62 s, longer on Easy) and then cuts (`FightSession.spawnVoidLine`, `Effects.voidLine`). Jump it, dash through it or step off it.
  - **Memory Break** (phase 2): the arena becomes a remembered place for 4.2 s (`Logic.memoryBreakEnv(n)`: Hoshimura, the City of Echoes, the Fortress, the training yard, in turn; `FightSession.memoryBreak`), under the memory filter, with a flat glitch in and out. **Hollow copies** (phase 2): one or two `hollow_kage` (a Hollow-styled silhouette of Kage holding his weapon; 70 health as a minion), never more than two alive.
  - **Identity Collapse** (phase 3): copied Kage moves (mirror and Echo Replication) mixed with Takashi's Earth Cleave, Ground Smash and Guard Return corrupted (`WITNESS_CORRUPT`: his ability code with an override object, a violet `tint` for every gold accent and glitch frames, `corruptUntil`).
  - Scenes `core.witness.before` (the reconstruction: the memories were real fragments, their order and context arranged; its "the system was testing whether you could be restored" is its own shifting framing) and `core.witness.defeat` (the core shatters, its light flows back into Kage; story flag `core.identity_restored`, which The Last Choice reads). `defeat: 'reabsorb'`, so the win records the fate `reabsorbed`. `core.witness` grants NO gear: Mugen no Ha and the Kysmei Robe are the Epilogue's.
- **Act III, The Father's Sin** (`act3.*`, `tests/act3.test.js`): four authored stretches through the Fortress of Silence, the Order's seat, all in env `fortress` (a slate night, the keep's crenellated towers, an inner stone wall hung with slate Order banners and run through with violet memory conduits, a flagstone floor with a conduit seam pulsing under it): *The Outer Gate*, *The Hall of Records*, *The Conduit Galleries* and *The Last Stair*. The hardest regular encounters in the game (18, 19, 20 and 28 foes, waves of up to five): mostly the Order's elite (shieldbearers, ironclads, chainthrowers), with Hollows rising wherever the Echo System runs through the walls (1, 3, 8, then 11). Props `banner`, `conduit` and `record_shelf`. The `before` scenes build toward Takashi being alive without touching his reveal: a gate guard who says the Founder signs the orders, the Order's ledger naming TACHIBANA TAKASHI with DECEASED struck through and IN RESIDENCE written beside it, a conduit carrying his voice live (speaker `recording`, named "A voice in the conduit"), and a wounded guard on the last stair. One optional clue, the night watch's duty roster (`act3.clue.roster`, flag `act3.roster_found`). Each stretch ends in a sub-boss (`format: 'boss'`, one bar, two phases, `defeat: 'finisher'`) who wears and drops a trophy:

  | Stage | Sub-boss | Style | Reduced Takashi move | Trophy |
  |---|---|---|---|---|
  | `act3.sub1` | Gonryu, the Gate Warden (`gonryu`) | heavy kanabo, armoured | Gate Smash (slower Ground Smash, stubby shock) | Tetsumon-dō (armour) |
  | `act3.sub2` | Shizune, the First Disciple (`shizune`) | defensive katana; Takashi's first student, runs a slower `disciple` family form | Still Return (shorter guard, longer beat, blockable cut) | Deshi Tenugui (helmet) |
  | `act3.sub3` | Moro, the Conduit Warden (`moro`) | conduit naginata; half a Hollow from listening to the conduits | Conduit Cleave (slow, short Earth Cleave), then a teleport | Kudamaki-dō (armour) |
  | `act3.sub4` | Soma, the Silent Blademaster (`soma`) | long katana; the Order's first sword, Takashi's war comrade | Severing Cleave, then Severing Return | Mokushi Kabuto (helmet) |

  The reduced moves are `TAKASHI_VARIANTS` in `10-data.js` (a `base` of `earthCleave`, `groundSmash` or `guardReturn` and the numbers merged over `TAKASHI_MOVES[base]`); `40-ai.js` registers each as a `BOSS_ABILITIES` entry that calls Takashi's own ability with that override object (a Guard Return variant keeps his `cond`, and `AIController.readStrike` raises it when Kage repeats an attack, "READ"). `Logic.takashiDerived(id)` gives the numbers a move runs with plus `{ base, reduced }` (null for non-Takashi moves). The tests hold that no sub-boss has Final Flow, that every reduced move winds up longer than his and hits lighter, and that a reduced Guard Return's cut can be blocked.
- **Act I, The Missing Brother** (`act1.*`, `tests/act1.test.js`): four authored stretches through Yomi's outer districts, where the Order has erased the Silent War: *The Silent Ward* (`rooftops`), *Checkpoint Row* and *The Archive Road* (`districts`, a rainy variant of the rooftops) and *The Burned Registry* (`wasteland`). Mostly Order soldiers with a few Hollows, more foes each stretch (9, 12, 15, 16), new props `edict` (an Order notice board) and `barricade`. Each stretch's `before` scene is a story beat (survivors: Rem was declared dead ten years ago; the Order Herald: Rem betrayed Kage and helped erase his memories), and the act's three clues each play a scene: the torn mission report (`act1.clue.report`), the two sword marks (`act1.clue.marks`) and Takashi's recording ordering the Core evacuated (`act1.clue.recording`). Each stretch ends in a sub-boss stage with `format: 'boss'` (one bar, one or two phases, `defeat: 'finisher'`), whose `reward` is its trophy:

  | Stage | Sub-boss | Style | Reduced Raikon move | Trophy |
  |---|---|---|---|---|
  | `act1.sub1` | Kuroe, the Ink Censor (`kuroe`) | defensive staff | Censure (short, blockable Redline Counter) | Sumi Eboshi (helmet) |
  | `act1.sub2` | Garan, the Stormbroken (`garan`) | heavy gauntlets, armoured | Storm Fist (slower Storm Break, stubby shock) | Ikazuchi-dō (armour) |
  | `act1.sub3` | Hisame, the Rain Courier (`hisame`) | agile fans | Lightning Cut (Thunder Swing's cut as a dash, no wave) | Hisame Zukin (helmet) |
  | `act1.sub4` | Shiden, the Last Lieutenant (`shiden`) | spear | Vanguard Break (lighter Storm Break), then Hold the Line (blockable counter) | Shiden Yoroi (armour) |

  The reduced moves are data (`RAIKON_VARIANTS` in `10-data.js`): each names its `base` Raikon ability and the parameters it runs with (wind-up, damage, reach, shock, stance, `wave: false`), and `40-ai.js` registers it as a `BOSS_ABILITIES` entry that calls Raikon's own code. `Logic.raikonMove(id)` says which Raikon move an ability derives from and whether it sends a Thunder Swing wave (only Raikon's own does); `Logic.bossAbilities(id)` lists a foe's abilities across its phases.
- **Act II, the City of Echoes** (`act2.*`, `tests/act2.test.js`): four authored stretches through a district rebuilt from stored memories, all in env `echoes` (the rooftops under a violet-sepia memory wash, ghost buildings half-loading over the skyline, memory tiles on the road): *The Repeating Street*, *Lantern Row*, *The Two-Ended Bridge* and *The Unfinished Ward*. Mostly Hollows (10, 12, 15, 17 foes; two Order runners in all). The reconstruction shows in two rules, both in `Logic`:
  - **Streets repeat.** A stretch's `loop: { from, period, count, block: [{ type, dx, ... }] }` lays the same street block down `count` times; `Logic.streetProps(stretch)` expands it (with the hand-placed `props`) into what the road shows, sorted by x, and puts a `seam` where each repeat begins. A seam is drawn as a sliced, misregistered violet tear (on top of whatever stands there), and crossing one makes the frame skip for 0.3 s (`StretchSession.updateEchoes`, `Renderer.drawGlitch`; off with Reduce flash). Every lantern swings at the same angle.
  - **Signs change off screen.** A `sign` block item has an `id` and `texts`; all its copies are one sign. `Logic.signStep(state, visible)` advances it each frame and `Logic.signText(sign, state)` is what it reads: the next text each time the sign comes back into view after leaving it, never while watched (so walking on, each repeat of the street shows the sign changed: TACHIBANA TEA HOUSE, ... · CLOSED, NO TACHIBANAS HERE, WELCOME HOME).
  Each stretch's `before` scene has two residents (speaker `resident`, a memory-rebuilt face with a doubled outline) telling the same event two ways; the one clue is two teacups (`act2.clue.cups`, flag `act2.cups_found`). Nothing in them gives away Akari's reveal. Each stretch ends in a sub-boss (`format: 'boss'`, one bar, two phases, `defeat: 'finisher'`) who wears and drops a trophy:

  | Stage | Sub-boss | Style | Reduced Akari move | Trophy |
  |---|---|---|---|---|
  | `act2.sub1` | Tsugumi, the Memory Courier (`tsugumi`) | agile, courier kunai | Courier Step (slower Smoke Step, smaller puff, shorter step) | Hakobi-gasa (helmet) |
  | `act2.sub2` | Sayo, the Quiet Hand (`sayo`) | defensive, kodachi; Akari's former pupil | Half Fang (Twin Fang with a long tell, light cuts) | Shirabe-dō (armour) |
  | `act2.sub3` | Utsushi, the Borrowed Face (`utsushi`, a Hollow) | agile, echo crescents; imitates an operative | Stolen Blink (one short Blink, never chained), then Stolen Fang | Utsushi-men (helmet) |
  | `act2.sub4` | Kasane, the Ledger Warden (`kasane`) | ledger kusari; Akari's old field partner | Ledger Fang, then Ledger Step (short Smoke Step) | Kasane Haori (armour) |

  The reduced moves are `AKARI_VARIANTS` in `10-data.js` (a `base` of `twinFang`, `smokeStep` or `blink` and the numbers merged over `AKARI_MOVES[base]`); `40-ai.js` registers each as a `BOSS_ABILITIES` entry that calls Akari's own ability with that override object. `Logic.akariDerived(id)` gives the numbers a move runs with plus `{ base, reduced }` (null for non-Akari moves). The tests hold that no sub-boss has False Opening or Petal Cross, and that every reduced move winds up at least as long as hers, hits no harder and repositions no further.
- **Shinsen and Final Flow** (`tests/shinsen.test.js`). Shinsen ("True Flash", `WEAPONS.shinsen`), Takashi's abandoned odachi, is granted once by `act2.boss`'s `reward` (through `Logic.grantStageReward`; no other stage lists it). Boss tier (150/120/132 = 402 against the best shop total of 258, so ≥ 1.5×), fixed at level 1. It keeps `base: 'kagetsu'` only so `weaponMul` measures its damage against Kagetsu's; the moves are its own (`sh1` heavy opening cut, `sh2` rising cut, `sh3` broad horizontal flow, air `sha`, counter `shc`; `family: { rise, aerial, flow }` names them as the father-style variations of the family form for Takashi). Longer start-up and recovery than Kagetsu (about 1.5× once the speed multiplier applies), broader boxes, more damage, heft 1.6 (vs 1). `Logic.weaponMoves(id, lvl)` lists a weapon's string as it plays (`startup`, `active`, `recovery`, `dmg`, `reach`) so blades can be compared. Its look is the `shinsen` shape in `drawWeaponShape` (20-fighter.js; also the Armory art): long gold-wrapped tsuka, simple round tsuba rimmed in gold, gold habaki and spine line, and the family mark (a small ring around a dot) near the guard. Element `gold` (35-vfx.js): gold smears, sparks and impacts.
  **Final Flow** is its rage art: `FINAL_FLOW` in `10-data.js`, read with `Logic.finalFlow(o)` (a copy, `o` merged over the top level). A short gathering stance (`windup`), then `cuts` in order: rising, overhead, a diagonal after stepping through to the target's other side (`cross`), a back diagonal, a held beat, and ONE horizontal `finisher` (impact frame, gold finisher slash, `freeze` seconds of hit-stop, then `slow` seconds of slow motion). One runner performs it, `finalFlow(f, world, o)` in `30-combat.js`; `o` = `{ tune, target, dmgMul, banner, armor }` (`tune` goes to `Logic.finalFlow`). The player's rage art is `SPECIAL_IMPL.finalFlow` (`{ banner: true, dmgMul: weaponMul(...).dmg }`, every cut unblockable). A boss calls the same sequence by listing `finalFlow` in a phase's `abilities`, or from its own AI with `BOSS_ABILITIES.finalFlow.run(f, world, ai, p, o)`: its numbers are `TAKASHI_MOVES.finalFlow` (tell `windup` 0.62 s × `Logic.aiTuning(...).windup`, with white eyes, gold embers, a glint and super armour; the cuts blockable except the finisher, `unb: 0, unbFinisher: 1`; `dmg` 1.5); pass `o` (for example `{ windup: 0.8, dmg: 1 }`) to retune it.
- **The family form** (`FAMILY_FORM` in `10-data.js`, `Logic.familyForm(style)`): Takashi's sword grammar, shared by Kage, Rem and Takashi. `pattern` is the form once, in order: grounded opening **stance**, short **dash**, **rising** cut (`k2`), **aerial** follow-up (jump + `ka`), controlled **landing**, then the finishing horizontal **flow** (`k3`). Each step has an `act` (`stance`, `dash`, `move`, `air`, `land`) and, for cuts, a `move` (a `MOVES` id). `styles` say how a fighter runs it: `gap` (seconds between steps), `hold` (the opening stance), `aerials` (how many aerial follow-ups; later ones go off the double jump), `flow` (the finishing moves in order) and `tempo` (a multiplier on each cut's start-up and recovery). `kage` is tight and defensive (`gap` 0.2, one aerial, `flow: ['k3']`); `rem` is fast and fluid (`gap` 0.04, two aerials, `flow: ['k1', 'k3']`, `tempo` 0.72). `Logic.familyForm(style)` expands a style into `{ name, style, tempo, steps: [{ step, act, move?, wait }] }` (unknown styles run Kage's). An enemy with `form: '<style>'` on its `ENEMIES` entry runs it as a scripted chain from dash range (`AIController.startForm` / `stepForm` in `40-ai.js`: each step fires as soon as the fighter can perform it, getting hit breaks it off, and `tempo` applies through `Fighter.boostAtk`). The player's bokken string (`k2` into `k3`, air `ka`) is the same grammar under the player's hands. Hollow Rem (Core) reuses `rem`. `takashi` is the heavier root (`gap` 0.3, `hold` 0.75, one aerial, `flow: ['sh3']`, `tempo` 1.12); a style's optional `moves` (`{ rise, aerial }`) cuts those steps with other moves, here Shinsen's `family` cuts (`sh2`, `sha`). `tests/spar.test.js` holds that every step's move exists and that Rem's version is faster.
- **The Interlude spar** (`interlude.spar`, kind `spar`, `tests/spar.test.js`): young Kage (the player) against young Rem (`young_rem`, AI, a purple sash and headband, `form: 'rem'`) in Takashi's training yard (env `yard`), drawn through a memory filter (`Renderer.drawMemoryFilter`: colour drained toward warm sepia, a soft vignette, violet memory flecks; `FightSession.memory`). Both fight with the **bokken** (`WEAPONS.bokken`, katana forms at half damage, never sold). Young Kage is `Logic.youngKage()`: fixed health, the bokken, a pale headband and training clothes, none of the player's gear, level or perks (`makeYoungKage` in `20-fighter.js`; the pre-fight screen hides the gear and weapon pickers). The stage is fought in the **spar format** (`Logic.fightFormat`: `{ name: 'spar', roundsToWin: 1, timer: 45, interruptAt: 0.3, preventKO: true }`, from `SPAR` in `10-data.js`). It never ends in a KO: `Logic.sparHealth` keeps every blow above 0 HP (`Combat.checkKO`), and when either brother falls to 30% health or the clock runs out (`Logic.sparOutcome` → `'interrupted'`) the fight freezes, Takashi calls the boys in (`FightSession.interrupt`) and the `after` scene plays. `applyFightResult` treats any spar result as completed with `outcome: 'interrupted'` and `winner: null`: the stage clears and opens Act II, but no win, loss or defeat (`defeated`) is recorded, so the stage cannot be lost. Its scenes (`interlude.spar.before` / `.after`, both `memory: true`) leave "who won?" open for the Epilogue.
- **The Core** (`core.*`, `tests/core.test.js`): the Memory Core, env `core` (a violet void with the Core's heart glowing far off, flat geometric shards and floating pieces of remembered places, columns of conduit light, and a road of memory with a violet edge laid across the void). *Into the Core* (`core.stretch1`) is Hollows only and the hardest Hollow mix in the game (21 foes, six of them Husks, a last wave of five; props `fragment`, `shard`, `conduit`, then an ash trail); its `before` scene `core.stretch1.before` has Kage come down the east lift while Raikon's, Akari's, Takashi's and Rem's voices bleed through. Then four echo fights the Core pulls out of Kage's journey, in order; each is a corrupted Hollow copy (family `hollow`: flickering violet fill, glitch frames, ash dissolve) with its original's silhouette (`echoOf`, the same helmet and armour drawings, a violet copy of the blade: `echo_tachi`, `echo_fangs`, `echo_nameless`, `echo_rem_blade`, all `void` element and enemy-only), fought in the boss format (`format: 'boss'`, one bar, two phases, `defeat: 'finisher'`), with a short `before` scene each:

  | Stage | Echo | Moves (CORE_ECHO_MOVES) |
  |---|---|---|
  | `core.echo1` | Hollow Raikon (`hollow_raikon`) | Hollow Thunder (Thunder Swing, its wave still running, violet; slower, lighter, never a second wave), Hollow Break (lighter Storm Break). No Redline Counter |
  | `core.echo2` | Hollow Akari (`hollow_akari`) | Hollow Fang (Twin Fang), Hollow Step (Smoke Step), and from phase 2 one Hollow Opening a fight (False Opening, one afterimage, `cd` 600). No Blink or Petal Cross |
  | `core.echo3` | Hollow Takashi (`hollow_takashi`) | Hollow Cleave (Earth Cleave), Hollow Return (a blockable Guard Return, still read by `readStrike`), and from phase 2 Broken Flow: a three-cut Final Flow fragment (rising, overhead, horizontal finisher) in the `void` element |
  | `core.echo4` | Hollow Rem (`hollow_rem`) | Rem's fast, flowing family form (`form: 'rem'`, the Interlude's style) on an adult build in a worn dark travel coat (`travel_coat`: a high collar, a purple front edge, coat tails as cloth) with his purple sash; `lunge` and berserk in phase 2 |

  `CORE_ECHO_MOVES` (10-data.js) runs each original's own ability code (`base`, from `of`'s kit) with the echo's numbers merged over the original's (Akari's and Takashi's tables; Raikon's are written out), a violet `tint` (`ECHO_TINT`) and `glitch`; `Logic.echoMove(id)` answers them (`{ id, base, of, corrupt: true, ... }`). Raikon's Thunder Swing and Storm Break, Akari's Twin Fang, Smoke Step and False Opening, and Takashi's Final Flow now take `tint` / `glitch` in their override objects like his other moves (`thunderwave` takes a `tint`, the Final Flow runner a `tint` and a shorter `cuts` list); a Hollow fighter's frames glitch harder while a corrupted move runs (`corruptUntil`). The echoes pay gems, never gear (`reward: { gems: 3 }`). Hollow Rem's `defeat` scene `core.echo4.defeat` is the fake-out breaking: the ash drifts toward the heart of the Core and Rem's voice says he is close. Beating Hollow Rem opens the Witness.
- **The Epilogue, The Last Choice** (`epilogue`, kind `scene`, `tests/epilogue.test.js`): no combat, one scene, `epilogue.last_choice`, played over the campaign map. The Core opens and the real Rem is inside: older and worn, in the Kurokumo Yoroi (speaker `rem_adult`: tired eyes, hair grown out, a dark high collar with one purple band and frayed cloth). He confirms he erased Kage's memories to stop Takashi making him the permanent controller, and stayed to keep the Core sealed. Kage hands him Shinsen (flag `epilogue.shinsen_returned`); shutting the system down frees the stored memories and ends the reconstructions, so they do it together (Kage's restored identity signature, Rem letting go of the Core); the reconstruction dissolves; the real Takashi's last transmission ("Memories may fade... but the choices you make will always remain."); the "So... who won?" / "I did." / "Keep dreaming." exchange pays off the Interlude; two swords at the ruined entrance, Rem gives Kage the coat, two silhouettes walk into dawn, and the end card "Brothers until the end." Illustrations `epilogue_core`, `epilogue_handoff`, `epilogue_collapse`, `epilogue_swords`, `epilogue_dawn` and `end_card` (an illustration step may carry `card` text, which StoryPlayer hands the painter as `paint(g, { card })`).
  Its `reward` is the post-story gear, each granted once through `Logic.grantStageReward` when the scene ends: **Mugen no Ha**, the **Kysmei Robe** and the **Kurokumo Yoroi** (`givenBy: 'Rem'`, so its toast reads "Given by Rem"), plus the **Shinsei Yoroi**, which is `ngOnly`: it drops only when the Epilogue is finished during New Game+, never in the first cycle. New Game+ unlocks with the first finish, as before.
  **Echo Replication** is Mugen no Ha's rage art (`SPECIAL_IMPL.echoReplication` in 30-combat.js, numbers `ECHO_ART` in 10-data.js): `Logic.echoArt(log, weaponId)` takes Kage's latest landed string from the fight's hit log (`FightSession.hitLog`; `landed` marks a blow on any foe, `hit` one on the boss) through `Logic.echoReplication`, keeps the grounded strikes, and falls back to the blade's own string when nothing has landed. Kage holds a casting stance, untouchable, while a phantom memory-shard copy of him (`hollow_kage`'s Hollow look, his weapon, team 0, `clone` so the session cleans it up) appears beside the foe and replays the moves, unblockable, at ×1.3 with the last one the ×2 finisher, then comes apart into memory ash.
- In the browser console it is available as `KAGE.Logic`.

Run the tests (Node 18+, no dependencies, built-in test runner):

```bash
node --test tests/
```

How the tests load the code: `tests/helpers/load-logic.js` reads `10-data.js`, `12-scenes.js` and `15-logic.js`, joins them in build order and runs them as one strict-mode function, exactly as the build's IIFE would, then returns `{ Logic, CAMPAIGN, ENEMIES, WEAPONS, HELMETS, ARMORS, GEAR_MAX, TRIALS, AI_PROFILES, SCENES, MOVES }`. Every call gives fresh copies. If the logic module ever needs another pure module, add it to `PURE_MODULES` in that helper. Test files are `tests/*.test.js`; `tests/index.js` loads them all so `node --test tests/` works on every Node version (plain `node --test` also finds them). Tests drive `Logic` through its public functions only and check what a player would notice (coins earned, stages unlocked), with expected values written out by hand rather than recomputed.

---

## Character art

Every character is an anime samurai drawn in code on the gameplay skeleton (`Fighter.sk`): **a black face, softly glowing white eyes (no nose or mouth) and detailed dark samurai clothing**: layered charcoal and black cloth, dark metal armour, crimson embroidery, muted-silver weapon detail and a fine red rim light. The art only dresses the skeleton; no drawing code moves a joint, so combat, hitboxes and timing are untouched (`tests/gameplay-lock.test.js`).

- **The body** (`src/js/21-anime-body.js`): `celFill` draws each part as one closed path with a base tone, a shadow strip away from the light, an optional lit edge and the red rim; the part library builds sleeves, hakama, boots, mitten hands, coat panels on cloth chains and the face. On the flat passes (the outline, the inverted impact frame, the hit flash, afterimages, the Hollow glitch ghost) every part fills with the one colour it is given.
- **Skins**: `ANIME_SKINS` holds one entry per design (`animeSkin(f)` picks it by the def's id or `echoOf`); helmet and armour *looks* (`gearLook`) are drawn by part functions per family: the Order (`22`), the Hollows (`23`), the sub-bosses (`24`, `25`), Rem (`26`), Raikon (`27`), Akari (`28`), Takashi (`29`), the remaining shop gear (`29g`) and the Witness (`29w`). A boss's own gear keeps its look when Kage equips it.
- **Story art** (`52-story-art.js`): the speaker busts and story illustrations draw the live fighters; only the two civilians and close-ups are code-drawn, in the same palette.
- **Reference and records**: `docs/art-reference/` holds the style guide (`STYLE.md`), the inventory of everything that was redrawn (`INVENTORY.md`), the reference sheets, progress shots per ticket and the final verification (`VERIFICATION.md`).
- **Tests**: `tests/anime-coverage.test.js` holds that every fighter def, every equippable helmet, armour and weapon and every story figure resolves to the anime art, that flat passes stay one colour, and that the old stickman drawing code stays deleted.

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

A weapon that reuses another weapon's move-set names it with `base: 'mizuchi'` and needs only its own name, tier, stats, look and lore (see Shizuka and the boss weapons). A based weapon may still bring its own `moves`/`defs` (Shinsen): they are built as its own moves (ids must be unique) while `weaponMul` keeps measuring it against the base. Then:

1. Map its drawing in `SHAPE` in `src/js/20-fighter.js`, for example `storm_glaive: 'spear'`, or add a new shape case in `drawWeaponShape` (muted-silver steel on the normal pass, one flat colour on the flat passes; `tests/anime-coverage.test.js` checks both).
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

Then point a stage of the campaign map (`CAMPAIGN` in the same file) at it with `enemy: 'ronin_king'`, and give it an anime design: an `ANIME_SKINS.ronin_king` entry (and any new part functions) in one of the `src/js/2x-anime-*.js` modules. `tests/anime-coverage.test.js` fails for a def without one.

- **Abilities** come from `BOSS_ABILITIES` in `src/js/40-ai.js`: `lunge`, `teleport`, `smokeBomb`, `moonDash`, `clones`, `shieldBash`, `float`, `orbVolley`, `counterStance`, `barrier`, `timeAura`, `groundSlam`, `hook`, `charge`, `summon`, Raikon's `thunderSwing`, `stormBreak`, `redlineCounter`, Akari's `twinFang`, `smokeStep`, `blink`, `falseOpening`, `petalCross`, Takashi's `earthCleave`, `groundSmash`, `guardReturn` and `finalFlow` (see Shinsen and Final Flow; all four take an override object with `tint` and `glitch`, and Raikon's and Akari's take them too), the Core echoes' `hollowThunder`, `hollowBreak`, `hollowFang`, `hollowStep`, `hollowOpening`, `hollowCleave`, `hollowReturn` and `hollowFlow` (see The Core), and the Witness's `echoReplication`, `voidSlash`, `memoryBreak`, `hollowCopies` and `collapseCleave` / `collapseSmash` / `collapseReturn`. Write a new one with `f.startAbility({ dur, pose, update(f, world, t, dt) {...} })`.
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

## Effekseer VFX (Raikon's red lightning)

Raikon's effects are real Effekseer effects authored with the effekseer-vfx skill: recipes in `vfx/src/` (shared
palette and bolt builder in `vfx/src/_raikon.py`), briefs in `vfx/briefs/`, built `.efkefc`/`.efk` in
`vfx/effects/` and `vfx/exports/`, reviewed in the skill's Godot Lab (`vfx/godot/`). The game is Canvas 2D, so
`vfx/tools/export_game.py` bakes each built effect into a sprite sheet: it renders it alone on black in Godot
(`vfx/tools/GameSheet.gd`, in a temporary copy of the Lab project, side-on, with the Lab's HDR bloom), grades the
frames for additive play and writes `src/img/raikon_*.webp` and `src/js/34-vfx-sheets.js`.

After changing an effect: `vfx build --ids <ID>`, review it, then (with `GODOT` set to the Godot 4 executable)
`python vfx/tools/export_game.py` and `node build.mjs`.

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

Every character, name, weapon, environment, line of dialogue, animation and sound in KAGE is original. The UI follows the Wonder design file "Vole", with its static design figures replaced by the game's own anime fighters.

Typography uses five Google Fonts under the SIL Open Font License: Permanent Marker (brush titles), Cinzel (headings and boss names), Teko (menus and labels), Rajdhani (numbers) and a kanji subset of Yuji Boku (calligraphy marks). They are embedded inside `index.html` as data, so the game still loads nothing from the network and works offline and in Capacitor.

The elemental effects are original interpretations of elemental sword combat; no character techniques, assets or signature animations from other works are reproduced.
