/* KAGE — Logic: the pure rules of progression (campaign unlocks, rewards, economy, save schema).
   No DOM, canvas, window, storage, audio or input here: it reads the data tables from 10-data.js
   and works on plain save objects, so it runs unchanged under Node (see tests/ and the README).
   SaveManager owns storage; the engine and UI ask this module what the rules say. */

/* ---------------- economy formulas ----------------
   Kept as top-level functions because the fighter, combat and AI modules call them directly
   in hot paths; they are also exposed on Logic below. */
function gearTable(kind) { return kind === 'weapons' ? WEAPONS : kind === 'helmets' ? HELMETS : ARMORS; }
function upgradeCost(kind, id, lvl) {
  const item = gearTable(kind)[id];
  const base = item.price || (item.gems ? item.gems * 60 : 500);
  return Math.round(Math.max(160, base * (0.35 + 0.3 * lvl)) / 10) * 10;
}
function weaponStats(id, lvl) {
  const w = WEAPONS[id], s = w.stats || [40, 50, 40];
  const l = (lvl || 1) - 1;
  return { damage: Math.min(100, s[0] + l * 4), speed: Math.min(100, s[1] + l * 2), reach: Math.min(100, s[2] + l * 1) };
}
function weaponMul(lvl) { const l = (lvl || 1) - 1; return { dmg: 1 + 0.08 * l, spd: 1 + 0.025 * l, reach: 1 + 0.015 * l }; }
function gearDef(kind, id, lvl) { const g = gearTable(kind)[id]; return g.def ? g.def + 0.012 * ((lvl || 1) - 1) : 0; }
function playerMaxHp(save) {
  const a = ARMORS[save.equipped.armor], h = HELMETS[save.equipped.helmet];
  return Math.round(220 + (save.level - 1) * 4 + ((a.perks.hp || 0) + (h.perks.hp || 0)));
}
function xpForLevel(lvl) { return 200 + 120 * (lvl - 1); }

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
      cleared: {},            // "act-stage" -> true, current cycle
      unlockedActs: 1,
      defeated: {},           // enemyId -> count (lifetime)
      owned: { weapons: { moon_katana: 1 }, helmets: { topknot: 1 }, armors: { wraps: 1 } },
      equipped: { weapon: 'moon_katana', helmet: 'topknot', armor: 'wraps' },
      seenRewards: {},
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
    d.equipped = Object.assign(this.defaultSave().equipped, s.equipped || {});
    d.stats = Object.assign(this.defaultSave().stats, s.stats || {});
    d.settings = Object.assign(this.defaultSave().settings, s.settings || {});
    d.cleared = s.cleared || {};
    d.defeated = s.defeated || {};
    d.seenRewards = s.seenRewards || {};
    return d;
  },
  /* ---------------- campaign ---------------- */
  stageKey(act, stage) { return `${act}-${stage}`; },
  isStageCleared(save, act, stage) { return !!save.cleared[this.stageKey(act, stage)]; },
  isActUnlocked(save, act) { return act < save.unlockedActs; },
  // The last stage of every act is its boss; beating it clears the act.
  isActCleared(save, act) { return this.isStageCleared(save, act, ACTS[act].stages.length - 1); },
  stageUnlocked(save, act, stage) {
    if (!this.isActUnlocked(save, act)) return false;
    if (stage === 0) return true;
    return this.isStageCleared(save, act, stage - 1) || this.isStageCleared(save, act, stage);
  },
  // First uncleared stage of the unlocked acts, or null when nothing is left to clear.
  nextStage(save) {
    for (let a = 0; a < ACTS.length; a++) {
      if (!this.isActUnlocked(save, a)) break;
      for (let s = 0; s < ACTS[a].stages.length; s++) if (!this.isStageCleared(save, a, s)) return { act: a, stage: s };
    }
    return null;
  },
  stageConfig(save, act, stage) {
    const A = ACTS[act], st = A.stages[stage];
    return { mode: 'campaign', act, stage, enemyId: st.enemy, env: A.env, ng: save.ng };
  },
  // Starts the next New Game+ cycle: campaign progress resets, everything else is kept.
  startNewGamePlus(save) {
    if (!save.ngUnlocked) return false;
    save.ng = (save.ng || 0) + 1; save.cleared = {}; save.unlockedActs = 1;
    return true;
  },

  /* ---------------- economy ---------------- */
  GEAR_MAX, gearTable, upgradeCost, weaponStats, weaponMul, gearDef, playerMaxHp, xpForLevel,
  equipSlot(kind) { return kind === 'weapons' ? 'weapon' : kind === 'helmets' ? 'helmet' : 'armor'; },
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
    if (!lvl || lvl >= GEAR_MAX[kind]) return false;
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
  stageBaseCoins(act, type) { return (60 + 45 * ACTS[act].diff) * this.rewardTypeMul(type); },
  // Performance rating of a campaign fight: S, A, B or C.
  rateFight(r) {
    if (!r.win) return 'C';
    const s = r.hpLeft * 40 + (r.time < 45 ? 20 : r.time < 80 ? 10 : 0) + Math.min(20, r.maxCombo * 2) + r.parries * 5 + (r.flawless ? 20 : 0);
    return s >= 85 ? 'S' : s >= 62 ? 'A' : s >= 42 ? 'B' : 'C';
  },
  // What the stage card promises before the fight (a C-rated win, without the flawless gem).
  stageRewardPreview(save, act, stage) {
    const foe = ENEMIES[ACTS[act].stages[stage].enemy], cleared = this.isStageCleared(save, act, stage);
    const coins = Math.round(this.stageBaseCoins(act, foe.type) * this.ngRewardMul(save.ng) * (cleared ? 0.5 : 1) / 5) * 5;
    const gems = cleared ? 0 : foe.type === 'boss' ? 5 : foe.type === 'sub' ? 2 : 0;
    return { coins, gems };
  },
  survivalWaveReward(wave) {
    return { coins: SURVIVAL.coins(wave), gems: wave % SURVIVAL.gemsEvery === 0 ? 1 : 0 };
  },
  // Applies a finished fight (campaign or survival) to the save and returns what it earned:
  // { coins, gems, xp, rating, seals, unlocks, firstClear, levelUps, levelBefore, xpBefore, newBest? }
  // plus every field of the fight result. The save is updated in place; persisting it is the caller's job.
  applyFightResult(save, r) {
    const out = Object.assign({}, r, { coins: 0, gems: 0, xp: 0, unlocks: [], levelUps: 0, firstClear: false });
    const ngMul = this.ngRewardMul(r.ng);
    if (r.mode === 'campaign') {
      const act = ACTS[r.act], d = ENEMIES[r.enemyId], key = this.stageKey(r.act, r.stage);
      const base = this.stageBaseCoins(r.act, d.type);
      out.rating = this.rateFight(r);
      out.seals = [r.win, r.win && r.time < 60, r.win && r.flawless];
      if (r.win) {
        out.firstClear = !save.cleared[key];
        out.coins = Math.round(base * ngMul * ({ S: 1.5, A: 1.25, B: 1.1, C: 1 }[out.rating]) * (out.firstClear ? 1 : 0.5) / 5) * 5;
        out.gems = (out.firstClear ? (d.type === 'boss' ? 5 : d.type === 'sub' ? 2 : 0) : (d.type === 'boss' ? 1 : 0)) + (r.flawless ? 1 : 0);
        out.xp = Math.round((d.type === 'boss' ? 300 : d.type === 'sub' ? 150 : 80) * act.diff * ngMul);
        save.cleared[key] = true;
        save.defeated[d.id] = (save.defeated[d.id] || 0) + 1;
        save.stats.wins++; if (r.flawless) save.stats.perfects++;
        if (d.reward) {
          if (d.reward.weapon && !save.owned.weapons[d.reward.weapon]) { save.owned.weapons[d.reward.weapon] = 1; out.unlocks.push({ kind: 'weapons', id: d.reward.weapon }); }
          if (d.reward.item && !save.owned[d.reward.item[0]][d.reward.item[1]]) { save.owned[d.reward.item[0]][d.reward.item[1]] = 1; out.unlocks.push({ kind: d.reward.item[0], id: d.reward.item[1] }); }
        }
        if (d.type === 'boss') {
          save.stats.bosses++;
          if (r.act + 2 > save.unlockedActs && r.act + 1 < ACTS.length) { save.unlockedActs = r.act + 2; out.unlocks.push({ kind: 'act', id: r.act + 1 }); }
          if (r.act === ACTS.length - 1) {
            if (!save.ngUnlocked) out.unlocks.push({ kind: 'ng' });
            save.ngUnlocked = true; if (out.firstClear) save.ngCompletions = Math.max(save.ngCompletions, (r.ng || 0) + 1);
          }
        }
      } else {
        out.coins = Math.round(base * 0.25 / 5) * 5; out.xp = 20 * act.diff; save.stats.losses++;
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
