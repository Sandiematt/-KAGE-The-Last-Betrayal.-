/* KAGE — Logic: the pure rules of progression (campaign unlocks, rewards, economy, save schema).
   No DOM, canvas, window, storage, audio or input here: it reads the data tables from 10-data.js
   and works on plain save objects, so it runs unchanged under Node (see tests/ and the README).
   SaveManager owns storage; the engine and UI ask this module what the rules say. */

/* ---------------- economy formulas ----------------
   Kept as top-level functions because the fighter, combat and AI modules call them directly
   in hot paths; they are also exposed on Logic below.
   Weapons: `stats` = [damage, speed, reach] at level 1. Each upgrade level adds 8% damage, 2.5% speed and
   1.5% reach. In a fight a weapon's damage multiplier is its damage over the damage of the weapon whose
   forms (move-set) it uses, so a shop weapon starts at x1 and a boss weapon on the same forms starts far
   above any upgraded shop weapon. Speed and reach multipliers are capped (x1.25 / x1.2) to keep the forms
   readable. Helmets and armour: `def` grows 1.2 points per level, `hp` 10% per level. */
const WEAPON_GROWTH = { dmg: 0.08, spd: 0.025, reach: 0.015 };
function gearTable(kind) { return kind === 'weapons' ? WEAPONS : kind === 'helmets' ? HELMETS : ARMORS; }
// Highest level an item can reach: trophies and boss weapons are fixed at level 1.
function maxLevel(kind, id) {
  const it = gearTable(kind)[id];
  if (it && it.maxLvl) return it.maxLvl;
  return it && (it.tier === 'trophy' || it.tier === 'boss') ? 1 : GEAR_MAX[kind];
}
// The drawing key of a helmet or armour (drawHelmet / drawArmor in 20-fighter.js). Enemies may also name a
// drawing directly ('veil', 'oni', 'cloak', 'tyrant', 'robe'), which passes through unchanged.
function gearLook(kind, id) { const it = gearTable(kind)[id]; return (it && it.look) || id; }
function upgradeCost(kind, id, lvl) {
  const item = gearTable(kind)[id];
  const base = item.price || (item.gems ? item.gems * 60 : 500);
  return Math.round(Math.max(160, base * (0.35 + 0.3 * lvl)) / 10) * 10;
}
function weaponRaw(id, lvl) {
  const s = WEAPONS[id].stats || [40, 50, 40], l = Math.max(0, (lvl || 1) - 1);
  return [s[0] * (1 + WEAPON_GROWTH.dmg * l), s[1] * (1 + WEAPON_GROWTH.spd * l), s[2] * (1 + WEAPON_GROWTH.reach * l)];
}
// The stats the Armory shows for a weapon at a level (uncapped: boss weapons go past 100).
function weaponStats(id, lvl) {
  const r = weaponRaw(id, lvl);
  return { damage: Math.round(r[0]), speed: Math.round(r[1]), reach: Math.round(r[2]) };
}
function weaponTotal(id, lvl) { const s = weaponStats(id, lvl); return s.damage + s.speed + s.reach; }
// Combat multipliers of a weapon at a level, relative to the weapon whose forms it fights with.
function weaponMul(id, lvl) {
  const w = WEAPONS[id] || WEAPONS.fists, ref = (w.base && WEAPONS[w.base] ? WEAPONS[w.base] : w).stats || [40, 50, 40];
  const r = weaponRaw(w.id || 'fists', lvl);
  return { dmg: r[0] / ref[0], spd: Math.min(1.25, r[1] / ref[1]), reach: Math.min(1.2, r[2] / ref[2]) };
}
function gearDef(kind, id, lvl) { const g = gearTable(kind)[id]; return g && g.def ? g.def + 0.012 * ((lvl || 1) - 1) : 0; }
function gearHp(kind, id, lvl) { const g = gearTable(kind)[id]; return g && g.hp ? Math.round(g.hp * (1 + 0.1 * ((lvl || 1) - 1))) : 0; }
function playerMaxHp(save) {
  const lv = (kind, id) => save.owned[kind][id] || 1;
  const a = save.equipped.armor, h = save.equipped.helmet;
  return Math.round(220 + (save.level - 1) * 4 + gearHp('armors', a, lv('armors', a)) + gearHp('helmets', h, lv('helmets', h)));
}
function xpForLevel(lvl) { return 200 + 120 * (lvl - 1); }

/* ---------------- difficulty modes ----------------
   The player picks one (new game, pause menu, Settings); the game never changes it. Every field is a multiplier
   on today's tuning, so Normal (all 1, branch 0.15) plays exactly as before.
   hp / dmg        regular foes' health and damage (minions too)      bossHp / bossDmg  the same for sub-bosses and bosses
   windup          enemy attack start-up and telegraph length          recovery          enemy attack recovery (the opening after a swing)
   react           AI reaction delay to an incoming attack             idle              AI pause between decisions and after a string
   aggr            AI attack chance                                    guard             AI block and parry chance
   punish          AI chance to punish an opening                      branch            chance an AI string becomes a mixed weapon-punch combo
   dodge           the player's dash invulnerability window            unique            Impossible's extra combo variations
   cap             ceiling on AI attack and punish chances */
