# Brief for the fighting-style agents (KAGE combat redesign)

Repo: `E:\PROJECTS\KAGE\KAGE`. A single-file HTML5 canvas fighting game; source in `src/js` (concatenated in path order
into one scope by `build.mjs` and by the test loader, so every file sees every other file's top-level names).

## What the user asked for
"Redesign the combat system for each and every boss and each and every sub-boss. Sub-bosses a little harder, main
bosses harder, the small enemies easier. Spam attacks must be countered. Fluid movement. Parry, for Takashi especially
because both are samurai. On a critical hit pull the character back and pause the screen so it reads as a critical.
Follow martial arts: martial arts is a very big thing in our game."

## What is already built (the core; read it, do not edit it)
`src/js/13-budo.js` (read its header first, it is the contract; the fight-time functions of `Budo` are in
`src/js/14-budo-fight.js`, also frozen) plus hooks in 30-combat.js, 20-fighter.js, 40-ai.js,
15-logic.js, 60-engine.js:
- **Criticals** (`Budo.crit`, `Budo.critFx`, `Budo.reel`): counter-hits, back hits, the cut that answers a parry, any
  blow on a broken guard; bosses and sub-bosses also crit when they punish a whiff or when `style.crit(...)` says so
  (cool-down `BUDO.crit.foeCd`). A critical freezes the screen 0.26 s, then slow motion, and throws the struck fighter
  back on his heels.
- **Posture / kuzushi** (`Fighter.guard`, 100 full; `Budo.postureHit`, `Budo.breakPosture`): blocked blows and being
  parried cost posture; at 0 the guard breaks (`stun`, `f.broken`) and the next clean blow is a critical. A bar shows
  over a fighter whose posture is hurt.
- **Parry and the deflect duel**: Kage parries by raising guard within 0.15 s of the blow (`PARRY_WINDOW`); a parried
  foe reels (`BUDO.parryStun` by role, or `style.parriedStun`) and loses posture. When a foe parries Kage, his cut is
  *deflected* (`Budo.deflect`): a 0.46 s recoil that a fresh guard press ends after 0.14 s, so he can turn the answer
  aside in turn. The AI parries through `tune.parry` (see `AIController.respond`).
- **Anti-spam**: the spam read (`SPAM_READ`, `AIController.spamPunish`) for every foe; sub-bosses and bosses adapt to a
  move thrown three times running and parry it (`BUDO.adapt`); repeated moves do less damage and less posture damage;
  a guard held too long is thrown (`BUDO.turtle`).
- **Footwork**: sub-bosses and bosses step out of the pocket after a string and dash in to punish a whiff
  (`BUDO.footwork`, overridable per style).
- **Roles** (`BUDO.roles`): rank and file easier; sub-bosses and bosses get more health, damage and sharper AI.
- **FIGHT_STYLES** registry: one entry per foe. Fields: `art`, `tune`, `poise`, `postureRegen`, `parriedStun`,
  `footwork`, `strings`, `decide`, `respond`, `crit`, `on.{parried,parry,blocked,block,land,hurt,broken,critical}`,
  `init`. String steps: buttons (`punch kick weapon heavy grab jump dash special`), directional cuts (`w:up w:down
  w:fwd w:diagUp w:diagDown`), `fwd`, `back`, `wait:0.25`, `move:<MOVES id>`, `ab:<BOSS_ABILITIES id>`.
  See `AIController.stepSeq / tryString / decide / respond / attack` in 40-ai.js for exactly when each hook runs.

## Your job
For each foe you are given, design how it fights as a martial artist and register it in **your own new file**
`src/js/41-styles/<enemy id>.js` (`FIGHT_STYLES.<id> = { ... }`; the folder loads after 40-ai.js). Think about each
one as a person with a school: its weapon's real art (kenjutsu, iaijutsu, sojutsu, bojutsu, naginatajutsu, kusarigama,
tessenjutsu, karate / sumo for the unarmed and the heavy, ninjutsu for the assassins), its stance and distance
(ma-ai), its rhythm, what it does when it is blocked, parried, pressured, turtled against, and what the player must
learn to beat it. Every foe must feel different to fight, and none may be beatable by mashing one button.

