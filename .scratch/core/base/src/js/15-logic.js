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

/* ---------------- boss moves ----------------
   Every boss move table works the same way: a base move, a variant's (or corruption's) overrides on top, deep-copied
   so the caller can tune the result freely. */
// A deep copy of the parts merged left to right (Object.assign order).
function moveCopy(...parts) { return JSON.parse(JSON.stringify(Object.assign({}, ...parts))); }
// Where a move id comes from: one of the boss's own abilities ({ base: id, variant: null }), a variant of one
// ({ base: variant.base, variant }), or null for any other id.
function moveSource(id, abilities, variants) {
  if (abilities.includes(id)) return { base: id, variant: null };
  const v = variants[id];
  return v && abilities.includes(v.base) ? { base: v.base, variant: v } : null;
}
// A boss's move or a reduced variant of it, as the numbers it runs with plus { id, base, reduced }.
function derivedMove(id, abilities, variants, moves) {
  const src = moveSource(id, abilities, variants);
  if (!src) return null;
  return src.variant ? moveCopy(moves[src.base], src.variant, { id, base: src.base, reduced: true })
    : moveCopy({ id }, moves[id], { base: id, reduced: false });
}

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
  // The developer unlock (DEV.unlockAll in 10-data.js) plays on its own save, so the real one is never touched.
  DEV_SAVE_KEY: 'kage.lastbetrayal.save.v2.dev',
  // Keys written by the old game (Ashbound, then the first KAGE). They are deleted on launch and never read.
  // Never the current save keys (SAVE_KEY, DEV_SAVE_KEY).
  LEGACY_SAVE_KEYS: ['kage.save.v1', 'ashbound.save.v1'],
  // Whether the developer unlock is on (DEV.unlockAll): everything open and owned, on its own save.
  devUnlocked() { return !!(typeof DEV !== 'undefined' && DEV && DEV.unlockAll); },
  // The key the game reads and writes now: DEV_SAVE_KEY while the developer unlock is on, else SAVE_KEY.
  get ACTIVE_SAVE_KEY() { return this.devUnlocked() ? this.DEV_SAVE_KEY : this.SAVE_KEY; },
  // Where an unreadable save's raw text is copied before a fresh save replaces it.
  get CORRUPT_SAVE_KEY() { return this.ACTIVE_SAVE_KEY + '.corrupt'; },
  // What to do with storage on launch. `stored` maps ACTIVE_SAVE_KEY and each key in LEGACY_SAVE_KEYS to its stored
  // text (null or missing when absent). Returns the save to play with (from ACTIVE_SAVE_KEY only; nothing migrates),
  // any load error, the legacy keys to delete, `fresh` when no save existed yet and one should be written, and
  // `backup` ({ key, raw }) when the stored text was unreadable and should be copied to CORRUPT_SAVE_KEY first.
  // With the developer unlock on, the save also gets everything (applyDevUnlock).
  openSave(stored) {
    stored = stored || {};
    const keep = [this.SAVE_KEY, this.DEV_SAVE_KEY];
    const remove = this.LEGACY_SAVE_KEYS.filter(k => stored[k] != null && !keep.includes(k));
    const key = this.ACTIVE_SAVE_KEY, raw = stored[key] == null ? null : stored[key];
    const { save, error } = this.loadSave(raw);
    if (this.devUnlocked()) this.applyDevUnlock(save);
    return { save, error, remove, fresh: raw == null, backup: error && raw != null ? { key: this.CORRUPT_SAVE_KEY, raw } : null };
  },
  // The developer unlock's grants: every weapon, helmet and armour owned (at level 1 unless already higher), at least
  // DEV.coins coins and DEV.gems gems, and New Game+ open. Only called while DEV.unlockAll is on.
  applyDevUnlock(save) {
    for (const kind of ['weapons', 'helmets', 'armors']) {
      const table = gearTable(kind);
      for (const id in table) if (!table[id].enemy && id !== 'fists' && !(save.owned[kind][id] > 0)) save.owned[kind][id] = 1;
    }
    save.coins = Math.max(save.coins, (DEV && DEV.coins) || 0);
    save.gems = Math.max(save.gems, (DEV && DEV.gems) || 0);
    save.ngUnlocked = true;
    return save;
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
      trialsBest: 0,
      bossRushBest: { bosses: 0, time: 0 },   // Boss Rush record: most bosses beaten in one run, then the fastest time
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
    // Survival became Echo Trials: an older save's best wave carries over
    d.trialsBest = Math.max(0, +s.trialsBest || 0, +s.survivalBest || 0); delete d.survivalBest;
    { const b = s.bossRushBest, n = b && Math.floor(+b.bosses), t = b && +b.time;
      d.bossRushBest = n > 0 && t > 0 ? { bosses: n, time: t } : { bosses: 0, time: 0 }; }
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
    for (const k in s.bossFates || {}) if (this.isStoryBossStage(k) && Object.values(BOSS_FATES).includes(s.bossFates[k])) d.bossFates[k] = s.bossFates[k];
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
  // The story bosses (kind 'boss': the act bosses and the Witness), the only stages that record a boss fate.
  isStoryBossStage(id) { const st = this.stage(id); return !!st && st.kind === 'boss'; },
  isStageComplete(save, id) { return !!save.cleared[id]; },
  isStageUnlocked(save, id) {
    const i = STAGE_LIST.findIndex(s => s.id === id);
    if (i < 0) return false;
    // the developer unlock (DEV.unlockAll) opens every stage, in any order
    return this.devUnlocked() || i === 0 || this.isStageComplete(save, id) || this.isStageComplete(save, STAGE_LIST[i - 1].id);
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
    // never beaten before, in any cycle (lifetime defeats are kept through New Game+)
    const firstEver = !(this.defeatedCount(save, id) > 0);
    save.cleared[id] = true;
    // the spar has no winner (Takashi interrupts it), so young Rem is never recorded as beaten
    if (st.kind !== 'spar') save.defeated[id] = (save.defeated[id] || 0) + 1;
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
    // gems a stage rewards (the Core echoes: gems instead of gear), paid into the save here ONCE EVER: on its first
    // clear in the first cycle it is beaten, never again in New Game+
    const gems = firstClear && firstEver ? this.stageRewardGems(id) : 0;
    save.gems += gems;
    // a story boss (kind 'boss': Raikon, Akari, Takashi, the Witness) leaves the story the way its data says: killed,
    // escaped or reabsorbed. Sub-bosses and the Core echoes fight in the boss format but have no fate.
    const fate = this.isStoryBossStage(id) ? BOSS_FATES[this.bossDefeat(st.enemy)] || null : null;
    if (fate) save.bossFates[id] = fate;
    return { stage: id, firstClear, next, gear, gems, unlocks, fate };
  },
  // Gems a stage's `reward: { gems }` pays the first time it is ever beaten (the Core echoes drop gems, never gear; 0 for
  // other stages). Paid once per save, not once per New Game+ cycle.
  stageRewardGems(id) { const r = (this.stage(id) || {}).reward; return (r && r.gems) || 0; },
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
     A fight is staged in one of four formats (`fightFormat(cfg)`, cfg from stageConfig or an Echo Trials config):
       boss      story boss stages (kind 'boss', or a stage with `format: 'boss'`): ONE round, ONE health bar and
                 three phases, no round clock and so no time-out loss; `defeat` says how the boss leaves;
       duel      every other arena fight: best of three rounds against a 75 s clock;
       trials    Echo Trials: one round per wave against a 90 s clock; a boss-echo wave (`bossEcho`) has no clock
                 and shows its boss's phases;
       stretch   a side-scrolling level: no rounds, no clock;
       spar      the Interlude (kind 'spar'): one round on a clock and no KO (`preventKO`). Takashi interrupts when
                 either brother's health falls to `interruptAt` or the clock runs out (sparOutcome); nobody wins.
     A boss's phases and defeat outcome are data on its ENEMIES entry (see 10-data.js). */
  BOSS_DEFEATS: ['finisher', 'escape', 'reabsorb'],
  // How many phases a boss stage's fight shows: story bosses (kind 'boss') at least three, anything else at least one.
  bossPhaseCount(stageId, enemyId) {
    const st = this.stage(stageId), n = this.bossPhases(enemyId).length;
    return st && st.kind === 'boss' ? Math.max(3, n) : Math.max(1, n);
  },
  fightFormat(cfg) {
    cfg = cfg || {};
    if (cfg.mode === 'trials') {
      // a boss-echo wave (cfg.bossEcho, from echoTrialWave) is a full story boss: no clock, so no time-out, and its phases
      const b = cfg.bossEcho;
      if (b) return { name: 'trials', roundsToWin: 1, timer: 0, phases: this.bossPhaseCount(b.stageId, b.enemyId), defeat: null, bossEcho: true };
      return { name: 'trials', roundsToWin: 1, timer: 90, phases: 0, defeat: null };
    }
    // Boss Rush: every boss in the story boss format; nobody escapes or is reabsorbed, each just falls (no fate is kept)
    if (cfg.mode === 'bossrush')
      return { name: 'boss', roundsToWin: 1, timer: 0, phases: this.bossPhaseCount(cfg.stageId, cfg.enemyId), defeat: 'finisher' };
    if (cfg.stretch) return { name: 'stretch', roundsToWin: 1, timer: 0, phases: 0, defeat: null };
    const st = this.stage(cfg.stageId), d = ENEMIES[cfg.enemyId];
    if (st && st.kind === 'spar') return { name: 'spar', roundsToWin: 1, timer: SPAR.timer, phases: 0, defeat: null, interruptAt: SPAR.interruptAt, preventKO: true };
    if (st && (st.kind === 'boss' || st.format === 'boss'))
      // story bosses fight in three phases; a sub-boss in the boss format shows the one or two phases it has
      return { name: 'boss', roundsToWin: 1, timer: 0, phases: this.bossPhaseCount(cfg.stageId, cfg.enemyId), defeat: this.bossDefeat(cfg.enemyId) || 'finisher' };
    return { name: 'duel', roundsToWin: d && d.type === 'boss' ? 1 : 2, timer: 75, phases: 0, defeat: null };
  },
  /* ---------------- the spar (Interlude) ---------------- */
  // 'interrupted' once Takashi calls the boys in: either brother's health fraction at or below the format's
  // `interruptAt`, or the fight time at the clock; null while the spar goes on. hp values are fractions of max health.
  sparOutcome(format, st) {
    if (!format || format.name !== 'spar') return null;
    if (st.playerHp <= format.interruptAt || st.foeHp <= format.interruptAt || st.time >= format.timer) return 'interrupted';
    return null;
  },
  // A fighter's health after a blow: in a spar (`preventKO`) it never drops below 1, so nobody is ever knocked out and
  // the interruption always comes first; in any other format the blow lands as it is.
  sparHealth(format, hp) { return format && format.preventKO ? Math.max(1, hp) : hp; },
  // Young Kage in the spar: fixed health and look and a bokken, none of the player's gear, level or perks (SPAR.kage).
  youngKage() { const k = SPAR.kage; return { hp: k.hp, defense: 0, dmgMul: 1, weapon: k.weapon, helmet: k.helmet, armor: k.armor, build: Object.assign({}, k.build) }; },
  // The family form (FAMILY_FORM in 10-data.js) expanded for one style ('kage', 'rem'; unknown styles run Kage's):
  // { name, style, tempo, steps: [{ step, act, move?, wait }] }. `wait` is the pause before the step; aerial steps
  // repeat for the style's `aerials` and the flow step runs once per finishing move.
  familyForm(style) {
    const id = FAMILY_FORM.styles[style] ? style : 'kage', sty = FAMILY_FORM.styles[id], steps = [];
    for (const p of FAMILY_FORM.pattern) {
      const one = (move, wait) => steps.push(Object.assign({ step: p.step, act: p.act, wait }, move ? { move } : {}));
      const mv = (sty.moves && sty.moves[p.step]) || p.move;   // a style may cut a step with its own move (Takashi's Shinsen forms)
      if (p.step === 'stance') one(null, sty.hold);
      else if (p.step === 'aerial') for (let i = 0; i < sty.aerials; i++) one(mv, sty.gap);
      else if (p.step === 'flow') sty.flow.forEach(m => one(m, sty.gap));
      else one(mv, sty.gap);
    }
    return { name: FAMILY_FORM.name, style: id, tempo: sty.tempo, steps };
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
  // Every signature ability a boss or sub-boss can use, across its phases (or its flat `abilities` list), once each.
  bossAbilities(enemyId) {
    const d = ENEMIES[enemyId]; if (!d) return [];
    return [...new Set([...(d.abilities || []), ...(d.phases || []).flatMap(p => p.abilities || [])])];
  },
  // Raikon's moves and the reduced versions of them his act's sub-bosses fight with (RAIKON_ABILITIES and
  // RAIKON_VARIANTS in 10-data.js): { id, base, reduced, wave } where `base` is the Raikon ability whose code runs,
  // `reduced` is true for a variant and `wave` says whether a Thunder Swing ground wave is sent. null for any other id.
  raikonMove(id) {
    const src = moveSource(id, RAIKON_ABILITIES, RAIKON_VARIANTS);
    if (!src) return null;
    return { id, base: src.base, reduced: !!src.variant, wave: src.base === 'thunderSwing' && !(src.variant && src.variant.wave === false) };
  },
  // One of Akari's moves (AKARI_MOVES in 10-data.js): a copy of its numbers (label, windup tell, cooldown, range,
  // damage, smoke, afterimages...) with its id; null for any other id. Act II's sub-bosses (SAN-39) build on these.
  akariMove(id) {
    if (!AKARI_ABILITIES.includes(id) || !AKARI_MOVES[id]) return null;
    return moveCopy({ id }, AKARI_MOVES[id]);
  },
  // Akari's moves and the reduced versions of them Act II's sub-bosses fight with (AKARI_ABILITIES and AKARI_VARIANTS
  // in 10-data.js): the numbers the move runs with (Akari's, with a variant's overrides on top) plus { id, base,
  // reduced }, where `base` is the Akari ability whose code runs. null for any other id.
  akariDerived(id) { return derivedMove(id, AKARI_ABILITIES, AKARI_VARIANTS, AKARI_MOVES); },
  // One of Takashi's moves (TAKASHI_MOVES in 10-data.js): a copy of its numbers (label, windup tell, cooldown, range,
  // damage...) with its id; null for any other id. Act III's sub-bosses (SAN-41) can build on these.
  takashiMove(id) {
    if (!TAKASHI_ABILITIES.includes(id) || !TAKASHI_MOVES[id]) return null;
    return moveCopy({ id }, TAKASHI_MOVES[id]);
  },
  // Takashi's moves and the reduced versions of them Act III's sub-bosses fight with (TAKASHI_ABILITIES and
  // TAKASHI_VARIANTS in 10-data.js): the numbers the move runs with (his, with a variant's overrides on top) plus
  // { id, base, reduced }, where `base` is the Takashi ability whose code runs. null for any other id.
  takashiDerived(id) { return derivedMove(id, TAKASHI_ABILITIES, TAKASHI_VARIANTS, TAKASHI_MOVES); },
  // How predictable a move is in the player's recent history (move ids, oldest first): its share of the last
  // PATTERN_READ.last moves, or 0 until PATTERN_READ.min moves are known. FightSession.predictability calls this.
  predictability(history, id) {
    const h = (history || []).slice(-PATTERN_READ.last); if (h.length < PATTERN_READ.min) return 0;
    return h.filter(x => x === id).length / h.length;
  },
  // Whether a move is a readable pattern (Takashi's Guard Return reads it and punishes): the same move
  // PATTERN_READ.streak times running at the end of the history, or a predictability of at least PATTERN_READ.share.
  readsPattern(history, id) {
    const h = history || [], n = PATTERN_READ.streak;
    if (h.length >= n && h.slice(-n).every(x => x === id)) return true;
    return this.predictability(h, id) >= PATTERN_READ.share;
  },
  // Takashi's Iron Guard (TAKASHI_GUARD, his phase flag `ironGuard`): whether the strike Kage is making now (`id`, the
  // newest entry of his move history) repeats one of his previous `span` moves. A repeat is parried; only a move
  // he has not used in that many moves lands. The first strike of a fight, or any fresh one, is never read.
  ironGuardReads(history, id, span) {
    const h = history || [], n = span || TAKASHI_GUARD.span;
    const prev = h[h.length - 1] === id ? h.slice(0, -1) : h;
    return prev.slice(-n).includes(id);
  },
  // The input key a player action counts under for the spam read: 'dash', 'jump', or a move's: a directional form is
  // its own key ('dir:up', 'dir:sweep'...), the weapon string is 'weapon', and punches, kicks, air attacks, kunai and
  // grabs go by their kind.
  spamKey(m) {
    if (!m) return null;
    if (typeof m === 'string') return m;
    if (m.aim) return 'dir:' + m.aim;
    return m.kind === 'throw' ? 'kunai' : m.kind;
  },
  // The spam read (SPAM_READ): actions [{ k, t }] oldest first, `now` the session clock, `stringLen` the weapon string's
  // length. Returns { key, streak } when the newest action is the same key SPAM_READ.streak times running (each within
  // SPAM_READ.gap seconds of the one before, or its SPAM_READ.gaps entry; a weapon string needs its length plus one),
  // else null. Grabs never count.
  spamRead(actions, now, stringLen) {
    const a = actions || [], L = a.length;
    if (!L) return null;
    const last = a[L - 1];
    const gap = (SPAM_READ.gaps && SPAM_READ.gaps[last.k]) || SPAM_READ.gap;
    if (!last.k || last.k === 'grab' || now - last.t > gap) return null;
    let n = 1;
    for (let i = L - 2; i >= 0 && a[i].k === last.k && a[i + 1].t - a[i].t <= gap; i--) n++;
    const S = SPAM_READ.streak;
    const need = last.k === 'weapon' ? Math.max(S.weapon, (stringLen || 0) + 1) : last.k.startsWith('dir:') ? S.dir : (S[last.k] || 4);
    return n >= need ? { key: last.k, streak: n } : null;
  },
  /* ---- the Core's echoes (core.echo1..4) ---- */
  // One of the echoes' corrupted moves (CORE_ECHO_MOVES): the numbers it runs with (its original's, AKARI_MOVES or
  // TAKASHI_MOVES, with the echo's on top; Raikon's are written out on the entry) plus { id, base, of, corrupt: true }.
  // A copy; null for any other id (the originals' own moves are not echoes).
  echoMove(id) {
    const v = CORE_ECHO_MOVES[id];
    if (!v) return null;
    const orig = v.of === 'akari' ? AKARI_MOVES[v.base] : v.of === 'takashi' ? TAKASHI_MOVES[v.base] : null;
    return moveCopy(orig, v, { id, corrupt: true });
  },
  /* ---- the Witness (core.witness) ---- */
  // One of the Witness's moves (WITNESS_MOVES): a copy with its id; null for any other id.
  witnessMove(id) { return WITNESS_MOVES[id] ? moveCopy({ id }, WITNESS_MOVES[id]) : null; },
  // The attack state machine's timeline for one of its moves (WitnessAttack, 69-witness.js): Telegraph -> Startup ->
  // Active -> Recovery, each { stage, at, dur } in seconds from the start. `tellMul` scales the telegraph (the difficulty
  // mode's windup, phase IV's jitter); no telegraph is ever shorter than WITNESS_ADAPT.minTell. The cool-down follows on
  // the AI's clock (`cd`). null for an unknown move.
  witnessStages(id, tellMul) {
    const m = WITNESS_MOVES[id]; if (!m) return null;
    const durs = [Math.max(WITNESS_ADAPT.minTell, m.windup * (tellMul || 1)), m.startup || 0, m.active || 0, m.recovery || 0];
    let at = 0;
    return ['telegraph', 'startup', 'active', 'recovery'].map((stage, i) => { const st = { stage, at, dur: durs[i] }; at += durs[i]; return st; });
  },
  // The stage of a timeline at time t (seconds): 'telegraph' | 'startup' | 'active' | 'recovery' | 'cooldown' (after it).
  witnessStageAt(stages, t) {
    for (const st of stages || []) if (t < st.at + st.dur) return st.stage;
    return 'cooldown';
  },
  // The InputModifierLayer as a pure function (WitnessInput applies it each tick): the controls Kage's character
  // receives, given the raw controls read from the devices and the modifiers biting now. `raw` is never written.
  // mods: [{ kind: 'bind', dir } | { kind: 'reverse' } | { kind: 'delay', keys } | { kind: 'lock', lock }]; `late` is
  // the raw controls of `delay` seconds ago (the runtime keeps that history), read for a delay's keys.
  // Order: delay, reverse, bind, lock (a lock always wins).
  witnessInput(raw, mods, late) {
    const out = Object.assign({}, raw), zero = v => (typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : null);
    const list = mods || [], of = k => list.filter(m => m.kind === k);
    // a delayed key reads the controls of `delay` ago; before any have arrived it reads as released (never undefined)
    for (const m of of('delay')) for (const k of m.keys || []) out[k] = late && late[k] !== undefined ? late[k] : zero(raw[k]);
    if (of('reverse').length % 2 === 1) { out.dir = -out.dir || 0; out.tapDir = -out.tapDir || 0; }
    for (const m of of('bind')) { if (out.dir === m.dir) out.dir = 0; if (out.tapDir === m.dir) out.tapDir = 0; }
    for (const m of of('lock')) for (const k of WITNESS_INPUT.lockKeys[m.lock] || []) out[k] = zero(raw[k]);
    return out;
  },
  // The AdaptiveTracker's read of Kage's habits: log is his recent action keys, oldest first (move keys from spamKey,
  // and 'dash', 'jump', 'block'), weighed over the last WITNESS_ADAPT.span. { n, top, share, overused, defensive,
  // counts }: `top` his most used attack (ties: the latest), `share` its fraction of his attacks, `overused` once at
  // least `min` actions are in and share >= WITNESS_ADAPT.overuse, `defensive` the share of blocks and dashes.
  witnessAdapt(log, min) {
    const a = (log || []).slice(-WITNESS_ADAPT.span), counts = {};
    let atk = 0, def = 0;
    for (const k of a) {
      if (k === 'block' || k === 'dash') { def++; continue; }
      if (k === 'jump') continue;
      counts[k] = (counts[k] || 0) + 1; atk++;
    }
    let top = null;
    for (let i = a.length - 1; i >= 0; i--) { const k = a[i]; if (counts[k] && (!top || counts[k] > counts[top])) top = k; }
    const share = top ? counts[top] / atk : 0;
    return { n: a.length, top, share, overused: a.length >= (min || 5) && share >= WITNESS_ADAPT.overuse, defensive: a.length ? def / a.length : 0, counts };
  },
  // The player's moves (log: [{ id, t, hit }], oldest first) cut into strings: moves ECHO_REPLICATION.gap seconds apart
  // or less belong together. Throws and grabs are never part of a string the Witness can copy.
  echoStrings(log) {
    const out = []; let cur = null, last = -1e9;
    for (const e of log || []) {
      const m = MOVES[e.id];
      if (!m || m.kind === 'throw' || m.kind === 'grab') continue;
      if (!cur || e.t - last > ECHO_REPLICATION.gap) { cur = []; out.push(cur); }
      cur.push(e); last = e.t;
    }
    return out;
  },
  // Echo Replication: the pattern the Witness copies is the player's LATEST string that landed on it (its last
  // ECHO_REPLICATION.max moves). { moves, repeats, punish }: `repeats` is how many landed strings in a row (counting
  // back from it) were that same pattern; `punish` once it is ECHO_REPLICATION.spam or more (spam is read and punished).
  // null until a blow has landed.
  echoReplication(log) {
    const hit = this.echoStrings(log).filter(s => s.some(e => e.hit)).map(s => s.slice(-ECHO_REPLICATION.max).map(e => e.id));
    if (!hit.length) return null;
    const moves = hit[hit.length - 1], key = moves.join(' ');
    let repeats = 0;
    for (let i = hit.length - 1; i >= 0 && hit[i].join(' ') === key; i--) repeats++;
    return { moves, repeats, punish: repeats >= ECHO_REPLICATION.spam };
  },
  // Echo Replication as Kage's own rage art (Mugen no Ha; ECHO_ART): the moves his phantom memory-shard copy replays on
  // the foe. It copies his latest landed string (echoReplication over his hit log), grounded strikes only; with nothing
  // to copy it falls back to the weapon's own grounded string. { moves: [{ id, dmgMul, finisher }], echoed, windup, life }
  echoArt(log, weaponId) {
    const grounded = id => MOVES[id] && ECHO_ART.kinds.includes(MOVES[id].kind);
    const echo = this.echoReplication(log);
    let ids = echo ? echo.moves.filter(grounded) : [];
    const echoed = ids.length > 0;
    if (!echoed) ids = ((WEAPONS[weaponId] || WEAPONS.kagetsu).moves || WEAPONS.kagetsu.moves).filter(grounded);
    return {
      echoed, windup: ECHO_ART.windup, life: ECHO_ART.life,
      moves: ids.map((id, i) => ({ id, finisher: i === ids.length - 1, dmgMul: i === ids.length - 1 ? ECHO_ART.finisherMul : ECHO_ART.dmgMul }))
    };
  },
  // Phase 1's mirror: the player's latest string, with the wait before each move (0 for the first), for the Witness to
  // replay with Kage's own timing. [] before he has attacked.
  mirrorSequence(log) {
    const s = this.echoStrings(log), last = s[s.length - 1] || [];
    return last.slice(-ECHO_REPLICATION.max).map((e, i, a) => ({ id: e.id, wait: i ? e.t - a[i - 1].t : 0 }));
  },
  // The remembered place Memory Break's n-th shift turns the arena into (MEMORY_BREAK.envs in turn).
  memoryBreakEnv(n) { const e = MEMORY_BREAK.envs; return e[((n % e.length) + e.length) % e.length]; },
  // A weapon's grounded string as it plays at a level: [{ id, startup, active, recovery, dmg, reach }] with the
  // weapon's speed, damage and reach multipliers (weaponMul) applied, so two blades can be compared (Shinsen vs Kagetsu).
  weaponMoves(id, lvl) {
    const w = WEAPONS[id]; if (!w) return [];
    const wm = weaponMul(id, lvl);
    return (w.moves || []).map(mid => {
      const m = MOVES[mid];
      return { id: mid, startup: m.t[0] / wm.spd, active: m.t[1], recovery: m.t[2] / wm.spd, dmg: m.dmg * wm.dmg, reach: (m.box[0] + m.box[2]) * wm.reach };
    });
  },
  // Final Flow (FINAL_FLOW in 10-data.js): Shinsen's rage art and a boss ability Takashi reuses. A deep copy of the
  // table with `o` (optional) merged over its top level, e.g. { windup, dmg, unb, label } for a boss's tuning; the
  // runner finalFlow() in 30-combat.js performs whatever this returns.
  finalFlow(o) {
    return Object.assign(JSON.parse(JSON.stringify(FINAL_FLOW)), o ? JSON.parse(JSON.stringify(o)) : {});
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
  // The City of Echoes (Act II) is rebuilt from stored memories, and it shows. Everything a stretch stands on its
  // road, sorted by x: its hand-placed `props`, plus its `loop` ({ from, period, count, block: [{ type, dx, ... }] }),
  // the same street block laid down `count` times, `period` apart, with a `seam` prop where each repeat begins.
  // Every copy of a block item keeps its fields (a sign keeps its id, so all its copies are one sign) and gets `copy`.
  streetProps(stretch) {
    const out = (stretch.props || []).map(p => Object.assign({}, p)), L = stretch.loop;
    if (L) for (let i = 0; i < L.count; i++) {
      const x0 = L.from + i * L.period;
      if (i > 0) out.push({ type: 'seam', x: x0, copy: i });
      for (const b of L.block) out.push(Object.assign({}, b, { x: x0 + b.dx, copy: i }));
    }
    return out.sort((a, b) => a.x - b.x || (a.type === 'seam' ? -1 : b.type === 'seam' ? 1 : 0));
  },
  // A sign in the City of Echoes changes while nobody is looking. signStep(state, visible) advances its state by one
  // frame (state null = never seen): it reads the next text each time it comes back into view after leaving it, and
  // never while it is watched. signText(sign, state) is what it reads now (sign.texts, cycling).
  signStep(state, visible) {
    const s = state ? Object.assign({}, state) : { views: 0, seen: false, onScreen: false };
    if (visible && !s.onScreen && s.seen) s.views++;
    if (visible) s.seen = true;
    s.onScreen = !!visible;
    return s;
  },
  signText(sign, state) { const t = sign.texts || []; return t.length ? t[((state && state.views) || 0) % t.length] : ''; },
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
  /* Tutorial prompts. A stretch may carry `tutorial: [{ step, at }]` (steps from TUTORIAL_STEPS, 10-data.js):
     in-world prompts shown one at a time, in order. `done` is how many are cleared. A prompt shows once every
     earlier one is cleared and Kage has reached its `at`; it clears when he performs its action while it shows. */
  // The prompt showing for Kage at x ({ step, at }), or null.
  tutorialPrompt(stretch, done, x) {
    const t = stretch && stretch.tutorial, p = t && t[done];
    return p && x >= p.at ? p : null;
  },
  // The cleared count after this tick's actions (a list of step ids Kage performed). One prompt per tick at most.
  advanceTutorial(stretch, done, x, actions) {
    const p = this.tutorialPrompt(stretch, done, x);
    return p && actions.includes(p.step) ? done + 1 : done;
  },
  // What a prompt says on an input device ('keyboard' | 'touch' | 'pad'; anything else reads as keyboard):
  // { verb, hint, keys }, or null for an unknown step.
  tutorialLabel(step, device) {
    const d = TUTORIAL_STEPS[step];
    if (!d) return null;
    const dev = d.keys[device] ? device : 'keyboard';
    return { step, verb: d.verb, hint: d.hint, device: dev, keys: d.keys[dev].slice() };
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
  // Echo Trials wave. Drives AI sharpness. It never reads the player's level, experience or gear.
  stageLevel(cfg, enemyId, wave) {
    const d = ENEMIES[enemyId];
    if (cfg.mode === 'trials') return 1 + (wave || cfg.wave || 1) * 0.35;
    const tier = (cfg.diff || 1) - 1, st = cfg.pos || 0;
    return 1 + tier * 1.6 + st * 0.22 + (d.type === 'sub' ? 0.4 : d.type === 'boss' ? 0.8 : 0);
  },
  // The foe a boss summons in this fight (cfg from stageConfig; Echo Trials has no chapter): see BOSS_MINIONS.
  minionId(cfg) { return BOSS_MINIONS[(cfg && cfg.chapter) || 'default'] || BOSS_MINIONS.default; },
  // A foe's fight stats: { hp, dmgMul, wlvl, defense, speedMul, level, ng, difficulty }. They depend only on the
  // chosen mode (save.difficulty), the authored curve (stage / chapter tier, Echo Trials wave, New Game+ cycle) and the
  // foe's role: 'minion' (a boss's summoned recruit, 70 base health, 60% damage), 'clone' (1 health, half damage) or
  // 'elite' (an Echo Trials elite Hollow: TRIALS.elite health and damage on top of everything else).
  // Sub-bosses and bosses take the mode's boss multipliers; everyone else the regular ones.
  enemyStats(save, cfg, enemyId, opts) {
    opts = opts || {};
    const d = ENEMIES[enemyId], ng = cfg.ng || 0, mode = this.difficulty(save.difficulty);
    const wave = opts.wave || cfg.wave || 1, trials = cfg.mode === 'trials';
    const role = opts.role || null, bossy = (d.type === 'boss' || d.type === 'sub') && role !== 'minion';
    let hpMul = 1 + 0.35 * ng, dmgMul = (d.dmg || 1) * (1 + 0.25 * ng);
    if (trials) { hpMul *= 0.85 + wave * 0.07; dmgMul *= 0.9 + wave * 0.04; }
    if (role === 'elite') { hpMul *= TRIALS.elite.hp; dmgMul *= TRIALS.elite.dmg; }
    hpMul *= bossy ? mode.bossHp : mode.hp;
    dmgMul *= bossy ? mode.bossDmg : mode.dmg;
    let hp = Math.round(d.hp * hpMul);
    if (role === 'minion') { hp = Math.round(70 * mode.hp); dmgMul *= 0.6; }
    if (role === 'clone') { hp = 1; dmgMul *= 0.5; }
    const raw = Math.round(1 + ((cfg.diff || 1) - 1) * 2.2 + (cfg.pos || 0) * 0.3 + ng * 2 + (trials ? wave * 0.3 : 0));
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
    const once = this.defeatedCount(save, id) > 0 ? 0 : this.stageRewardGems(id);   // reward gems: once ever
    return { coins, gems: cleared ? 0 : this.firstClearGems(this.stageRewardType(id)) + once };
  },
  trialWaveReward(wave) {
    return { coins: TRIALS.coins(wave), gems: wave % TRIALS.gemsEvery === 0 ? 1 : 0 };
  },
  /* ---------------- Echo Trials ----------------
     Endless Hollow waves in a shifting memory arena (TRIALS, 10-data.js). echoTrialWave(save, n, rand) says what wave n
     sends: { wave, foes, bossEcho, elite, env }. `foes` are enemy ids, the first one leads (the HUD's bar); the wave is
     cleared when every one is down. Waves escalate: more Hollows (TRIALS.count) and heavier units (TRIALS.pool[].from).
     Every TRIALS.bossEvery-th wave is a boss echo, `{ stageId, enemyId, name, kind }`, picked from the bosses this save
     has beaten in the story (echoTrialBosses), fighting alone in its own stage's arena; with none beaten it is an elite
     Hollow pack instead (`elite`, TRIALS.eliteWave, fought with role 'elite'). The arena shifts to the next remembered
     place (TRIALS.envs) every TRIALS.shiftEvery waves. `rand` (default Math.random) makes every pick, so a seeded or
     fixed function gives the same wave every time. */
  // The bosses this save has beaten in the story: every defeated stage of kind subboss, boss or echo, in story order.
  echoTrialBosses(save) {
    return this.bossRushRoster(save).filter(b => b.available)
      .map(b => ({ stageId: b.stageId, enemyId: b.enemyId, name: b.name, kind: b.kind }));
  },
  echoTrialEnv(n) { const e = TRIALS.envs, i = Math.floor((Math.max(1, n) - 1) / TRIALS.shiftEvery); return e[i % e.length]; },
  echoTrialWave(save, n, rand) {
    rand = rand || Math.random; n = Math.max(1, n | 0);
    const pick = list => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];
    const out = { wave: n, foes: [], bossEcho: null, elite: false, env: this.echoTrialEnv(n) };
    const pool = TRIALS.pool.filter(u => n >= u.from).map(u => u.id);
    if (n % TRIALS.bossEvery === 0) {
      const bosses = this.echoTrialBosses(save);
      if (bosses.length) {
        const b = pick(bosses), st = this.stage(b.stageId);
        out.bossEcho = b; out.foes = [b.enemyId];
        out.env = st.env || this.chapterOf(b.stageId).env;
        return out;
      }
      out.elite = true;
      const ew = TRIALS.eliteWave;
      out.foes = [ew.lead];
      for (let i = 1; i < ew.count + Math.min(1, Math.floor(n / 15)); i++) out.foes.push(pick(pool));
      return out;
    }
    const count = TRIALS.count.reduce((c, step) => n >= step.from ? step.n : c, 1);
    for (let i = 0; i < count; i++) out.foes.push(pick(pool));
    return out;
  },
  /* ---------------- Boss Rush ----------------
     Every boss of the story in story order (every CAMPAIGN stage of kind subboss, boss or echo: TRIALS.bossKinds), so
     a boss a later update adds joins on its own. A boss is available once beaten in the story (save.defeated). A run
     fights the available ones back to back, each as the story boss format in its own stage's arena, with no story
     scenes and no story effects: health carries over with BOSS_RUSH.heal of max health restored between fights, the
     difficulty mode applies as everywhere, and the end pays BOSS_RUSH.coins per boss beaten and keeps `bossRushBest`
     ({ bosses, time }: more bosses wins, then the faster time). A run never clears stages, records defeats or fates,
     grants gear, gems or XP. */
  BOSS_RUSH,
  // [{ stageId, enemyId, name, title, kind, chapter, available }] in story order.
  bossRushRoster(save) {
    const def = (save && save.defeated) || {};
    return STAGE_LIST.filter(st => TRIALS.bossKinds.includes(st.kind) && ENEMIES[st.enemy]).map(st => ({
      stageId: st.id, enemyId: st.enemy, name: st.foe || ENEMIES[st.enemy].name, title: st.foeTitle || ENEMIES[st.enemy].title || '',
      kind: st.kind, chapter: st.chapter, available: def[st.id] > 0 || this.devUnlocked()
    }));
  },
  // A new run over the available bosses (from the stage `from` on, when given), or null when none is available:
  // { stages, index, beaten, time, hp, done, cleared }. `hp` is the health the next fight starts with (null = full).
  bossRushRun(save, from) {
    let list = this.bossRushRoster(save).filter(b => b.available).map(b => b.stageId);
    const i = from ? list.indexOf(from) : 0;
    if (i > 0) list = list.slice(i);
    return list.length ? { stages: list, index: 0, beaten: 0, time: 0, hp: null, done: false, cleared: false } : null;
  },
  // The fight config of one rush boss: its stage's config (arena, chapter curve, foe name) as mode 'bossrush'.
  bossRushConfig(save, stageId) {
    return Object.assign(this.stageConfig(save, stageId), { mode: 'bossrush', format: this.fightFormat({ mode: 'bossrush', stageId, enemyId: this.stage(stageId).enemy }) });
  },
  // The health the next fight starts with: what was left plus BOSS_RUSH.heal of max health, capped at max.
  bossRushCarryHp(hp, maxHp) { return Math.min(maxHp, Math.round(Math.max(0, hp) + maxHp * BOSS_RUSH.heal)); },
  // A run after one fight ({ win, time, hp, maxHp }): a new run object, done on a loss or after the last boss.
  bossRushAdvance(run, fight) {
    const r = Object.assign({}, run, { time: run.time + (fight.time || 0) });
    if (!fight.win) return Object.assign(r, { done: true, cleared: false });
    r.beaten++; r.index++; r.hp = this.bossRushCarryHp(fight.hp, fight.maxHp);
    if (r.index >= r.stages.length) Object.assign(r, { done: true, cleared: true });
    return r;
  },
  // Applies a finished run to the save: { mode: 'bossrush', beaten, total, time, cleared, coins, gems, xp, newBest, best }.
  applyBossRushResult(save, run) {
    const coins = run.beaten * BOSS_RUSH.coins, prev = save.bossRushBest || { bosses: 0, time: 0 };
    const newBest = run.beaten > 0 && (run.beaten > prev.bosses || (run.beaten === prev.bosses && run.time < prev.time));
    if (newBest) save.bossRushBest = { bosses: run.beaten, time: run.time };
    save.coins += coins;
    return { mode: 'bossrush', beaten: run.beaten, total: run.stages.length, time: run.time, cleared: !!run.cleared,
      stages: run.stages.slice(), coins, gems: 0, xp: 0, newBest, best: Object.assign({}, save.bossRushBest) };
  },
  // Applies a finished fight (campaign or Echo Trials) to the save and returns what it earned:
  // { coins, gems, xp, rating, seals, unlocks, firstClear, next?, levelUps, levelBefore, xpBefore, newBest? }
  // A campaign result names its stage by `stageId`; a win completes that stage (see completeStage). A win on a stage
  // completeStage refuses (still locked) earns nothing and comes back with `rejected: true`.
  // plus every field of the fight result. The save is updated in place; persisting it is the caller's job.
  applyFightResult(save, r) {
    const out = Object.assign({}, r, { coins: 0, gems: 0, xp: 0, unlocks: [], levelUps: 0, firstClear: false });
    const ngMul = this.ngRewardMul(r.ng);
    if (r.mode === 'campaign') {
      const id = r.stageId, type = this.stageRewardType(id), diff = this.chapterOf(id).diff;
      const base = this.stageBaseCoins(id);
      // the spar cannot be lost and has no winner: whatever the health bars said, Takashi interrupted it
      const spar = this.stage(id).kind === 'spar';
      if (spar) { r = Object.assign({}, r, { win: true }); out.win = true; out.outcome = 'interrupted'; out.winner = null; }
      out.rating = this.rateFight(r);
      out.seals = [r.win, r.win && r.time < 60, r.win && r.flawless];
      if (r.win) {
        const done = this.completeStage(save, id);
        // a win on a stage that is still locked (completeStage refused it) earns nothing at all
        if (!done) { out.rejected = true; out.levelBefore = save.level; out.xpBefore = save.xp; return out; }
        out.firstClear = done.firstClear;
        out.coins = Math.round(base * ngMul * ({ S: 1.5, A: 1.25, B: 1.1, C: 1 }[out.rating]) * (out.firstClear ? 1 : 0.5) / 5) * 5;
        // done.gems (a stage's reward gems) were already paid into the save by completeStage
        out.gems = (out.firstClear ? this.firstClearGems(type) : (type === 'boss' ? 1 : 0)) + (r.flawless ? 1 : 0);
        out.rewardGems = done.gems || 0;
        out.xp = Math.round((type === 'boss' ? 300 : type === 'sub' ? 150 : 80) * diff * ngMul);
        if (!spar) { save.stats.wins++; if (r.flawless) save.stats.perfects++; }
        if (type === 'boss') save.stats.bosses++;
        out.unlocks.push(...done.unlocks);
        out.next = done.next;
      } else {
        out.coins = Math.round(base * 0.25 / 5) * 5; out.xp = 20 * diff; save.stats.losses++;
      }
    } else {
      out.coins = r.trialCoins; out.gems = r.trialGems; out.xp = 40 * r.waves;
      out.rating = r.waves >= 15 ? 'S' : r.waves >= 10 ? 'A' : r.waves >= 5 ? 'B' : 'C';
      out.newBest = r.waves > save.trialsBest;
      if (out.newBest) save.trialsBest = r.waves;
      out.seals = [r.waves >= 5, r.waves >= 10, r.waves >= 15];
      save.stats.wins += r.waves; save.stats.losses++;
    }
    save.coins += out.coins; save.gems += out.gems; save.xp += out.xp;
    if (out.rewardGems) out.gems += out.rewardGems;
    out.levelBefore = save.level; out.xpBefore = save.xp - out.xp;
    while (save.xp >= xpForLevel(save.level)) { save.xp -= xpForLevel(save.level); save.level++; out.levelUps++; }
    return out;
  },

  // "Erase all progress": a fresh save that keeps the player's settings.
  resetSave(prev) {
    const d = this.defaultSave();
    if (prev && prev.settings) d.settings = prev.settings;
    if (this.devUnlocked()) this.applyDevUnlock(d);
    return d;
  }
};