const DIFFICULTY_IDS = ['easy', 'normal', 'hard', 'impossible'];
const DIFFICULTIES = {
  easy:       { id: 'easy', label: 'Easy', blurb: 'Lower enemy health and damage, slower wind-ups, wider dodge windows.',
    hp: 0.7, dmg: 0.6, bossHp: 0.75, bossDmg: 0.65, windup: 1.35, react: 1.4, aggr: 0.75, guard: 0.8, branch: 0.08, punish: 0.6, recovery: 1.3, idle: 1.35, dodge: 1.5, cap: 0.95, unique: false },
  normal:     { id: 'normal', label: 'Normal', blurb: 'The duel as it was meant to be fought.',
    hp: 1, dmg: 1, bossHp: 1, bossDmg: 1, windup: 1, react: 1, aggr: 1, guard: 1, branch: 0.15, punish: 1, recovery: 1, idle: 1, dodge: 1, cap: 0.95, unique: false },
  hard:       { id: 'hard', label: 'Hard', blurb: 'Faster enemies, shorter recovery, more combo branches, stronger punishes.',
    hp: 1.3, dmg: 1.25, bossHp: 1.25, bossDmg: 1.2, windup: 0.85, react: 0.8, aggr: 1.15, guard: 1.15, branch: 0.3, punish: 1.2, recovery: 0.8, idle: 0.8, dodge: 0.92, cap: 0.97, unique: false },
  impossible: { id: 'impossible', label: 'Impossible', blurb: 'Unique combo variations, fewer openings, tighter timing.',
    hp: 1.6, dmg: 1.5, bossHp: 1.5, bossDmg: 1.4, windup: 0.72, react: 0.6, aggr: 1.3, guard: 1.3, branch: 0.45, punish: 1.4, recovery: 0.65, idle: 0.6, dodge: 0.85, cap: 0.99, unique: true }
};

// The campaign map flattened in story order, and indexed by stage id.
// The fate a story boss is recorded with, by its defeat outcome (see Logic.fightFormat / bossDefeat).
const BOSS_FATES = { finisher: 'killed', escape: 'escaped', reabsorb: 'reabsorbed' };
const STAGE_LIST = CAMPAIGN.chapters.reduce((all, ch) => all.concat(ch.stages), []);
const STAGE_BY_ID = {}; for (const st of STAGE_LIST) STAGE_BY_ID[st.id] = st;