Concretely, per foe:
1. `art` and a comment block describing the school, the game plan and how the player beats it.
2. `tune`: its temperament (aggression, guard, parry, dodge, reaction, combo length, preferred distance).
3. `strings`: its signature combinations (openers from range, pressure strings up close, a mix-up for a blocking
   Kage, an answer for an airborne Kage), using its weapon's real moves. Read its `WEAPONS` entry in 10-data.js
   (`moves`, `dirs`, `counter`, `air`) and the `MOVES` it names to know what it can throw. Telegraph the dangerous ones
   (`tell`). Strings must flow: each step should chain out of the last.
4. `decide` / `respond` / `on.*`: the behaviour that makes it a martial artist: answering a blocked blow with a
   throw or a guard-crushing overhead, punishing a parry attempt with a delayed cut or a feint, a riposte after its
   own parry (see `TakashiGuard.riposte` in 66-takashi.js for the shape of one), a counter stance, hit-and-away,
   pressing harder when Kage's posture is low (`p.guard`), backing off when its own is low (`f.guard`).
5. New techniques where the foe needs them: add `BOSS_ABILITIES.<newId> = { id, cd, range: [min, max], chance,
   cond?, run(f, w, ai, p) { f.startAbility({...}) } }` in your file (read three or four existing ones in 40-ai.js
   for the pattern: telegraph, pose function, `Combat.area(w, f, fbox(f, x, y, w, h), {dmg, kb, up, hs, imp, hsnd,
   kd, unb, stamp})`), and reach them from a string (`ab:<id>`) or from `decide`. Give every new technique a readable
   wind-up and a way to beat it (block, parry, dodge through, jump).
6. Difficulty: sub-bosses a little harder than before, main bosses clearly harder, but fair: hard because the foe is
   skilled, not because of raw numbers. Tune through `tune`, `poise`, `footwork`, cool-downs and strings first.

## Rules
- **Frozen files (read-only for you):** `00-core.js, 10-data.js, 11-sword-arcs.js, 12-scenes.js, 13-budo.js, 14-budo-fight.js,
  15-logic.js, 20-fighter.js, 30-combat.js, 34/35/37-vfx*.js, 40-ai.js, 50-world.js, 52-story-art.js, 55-title.js,
  60-engine.js, 65-splash.js, 67-rage-arts.js, 68-story.js, 70-ui.js, 90-main.js`, everything under
  `21-characters/` (other agents are redrawing the characters right now), `64-akari-*.js`, `63-akari-sakura.js`,
  `69b-witness-draw.js`, `tests/helpers/*`, `tests/snapshots/*`, `tools/*`, `build.mjs`, `index.html`. Several agents
  work in parallel, each on its own files; that is why. To change an existing ability or a data value of YOUR foe,
  override it from your own file at top level (it loads later): `BOSS_ABILITIES.someId = { ...new one }`,
  `Object.assign(ENEMIES.<id>, { hp: 700 })`, `ENEMIES.<id>.phases[1].abilities.push('newId')`,
  `SOME_TABLE.<key>.cd = 5`. Never change another foe's data, a shared table's shared values, `BUDO`, `SPAM_READ` or
  `AI_PROFILES`.
- If something can only be fixed in a frozen file (a bug in the core, a hook you need), do not work around it with a
  hack and do not edit it: finish what you can and describe exactly what you need in your report.
- Kage's own moves, controls and damage are not yours to change.
- Keep the story intact: boss phases, phase names, signature abilities and their fiction stay; you are improving how
  they fight, not replacing who they are.
- Simulation code must not depend on drawing. No `Math.random` at file top level.
- Use the Edit / Write tools. Never run `node build.mjs` without `--out <your scratch file>` (it would overwrite the
  shared index.html). Do not commit.
- Write scratch output only under `.scratch/<your agent name>/`.

## Testing and measuring
- `node tools/duel.js --foe <id> [--bot fighter|masher|turtle|parry] [--runs 8] [--log 1] [--nostyle 1]` plays a bot
  as Kage against your foe headlessly and prints wins, time, damage, parries, criticals, posture breaks, spam punishes,
  which abilities and style strings were used; `--log 1` prints the first run's event log; `--nostyle 1` is the same
  fight without your style (your baseline). Read `tools/duel.js`'s header.
- The bots are crude, so use them as a relative gauge, with these bands on Normal for the `fighter` bot:
  a sub-boss should beat it in roughly 40-65 % of runs; a main boss in roughly 65-85 % (never 100 %: if the bot never
  wins and deals under about a third of the boss's health, the boss is unfair, pull it back). The `masher` bot must
  lose clearly to every sub-boss and boss (spam punishes, adaptation parries and counter-hit criticals should show up
  in its log). The `turtle` bot must not survive by holding guard. Your style's strings and techniques must actually
  appear in the logs: if a string never fires, fix its range or conditions.
- Write a test file `tests/style-<group>.test.js` (node:test, `require('./helpers/load-sim.js')`, see
  tests/takashi-fight.test.js or tests/boss.test.js for how a fight is stepped headlessly) that checks: each of your
  foes has a style with an `art`; a fight against each runs for 60 game seconds without throwing; and one or two of
  its signature behaviours really happen (a seeded, scripted situation, not a statistical hope).
- Run `node --test tests/` before you finish. Expected to fail for now (do not fix, the orchestrator owns them):
  `tests/gameplay-lock.test.js` (recorded fights), the stat tests in `tests/difficulty.test.js`, `tests/trials.test.js`,
  `tests/prologue.test.js`, `tests/enemies.test.js`, and the two rank-and-file spam tests in `tests/combat-dir.test.js`.
  A test about YOUR foe that fails because you deliberately changed its behaviour: update that test to the new intent
  (only tests that belong to your foes; say which in your report). Failures in other foes' tests while other agents are
  mid-edit are not yours: ignore them, re-run later, mention what was still red at the end.

## Report back (short)
Per foe: the art and game plan in two or three lines, new techniques, what the player must do to win; duel numbers
(fighter / masher / turtle, with and without the style); files added or changed; tests added or changed; anything you
need from the frozen files; anything you are unsure about.

## State of the work (read this last; it overrides anything above that it contradicts)
- An earlier agent may already have started your task and been cut off mid-way by a usage limit. Whatever it wrote is
  on disk (`src/js/41-styles/*.js`, `tests/style-*.test.js`, and for Takashi `src/js/66-takashi.js` and
  `tests/takashi-fight.test.js`). Your prompt says which files exist for you. Read them critically before writing
  anything: keep what is sound, fix or finish what is not, and do not start over without a reason. That agent had not
  finished measuring or calibrating, so treat every number in those files as unverified.
- Core tuning since the header of 13-budo.js was first written: a critical staggers passive heavy armour too; the
  throw-back is BUDO.crit.reel kb 1050 with a slower slide; Kage's own counter-hit / back / clean criticals have a
  1.4 s cool-down (BUDO.crit.kageCd), a riposte and a blow on a broken guard always crit; the fight-time half of `Budo`
  lives in 14-budo-fight.js.
- Baseline on Normal with NO style (`--nostyle 1`), fighter bot: the rank and file lose 6/6 leaving Kage above 80 %
  health; garan (a sub-boss) 3 wins in 6; raikon and takashi (bosses) win 6/6 and lose only about 40 % of their
  health. So role scaling alone already puts the main bosses above their band: a boss style must make the boss skilled
  AND bring it back into the band (fighter bot wins about 15-35 % of runs), through its tune, cool-downs and, if
  needed, `Object.assign(ENEMIES.<id>, { hp: ..., dmg: ... })` in the style file.
- Tests red right now that are NOT yours unless your prompt says so: all of `tests/gameplay-lock.test.js`
  (orchestrator re-records it at the end); "Final Judgment ... staggers the Witness" in tests/witness-fight.test.js
  (the Witness agent's); "Hollow Raikon's Ichi no Tachi stutters" in tests/style-raikon.test.js (the Raikon agent's);
  "shiden: the braced spear ..." in tests/style-act1.test.js (the Act I agent's). Everything else was green.
- `python` on this machine sometimes fails on file encoding; use the Edit / Write tools for source changes.
- Seven agents run at once, each on its own files. Stay inside yours.