const Logic = {
  /* ---------------- save schema ---------------- */
  // The Last Betrayal starts over: its saves live under a new key and schema version.
  SAVE_KEY: 'kage.lastbetrayal.save.v2',
  SAVE_VERSION: 2,
  // Keys written by the old game (Ashbound, then the first KAGE). They are deleted on launch and never read.
  LEGACY_SAVE_KEYS: ['kage.save.v1', 'ashbound.save.v1'],
  // What to do with storage on launch. `stored` maps each key in SAVE_KEY / LEGACY_SAVE_KEYS to its stored
  // text (null or missing when absent). Returns the save to play with (from SAVE_KEY only; nothing migrates),
  // any load error, the legacy keys to delete, and `fresh` when no save existed yet and one should be written.
  openSave(stored) {
    stored = stored || {};
    const remove = this.LEGACY_SAVE_KEYS.filter(k => stored[k] != null);
    const raw = stored[this.SAVE_KEY] == null ? null : stored[this.SAVE_KEY];
    const { save, error } = this.loadSave(raw);
    return { save, error, remove, fresh: raw == null };
  },
  defaultSave() {
    return {
      v: Logic.SAVE_VERSION,  // schema version
      coins: 250, gems: 5, xp: 0, level: 1,
      ng: 0, ngUnlocked: false, ngCompletions: 0,
      cleared: {},            // stageId -> true, current cycle
      defeated: {},           // stageId -> wins (lifetime, kept through New Game+)
      owned: { weapons: { kagetsu: 1 }, helmets: { shiro_maki: 1 }, armors: { tachibana_yoroi: 1 } },
      equipped: { weapon: 'kagetsu', helmet: 'shiro_maki', armor: 'tachibana_yoroi' },
      seenRewards: {},
      clues: {},              // stageId -> { clueId: true }, clue pickups found in stretches (kept through New Game+)
      seenScenes: {},          // sceneId -> true, story scenes played at least once (kept through New Game+)
      storyFlags: {},          // flag -> true, set by { flag } scene steps
      bossFates: {},           // boss stageId -> 'killed' | 'escaped' | 'reabsorbed', how the story boss left (lifetime)
      difficulty: 'normal',    // Easy / Normal / Hard / Impossible (DIFFICULTY_IDS); only the player changes it
      difficultyPicked: false, // false until the new-game mode picker has been answered
      survivalBest: 0,
      stats: { wins: 0, losses: 0, perfects: 0, bosses: 0, playTime: 0 },
      settings: { shake: 'full', reduceFlash: false, sound: true, music: true, touch: 'auto', stick: 'float' }
    };
  },
  // Turns raw stored text (or null when nothing is stored) into a complete save.
  // Missing fields are filled from the defaults; unreadable text falls back to a fresh save
  // and is reported in `error` so the caller can warn and treat storage as unreliable.
  loadSave(raw) {
    try {
      return { save: this.normalizeSave(raw ? JSON.parse(raw) : null), error: null };
    } catch (e) {
      return { save: this.defaultSave(), error: e };
    }
  },
  // Fills a parsed save object (any shape, possibly from an older version) up to the current schema.
  normalizeSave(s) {
    const d = this.defaultSave();
    if (!s || typeof s !== 'object') return d;
    Object.assign(d, s);
    d.owned = Object.assign(this.defaultSave().owned, s.owned || {});
    for (const k of ['weapons', 'helmets', 'armors']) d.owned[k] = Object.assign({}, this.defaultSave().owned[k], (s.owned || {})[k] || {});
    // gear ids the tables no longer know (renamed or removed items, enemy-only arms) are dropped; a slot
    // left wearing something unowned or unknown goes back to the starting item
    const start = this.defaultSave().equipped;
    for (const k of ['weapons', 'helmets', 'armors']) for (const id in d.owned[k]) {
      const it = gearTable(k)[id];
      if (!it || it.enemy || id === 'fists' || !(d.owned[k][id] > 0)) delete d.owned[k][id];
    }
    d.equipped = Object.assign({}, start, s.equipped || {});
    for (const k of ['weapons', 'helmets', 'armors']) { const slot = this.equipSlot(k); if (!d.owned[k][d.equipped[slot]]) d.equipped[slot] = start[slot]; }
    d.stats = Object.assign(this.defaultSave().stats, s.stats || {});
    d.settings = Object.assign(this.defaultSave().settings, s.settings || {});
    // clears and defeats are keyed by stage id; keys the map does not know (old saves, removed stages) are dropped
    d.cleared = {}; d.defeated = {};
    for (const k in s.cleared || {}) if (STAGE_BY_ID[k] && s.cleared[k]) d.cleared[k] = true;
    for (const k in s.defeated || {}) if (STAGE_BY_ID[k] && s.defeated[k] > 0) d.defeated[k] = s.defeated[k];
    delete d.unlockedActs;
    d.seenRewards = s.seenRewards || {};
    // found clues: only clues a stretch stage still has
    d.clues = {};
    for (const k in s.clues || {}) {
      const st = this.stretch(k), got = s.clues[k];
      if (!st || !got || typeof got !== 'object') continue;
      for (const c of st.clues) if (got[c.id]) (d.clues[k] = d.clues[k] || {})[c.id] = true;
    }
    // seen scenes the game still has; story flags that are set
    d.seenScenes = {}; d.storyFlags = {};
    for (const k in s.seenScenes || {}) if (SCENES[k] && s.seenScenes[k] === true) d.seenScenes[k] = true;
    for (const k in s.storyFlags || {}) if (s.storyFlags[k] === true) d.storyFlags[k] = true;
    // boss fates: only story boss stages, only outcomes the game knows
    d.bossFates = {};
    for (const k in s.bossFates || {}) if (STAGE_BY_ID[k] && Object.values(BOSS_FATES).includes(s.bossFates[k])) d.bossFates[k] = s.bossFates[k];
    d.difficulty = this.normalizeDifficulty(s.difficulty);
    d.difficultyPicked = !!s.difficultyPicked;
    return d;
  },
  /* ---------------- campaign map ----------------
     The map is CAMPAIGN (10-data.js): chapters in story order, stages in play order, every stage with a
     stable string id. Progress is `save.cleared[stageId]` for the current cycle; stages unlock strictly in
     story order (a stage opens once the stage before it is cleared) and cleared stages stay open for replay. */
  CAMPAIGN, STAGE_KINDS,
  chapters() { return CAMPAIGN.chapters; },
  chapter(id) { return CAMPAIGN.chapters.find(c => c.id === id) || null; },
  // Every stage in story order, across all chapters.
  stages() { return STAGE_LIST; },
  stage(id) { return STAGE_BY_ID[id] || null; },
  chapterOf(stageId) { const st = this.stage(stageId); return st ? this.chapter(st.chapter) : null; },
  // Everything but story scenes is fought.
  isCombatStage(id) { const st = this.stage(id); return !!st && st.kind !== 'scene'; },
  // Stages that count as a boss fight (trophies list, records, a future Boss Rush).
  isBossStage(id) { const st = this.stage(id); return !!st && (st.kind === 'subboss' || st.kind === 'boss' || st.kind === 'echo'); },
  isStageComplete(save, id) { return !!save.cleared[id]; },
  isStageUnlocked(save, id) {
    const i = STAGE_LIST.findIndex(s => s.id === id);
    if (i < 0) return false;
    return i === 0 || this.isStageComplete(save, id) || this.isStageComplete(save, STAGE_LIST[i - 1].id);
  },
  isChapterUnlocked(save, id) { const c = this.chapter(id); return !!c && this.isStageUnlocked(save, c.stages[0].id); },
  isChapterComplete(save, id) { const c = this.chapter(id); return !!c && c.stages.every(s => this.isStageComplete(save, s.id)); },
  chapterProgress(save, id) {
    const c = this.chapter(id);
    return { done: c.stages.filter(s => this.isStageComplete(save, s.id)).length, total: c.stages.length };
  },
  isCampaignComplete(save) { return STAGE_LIST.every(s => this.isStageComplete(save, s.id)); },
  // The story frontier: the id of the first uncleared stage, or null when the story is finished.
  nextStage(save) { const st = STAGE_LIST.find(s => !this.isStageComplete(save, s.id)); return st ? st.id : null; },
  // Lifetime wins on a stage (kept through New Game+).
  defeatedCount(save, id) { return save.defeated[id] || 0; },
  // Marks a stage cleared (a won fight, or a story scene played) and returns what that opened:
  // { stage, firstClear, next, gear, unlocks: [{ kind: 'chapter', id } | { kind: 'ng' } | { kind: 'weapons' | 'helmets' | 'armors', id }] },
  // or null when the stage is locked. `gear` lists the items the stage's reward granted (see grantStageReward).
  completeStage(save, id) {
    const st = this.stage(id);
    if (!st || !this.isStageUnlocked(save, id)) return null;
    const firstClear = !this.isStageComplete(save, id), unlocks = [];
    save.cleared[id] = true;
    save.defeated[id] = (save.defeated[id] || 0) + 1;
    const next = this.nextStage(save);
    if (firstClear) {
      const ch = this.chapter(st.chapter), i = CAMPAIGN.chapters.indexOf(ch), nextCh = CAMPAIGN.chapters[i + 1];
      if (nextCh && this.isChapterComplete(save, ch.id)) unlocks.push({ kind: 'chapter', id: nextCh.id });
      if (this.isCampaignComplete(save)) {
        if (!save.ngUnlocked) unlocks.push({ kind: 'ng' });
        save.ngUnlocked = true;
        save.ngCompletions = Math.max(save.ngCompletions || 0, (save.ng || 0) + 1);
      }
    }
    const gear = this.grantStageReward(save, id);
    unlocks.push(...gear);
    // a story boss leaves the story the way its data says: killed, escaped or reabsorbed
    const fate = this.fightFormat(this.stageConfig(save, id)).name === 'boss' ? BOSS_FATES[this.bossDefeat(st.enemy)] : null;
    if (fate) save.bossFates[id] = fate;
    return { stage: id, firstClear, next, gear, unlocks, fate };
  },
  // Gear a stage gives when it is cleared: `reward: { weapons: [...], helmets: [...], armors: [...] }` on a CAMPAIGN
  // stage. Each item is granted exactly once, at level 1, the first time the stage is cleared while the player does
  // not own it; an item flagged `ngOnly` only drops while clearing the stage in New Game+. Returns [{ kind, id }].
  grantStageReward(save, id) {
    const st = this.stage(id), got = [];
    if (!st || !st.reward) return got;
    for (const kind of ['weapons', 'helmets', 'armors']) for (const gid of st.reward[kind] || []) {
      const it = gearTable(kind)[gid];
      if (!it || save.owned[kind][gid] || (it.ngOnly && !(save.ng > 0))) continue;
      save.owned[kind][gid] = 1;
      got.push({ kind, id: gid });
    }
    return got;
  },
  // Everything the fight session needs to stage a campaign fight. A stretch stage carries its level (`stretch`) and
  // is walked by StretchSession; every other combat stage is one arena fight against its placeholder `enemy`, shown
  // under the stage's story foe name.
  stageConfig(save, id) {
    const st = this.stage(id), ch = this.chapter(st.chapter), d = ENEMIES[st.enemy];
    // a stretch is a side-scrolling level: the session walks it instead of staging an arena duel
    if (st.kind === 'stretch' && st.stretch) {
      return { mode: 'campaign', stageId: id, kind: st.kind, chapter: ch.id, pos: st.pos, diff: ch.diff, env: st.stretch.env || st.env || ch.env,
        enemyId: st.enemy, foeName: st.name, foeTitle: ch.place, ng: save.ng, stretch: st.stretch, format: this.fightFormat({ stretch: st.stretch }) };
    }
    const cfg = { mode: 'campaign', stageId: id, kind: st.kind, chapter: ch.id, pos: st.pos, diff: ch.diff, env: st.env || ch.env,
      enemyId: st.enemy, foeName: st.foe || (d && d.name), foeTitle: st.foeTitle || (d && d.title), ng: save.ng };
    cfg.format = this.fightFormat(cfg);
    return cfg;
  },
  /* ---------------- fight formats and story bosses ----------------
     A fight is staged in one of four formats (`fightFormat(cfg)`, cfg from stageConfig or a survival config):
       boss      story boss stages (kind 'boss', or a stage with `format: 'boss'`): ONE round, ONE health bar and
                 three phases, no round clock and so no time-out loss; `defeat` says how the boss leaves;
       duel      every other arena fight: best of three rounds against a 75 s clock;
       survival  one round per wave against a 90 s clock;
       stretch   a side-scrolling level: no rounds, no clock.
     A boss's phases and defeat outcome are data on its ENEMIES entry (see 10-data.js). */
  BOSS_DEFEATS: ['finisher', 'escape', 'reabsorb'],
  fightFormat(cfg) {
    cfg = cfg || {};
    if (cfg.mode === 'survival') return { name: 'survival', roundsToWin: 1, timer: 90, phases: 0, defeat: null };
    if (cfg.stretch) return { name: 'stretch', roundsToWin: 1, timer: 0, phases: 0, defeat: null };
    const st = this.stage(cfg.stageId), d = ENEMIES[cfg.enemyId];
    if (st && (st.kind === 'boss' || st.format === 'boss'))
      return { name: 'boss', roundsToWin: 1, timer: 0, phases: Math.max(3, this.bossPhases(cfg.enemyId).length), defeat: this.bossDefeat(cfg.enemyId) || 'finisher' };
    return { name: 'duel', roundsToWin: d && d.type === 'boss' ? 1 : 2, timer: 75, phases: 0, defeat: null };
  },
  // A boss's phases with the health fraction each one opens at (`at`; 1, 0.66 and 0.33 unless the data says
  // otherwise). [] for a foe without phases.
  bossPhases(enemyId) {
    const d = ENEMIES[enemyId], list = (d && d.phases) || [], def = [1, 0.66, 0.33];
    return list.map((p, i) => Object.assign({}, p, { at: p.at != null ? p.at : def[i] != null ? def[i] : 0 }));
  },
  // Which phase a boss is in at a health fraction (0 for a foe without phases): the last phase whose `at` is reached.
  bossPhaseAt(enemyId, hpFrac) {
    const ph = this.bossPhases(enemyId);
    let idx = 0;
    ph.forEach((p, i) => { if (i > 0 && hpFrac <= p.at) idx = i; });
    return idx;
  },
  // How a beaten boss leaves: 'finisher' | 'escape' | 'reabsorb' (unknown values fall back to the finisher);
  // null for a foe that is not a boss.
  bossDefeat(enemyId) {
    const d = ENEMIES[enemyId];
    if (!d || (d.type !== 'boss' && d.type !== 'sub')) return null;
    return this.BOSS_DEFEATS.includes(d.defeat) ? d.defeat : 'finisher';
  },
  // How a story boss stage's boss left the story ('killed' | 'escaped' | 'reabsorbed'), or null before it is won.
  bossFate(save, stageId) { return (save.bossFates && save.bossFates[stageId]) || null; },
  /* ---------------- story scenes ----------------
     Scenes are SCENES (12-scenes.js), attached by id to a stage (`scenes: { before, after, defeat }`) or to a stretch
     clue (`scene`). These answer which scene plays at a moment; StoryPlayer (68-story.js) plays it. */
  SCENE_HOOKS: ['before', 'after', 'defeat'],
  scene(id) { return (id && SCENES[id]) || null; },
  // The id of the scene a stage plays at `hook`, or null (unknown stage, hook or scene).
  stageScene(stageId, hook) {
    const st = this.stage(stageId), id = st && st.scenes && this.SCENE_HOOKS.includes(hook) ? st.scenes[hook] : null;
    return this.scene(id) ? id : null;
  },
  // The id of the scene a stretch clue plays when it is picked up, or null.
  clueScene(stageId, clueId) {
    const L = this.stretch(stageId), c = L && L.clues.find(k => k.id === clueId);
    return c && this.scene(c.scene) ? c.scene : null;
  },
  // A played scene is remembered (kept through New Game+); scenes still replay every time their moment comes.
  markSceneSeen(save, id) {
    if (!this.scene(id)) return false;
    save.seenScenes[id] = true;
    return true;
  },
  isSceneSeen(save, id) { return !!save.seenScenes[id]; },
  // Story flags set by `{ flag }` steps, for choices later in the story.
  setStoryFlag(save, name) { if (typeof name !== 'string' || !name) return false; save.storyFlags[name] = true; return true; },
  storyFlag(save, name) { return !!save.storyFlags[name]; },

  /* ---------------- stretches ----------------
     A stretch stage is a side-scrolling level (CAMPAIGN stage `stretch` field). Encounters are cleared in order;
     `cleared` below is how many of them are done. */
  // The stretch level of a stage, or null for any other stage.
  stretch(id) { const st = this.stage(id); return st && st.kind === 'stretch' && st.stretch ? st.stretch : null; },
  // Index of the encounter Kage starts by standing at x, or -1 (the next uncleared one, once he crosses its trigger).
  encounterAt(stretch, cleared, x) {
    const e = stretch.encounters[cleared];
    return e && x >= e.x ? cleared : -1;
  },
  // The furthest x Kage may walk: the gate of the first uncleared encounter, else the end of the level.
  stretchLimit(stretch, cleared) {
    const e = stretch.encounters[cleared];
    return e ? Math.min(e.gate, stretch.length) : stretch.length;
  },
  // The stretch is complete when every encounter is cleared and Kage reaches the end (within `reach` of it).
  isStretchComplete(stretch, cleared, x, reach) {
    return cleared >= stretch.encounters.length && x >= stretch.length - (reach == null ? 60 : reach);
  },
  // Records a found clue: save.clues[stageId][clueId]. Returns true when it is newly found, false for a clue the
  // stage does not have or one already found. Clues are kept through New Game+.
  collectClue(save, stageId, clueId) {
    const s = this.stretch(stageId);
    if (!s || !s.clues.some(c => c.id === clueId)) return false;
    save.clues = save.clues || {};
    const got = save.clues[stageId] = save.clues[stageId] || {};
    if (got[clueId]) return false;
    got[clueId] = true;
    return true;
  },
  // The ids of the clues found on a stage, in the order the stage lists them.
  cluesFound(save, stageId) {
    const s = this.stretch(stageId), got = (save.clues || {})[stageId] || {};
    return s ? s.clues.filter(c => got[c.id]).map(c => c.id) : [];
  },
  // Starts the next New Game+ cycle: campaign progress resets, everything else (including lifetime defeats) is kept.
  startNewGamePlus(save) {
    if (!save.ngUnlocked) return false;
    save.ng = (save.ng || 0) + 1; save.cleared = {};
    return true;
  },

  /* ---------------- difficulty ---------------- */
  DIFFICULTY_IDS,
  // A mode's tuning; anything unknown reads as Normal.
  difficulty(id) { return DIFFICULTIES[this.normalizeDifficulty(id)]; },
  normalizeDifficulty(id) { return DIFFICULTIES[id] ? id : 'normal'; },
  // The authored challenge curve of a fight: chapter tier (`diff`), stage position, foe weight class, or the
  // survival wave. Drives AI sharpness. It never reads the player's level, experience or gear.
  stageLevel(cfg, enemyId, wave) {
    const d = ENEMIES[enemyId];
    if (cfg.mode === 'survival') return 1 + (wave || cfg.wave || 1) * 0.35;
    const tier = (cfg.diff || 1) - 1, st = cfg.pos || 0;
    return 1 + tier * 1.6 + st * 0.22 + (d.type === 'sub' ? 0.4 : d.type === 'boss' ? 0.8 : 0);
  },
  // The foe a boss summons in this fight (cfg from stageConfig; survival has no chapter): see BOSS_MINIONS.
  minionId(cfg) { return BOSS_MINIONS[(cfg && cfg.chapter) || 'default'] || BOSS_MINIONS.default; },
  // A foe's fight stats: { hp, dmgMul, wlvl, defense, speedMul, level, ng, difficulty }. They depend only on the
  // chosen mode (save.difficulty), the authored curve (stage / chapter tier, survival wave, New Game+ cycle) and the
  // foe's role: 'minion' (a boss's summoned recruit, 70 base health, 60% damage) or 'clone' (1 health, half damage).
  // Sub-bosses and bosses take the mode's boss multipliers; everyone else the regular ones.
  enemyStats(save, cfg, enemyId, opts) {
    opts = opts || {};
    const d = ENEMIES[enemyId], ng = cfg.ng || 0, mode = this.difficulty(save.difficulty);
    const wave = opts.wave || cfg.wave || 1, survival = cfg.mode === 'survival';
    const role = opts.role || null, bossy = (d.type === 'boss' || d.type === 'sub') && role !== 'minion';
    let hpMul = 1 + 0.35 * ng, dmgMul = (d.dmg || 1) * (1 + 0.25 * ng);
    if (survival) { hpMul *= 0.85 + wave * 0.07; dmgMul *= 0.9 + wave * 0.04; }
    hpMul *= bossy ? mode.bossHp : mode.hp;
    dmgMul *= bossy ? mode.bossDmg : mode.dmg;
    let hp = Math.round(d.hp * hpMul);
    if (role === 'minion') { hp = Math.round(70 * mode.hp); dmgMul *= 0.6; }
    if (role === 'clone') { hp = 1; dmgMul *= 0.5; }
    const raw = Math.round(1 + ((cfg.diff || 1) - 1) * 2.2 + (cfg.pos || 0) * 0.3 + ng * 2 + (survival ? wave * 0.3 : 0));
    return {
      hp, dmgMul, wlvl: Math.min(8, Math.max(1, raw)),
      defense: d.def != null ? d.def : ((HELMETS[d.helmet] || {}).def || 0) * 0.6 + ((ARMORS[d.armor] || {}).def || 0) * 0.6,
      speedMul: d.speed || 1, level: this.stageLevel(cfg, enemyId, wave), ng, difficulty: mode.id
    };
  },
  // An enemy's AI tuning: a fresh copy of AI_PROFILES[profile], sharpened by the authored curve (stage level, New
  // Game+) and scaled by the mode, plus the mode's timing fields the AI and fighter read (windup, recovery, idle,
  // branch, unique). Clones and minions use a fixed aggression (0.8 / 0.6) scaled by the mode. On Normal this is
  // exactly the original tuning.
  aiTuning(profile, opts) {
    opts = opts || {};
    const base = AI_PROFILES[profile] || AI_PROFILES.regular, m = this.difficulty(opts.difficulty);
    const p = Object.assign({}, base, { react: base.react.slice(), combo: base.combo.slice() });
    const lvl = opts.level || 1, ng = opts.ng || 0;
    const k = Math.min(1.4, Math.max(0, (lvl - 1) / 4)) + ng * 0.35;
    p.aggr = Math.min(m.cap, p.aggr * (0.8 + k * 0.35) * m.aggr);
    p.block = Math.min(0.85, p.block * (0.75 + k * 0.3) * m.guard);
    p.parry = Math.min(0.4, p.parry * (0.7 + k * 0.5) * m.guard);
    p.react = [p.react[0] * (1.25 - k * 0.2) * m.react, p.react[1] * (1.25 - k * 0.2) * m.react];
    p.punish = Math.min(m.cap, p.punish * (0.85 + k * 0.2) * m.punish);
    if (opts.role === 'clone') p.aggr = Math.min(m.cap, 0.8 * m.aggr);
    if (opts.role === 'minion') p.aggr = Math.min(m.cap, 0.6 * m.aggr);
    Object.assign(p, { windup: m.windup, recovery: m.recovery, idle: m.idle, branch: m.branch, unique: m.unique });
    return p;
  },
  // The player's choice (new-game picker, pause menu, Settings). Returns false for an unknown mode.
  setDifficulty(save, id) {
    if (!DIFFICULTIES[id]) return false;
    save.difficulty = id; save.difficultyPicked = true;
    return true;
  },

  /* ---------------- economy ---------------- */
  GEAR_MAX, GEAR_TIERS, gearTable, gearLook, maxLevel, upgradeCost, weaponStats, weaponTotal, weaponMul, gearDef, gearHp, playerMaxHp, xpForLevel,
  equipSlot(kind) { return kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor'; },
  // An item's tier at a level. Shop weapons climb as they are upgraded (Rare from level 4, Epic from 7),
  // never dropping below the tier they are sold at; everything else keeps its tier.
  itemTier(kind, id, lvl) {
    const it = gearTable(kind)[id], base = it.tier || 'common';
    if (kind !== 'weapons' || !['common', 'rare', 'epic'].includes(base)) return base;
    const byLvl = (lvl || 1) >= 7 ? 'epic' : (lvl || 1) >= 4 ? 'rare' : 'common';
    return GEAR_TIERS[byLvl].rank > GEAR_TIERS[base].rank ? byLvl : base;
  },
  tierLabel(kind, id, lvl) { return GEAR_TIERS[this.itemTier(kind, id, lvl)].label; },
  // Everything the equipped gear does for Kage in a fight: health, damage reduction (capped at 50%),
  // the weapon's damage multiplier and the summed helmet + armour perks.
  playerCombatStats(save) {
    const eq = save.equipped, lv = (kind, id) => save.owned[kind][id] || 1;
    const h = HELMETS[eq.helmet], a = ARMORS[eq.armor];
    const perks = {}; for (const src of [h.perks, a.perks]) for (const k in src) perks[k] = (perks[k] || 0) + src[k];
    return {
      hp: playerMaxHp(save),
      defense: Math.min(0.5, gearDef('helmets', h.id, lv('helmets', h.id)) + gearDef('armors', a.id, lv('armors', a.id))),
      weaponDmg: weaponMul(eq.weapon, lv('weapons', eq.weapon)).dmg,
      perks
    };
  },
  // Locked gear: never sold (`exclusive`) and not owned yet. Boss weapons and trophies stay locked until a
  // campaign stage's `reward` grants them (see completeStage).
  isLocked(save, kind, id) { const it = gearTable(kind)[id]; return !!it && !!it.exclusive && !save.owned[kind][id]; },
  // What the Armory says unlocks a locked item: its own `hint`, else the stage whose reward lists it.
  lockHint(kind, id) {
    const it = gearTable(kind)[id];
    if (it.hint) return it.hint;
    const st = STAGE_LIST.find(s => s.reward && (s.reward[kind] || []).includes(id));
    return st ? `Clear ${st.foe || st.name}` : 'Not obtainable yet';
  },
  // Shop actions: each checks the rule, updates the save in place and returns whether it happened.
  buyItem(save, kind, id) {
    const it = gearTable(kind)[id];
    if (save.owned[kind][id] || it.exclusive) return false;
    if (it.gems) { if (save.gems < it.gems) return false; save.gems -= it.gems; } else { if (save.coins < it.price) return false; save.coins -= it.price; }
    save.owned[kind][id] = 1;
    return true;
  },
  upgradeItem(save, kind, id) {
    const lvl = save.owned[kind][id];
    if (!lvl || lvl >= maxLevel(kind, id)) return false;
    const c = upgradeCost(kind, id, lvl); if (save.coins < c) return false;
    save.coins -= c; save.owned[kind][id] = lvl + 1;
    return true;
  },
  equipItem(save, kind, id) {
    if (!save.owned[kind][id]) return false;
    save.equipped[this.equipSlot(kind)] = id;
    return true;
  },

  /* ---------------- rewards ---------------- */
  rewardTypeMul(type) { return type === 'boss' ? 3.4 : type === 'sub' ? 2.2 : 1; },
  ngRewardMul(ng) { return 1 + 0.6 * (ng || 0); },
  // Reward tier of a stage: stretches pay like regular fights; sub-bosses, the spar and the Core echoes like
  // sub-bosses; the act bosses and the Witness like bosses. Story scenes pay nothing.
  stageRewardType(id) { const k = (this.stage(id) || {}).kind; return k === 'boss' ? 'boss' : k === 'subboss' || k === 'spar' || k === 'echo' ? 'sub' : 'regular'; },
  stageBaseCoins(id) { return (60 + 45 * this.chapterOf(id).diff) * this.rewardTypeMul(this.stageRewardType(id)); },
  firstClearGems(type) { return type === 'boss' ? 5 : type === 'sub' ? 2 : 0; },
  // Performance rating of a campaign fight: S, A, B or C.
  rateFight(r) {
    if (!r.win) return 'C';
    const s = r.hpLeft * 40 + (r.time < 45 ? 20 : r.time < 80 ? 10 : 0) + Math.min(20, r.maxCombo * 2) + r.parries * 5 + (r.flawless ? 20 : 0);
    return s >= 85 ? 'S' : s >= 62 ? 'A' : s >= 42 ? 'B' : 'C';
  },
  // What the stage card promises before the fight (a C-rated win, without the flawless gem).
  stageRewardPreview(save, id) {
    if (!this.isCombatStage(id)) return { coins: 0, gems: 0 };
    const cleared = this.isStageComplete(save, id);
    const coins = Math.round(this.stageBaseCoins(id) * this.ngRewardMul(save.ng) * (cleared ? 0.5 : 1) / 5) * 5;
    return { coins, gems: cleared ? 0 : this.firstClearGems(this.stageRewardType(id)) };
  },
  survivalWaveReward(wave) {
    return { coins: SURVIVAL.coins(wave), gems: wave % SURVIVAL.gemsEvery === 0 ? 1 : 0 };
  },
  // Applies a finished fight (campaign or survival) to the save and returns what it earned:
  // { coins, gems, xp, rating, seals, unlocks, firstClear, next?, levelUps, levelBefore, xpBefore, newBest? }
  // A campaign result names its stage by `stageId`; a win completes that stage (see completeStage).
  // plus every field of the fight result. The save is updated in place; persisting it is the caller's job.
  applyFightResult(save, r) {
    const out = Object.assign({}, r, { coins: 0, gems: 0, xp: 0, unlocks: [], levelUps: 0, firstClear: false });
    const ngMul = this.ngRewardMul(r.ng);
    if (r.mode === 'campaign') {
      const id = r.stageId, type = this.stageRewardType(id), diff = this.chapterOf(id).diff;
      const base = this.stageBaseCoins(id);
      out.rating = this.rateFight(r);
      out.seals = [r.win, r.win && r.time < 60, r.win && r.flawless];
      if (r.win) {
        const done = this.completeStage(save, id) || { firstClear: false, unlocks: [] };
        out.firstClear = done.firstClear;
        out.coins = Math.round(base * ngMul * ({ S: 1.5, A: 1.25, B: 1.1, C: 1 }[out.rating]) * (out.firstClear ? 1 : 0.5) / 5) * 5;
        out.gems = (out.firstClear ? this.firstClearGems(type) : (type === 'boss' ? 1 : 0)) + (r.flawless ? 1 : 0);
        out.xp = Math.round((type === 'boss' ? 300 : type === 'sub' ? 150 : 80) * diff * ngMul);
        save.stats.wins++; if (r.flawless) save.stats.perfects++;
        if (type === 'boss') save.stats.bosses++;
        out.unlocks.push(...done.unlocks);
        out.next = done.next;
      } else {
        out.coins = Math.round(base * 0.25 / 5) * 5; out.xp = 20 * diff; save.stats.losses++;
      }
    } else {
      out.coins = r.survivalCoins; out.gems = r.survivalGems; out.xp = 40 * r.waves;
      out.rating = r.waves >= 15 ? 'S' : r.waves >= 10 ? 'A' : r.waves >= 5 ? 'B' : 'C';
      out.newBest = r.waves > save.survivalBest;
      if (out.newBest) save.survivalBest = r.waves;
      out.seals = [r.waves >= 5, r.waves >= 10, r.waves >= 15];
      save.stats.wins += r.waves; save.stats.losses++;
    }
    save.coins += out.coins; save.gems += out.gems; save.xp += out.xp;
    out.levelBefore = save.level; out.xpBefore = save.xp - out.xp;
    while (save.xp >= xpForLevel(save.level)) { save.xp -= xpForLevel(save.level); save.level++; out.levelUps++; }
    return out;
  },

  // "Erase all progress": a fresh save that keeps the player's settings.
  resetSave(prev) {
    const d = this.defaultSave();
    if (prev && prev.settings) d.settings = prev.settings;
    return d;
  }
};
