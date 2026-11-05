'use strict';
// Difficulty modes: Easy, Normal, Hard, Impossible. The player picks one; it changes enemy and boss
// health, damage and AI timing, and nothing else (never the player's level or gear) scales the foes.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, AI_PROFILES } = loadLogic();
const ORDER = ['easy', 'normal', 'hard', 'impossible'];

test('the four modes exist in order, with player-facing names', () => {
  assert.deepEqual(Logic.DIFFICULTY_IDS, ORDER);
  assert.deepEqual(ORDER.map(id => Logic.difficulty(id).label), ['Easy', 'Normal', 'Hard', 'Impossible']);
});

test('each mode is harder than the one before: more health and damage, faster and more aggressive AI', () => {
  const rising = ['hp', 'dmg', 'bossHp', 'bossDmg', 'aggr', 'guard', 'branch', 'punish'];
  const falling = ['windup', 'react', 'recovery', 'idle', 'dodge'];
  for (let i = 1; i < ORDER.length; i++) {
    const a = Logic.difficulty(ORDER[i - 1]), b = Logic.difficulty(ORDER[i]);
    for (const k of rising) assert.ok(b[k] > a[k], `${k}: ${ORDER[i]} (${b[k]}) should be above ${ORDER[i - 1]} (${a[k]})`);
    for (const k of falling) assert.ok(b[k] < a[k], `${k}: ${ORDER[i]} (${b[k]}) should be below ${ORDER[i - 1]} (${a[k]})`);
  }
});

test('Normal keeps the original tuning: every multiplier is 1 and the combo branch stays at 15%', () => {
  const n = Logic.difficulty('normal');
  for (const k of ['hp', 'dmg', 'bossHp', 'bossDmg', 'aggr', 'guard', 'punish', 'windup', 'react', 'recovery', 'idle', 'dodge']) assert.equal(n[k], 1, k);
  assert.equal(n.branch, 0.15);
  assert.equal(n.unique, false);
});

test('only Impossible adds unique combo variations', () => {
  assert.deepEqual(ORDER.map(id => Logic.difficulty(id).unique), [false, false, false, true]);
});

test('Easy widens the player dodge window by half', () => {
  assert.equal(Logic.difficulty('easy').dodge, 1.5);
});

test('an unknown mode reads as Normal', () => {
  assert.equal(Logic.difficulty('nightmare').id, 'normal');
  assert.equal(Logic.difficulty(undefined).id, 'normal');
});

test('a new save is on Normal and has not asked for a mode yet', () => {
  const s = Logic.defaultSave();
  assert.equal(s.difficulty, 'normal');
  assert.equal(s.difficultyPicked, false);
});

test('picking a mode records it, and the chosen mode survives save and load', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.setDifficulty(s, 'impossible'), true);
  assert.equal(s.difficulty, 'impossible');
  assert.equal(s.difficultyPicked, true);
  const { save } = Logic.loadSave(JSON.stringify(s));
  assert.equal(save.difficulty, 'impossible');
  assert.equal(save.difficultyPicked, true);
});

test('an unknown mode is refused, and a stored unknown mode loads as Normal', () => {
  const s = Logic.defaultSave();
  assert.equal(Logic.setDifficulty(s, 'nightmare'), false);
  assert.equal(s.difficulty, 'normal');
  const { save } = Logic.loadSave(JSON.stringify(Object.assign(Logic.defaultSave(), { difficulty: 'nightmare' })));
  assert.equal(save.difficulty, 'normal');
});

test('winning fights, levelling up and New Game+ never change the mode', () => {
  const s = Logic.defaultSave();
  Logic.setDifficulty(s, 'easy');
  Logic.applyFightResult(s, { mode: 'campaign', stageId: 'prologue.1', win: true, hpLeft: 1, time: 20, maxCombo: 9, parries: 3, flawless: true, ng: 0 });
  for (let i = 0; i < 5; i++) Logic.applyFightResult(s, { mode: 'survival', waves: 30, survivalCoins: 0, survivalGems: 0 });
  s.ngUnlocked = true; Logic.startNewGamePlus(s);
  assert.ok(s.level > 1);
  assert.equal(s.ng, 1);
  assert.equal(s.difficulty, 'easy');
});

test('erasing progress starts a new game, which asks for a mode again', () => {
  const s = Logic.defaultSave();
  Logic.setDifficulty(s, 'hard');
  const fresh = Logic.resetSave(s);
  assert.equal(fresh.difficulty, 'normal');
  assert.equal(fresh.difficultyPicked, false);
});

/* ---- enemy stats: the mode and the authored stage curve, nothing else ---- */
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);
const saveOn = (mode, extra) => { const s = Logic.defaultSave(); if (mode) Logic.setDifficulty(s, mode); return Object.assign(s, extra || {}); };
const stageFoe = (save, stageId, opts) => { const cfg = Logic.stageConfig(save, stageId); return Logic.enemyStats(save, cfg, cfg.enemyId, opts); };

test('on Normal a campaign foe keeps its authored stats', () => {
  const s = saveOn('normal');
  const recruit = stageFoe(s, 'act1.stretch1');
  assert.equal(recruit.hp, 170); close(recruit.dmgMul, 0.9, 'dmg'); assert.equal(recruit.wlvl, 1); close(recruit.defense, 0.054, 'def');
  assert.equal(recruit.level, 1);
  const boss = stageFoe(s, 'act1.boss');
  assert.equal(boss.hp, 640); close(boss.dmgMul, 1.1, 'boss dmg'); assert.equal(boss.wlvl, 3); close(boss.level, 3.56, 'boss level');
});

test('regular foes use the mode health and damage; sub-bosses and bosses use the boss multipliers', () => {
  const easy = stageFoe(saveOn('easy'), 'act1.stretch1'), imp = stageFoe(saveOn('impossible'), 'act1.stretch1');
  assert.equal(easy.hp, 119); close(easy.dmgMul, 0.54, 'easy dmg');
  assert.equal(imp.hp, 272); close(imp.dmgMul, 1.35, 'impossible dmg');
  const easyBoss = stageFoe(saveOn('easy'), 'act1.boss'), impBoss = stageFoe(saveOn('impossible'), 'act1.boss');
  assert.equal(easyBoss.hp, 480); close(easyBoss.dmgMul, 0.715, 'easy boss dmg');
  assert.equal(impBoss.hp, 960); close(impBoss.dmgMul, 1.54, 'impossible boss dmg');
  assert.equal(stageFoe(saveOn('hard'), 'act1.sub1').hp, 425);
});

test('enemy and boss stats ignore the player level, experience and gear', () => {
  for (const mode of ORDER) {
    const fresh = saveOn(mode);
    const veteran = saveOn(mode, { level: 60, xp: 9000, coins: 99999 });
    veteran.owned.weapons.iwakudaki = 8; veteran.equipped.weapon = 'iwakudaki';
    for (const id of ['prologue.1', 'act1.stretch1', 'act1.sub1', 'act1.boss', 'core.witness'])
      assert.deepEqual(stageFoe(veteran, id), stageFoe(fresh, id), `${mode} ${id}`);
    const sv = { mode: 'survival', wave: 1, ng: 0 };
    assert.deepEqual(Logic.enemyStats(veteran, sv, 'echo_sentinel', { wave: 10 }), Logic.enemyStats(fresh, sv, 'echo_sentinel', { wave: 10 }), `${mode} survival`);
  }
});

test('survival foes climb with the wave on top of the mode', () => {
  const sv = { mode: 'survival', wave: 1, ng: 0 };
  const normal = Logic.enemyStats(saveOn('normal'), sv, 'echo_sentinel', { wave: 5 });
  assert.equal(normal.hp, 408); close(normal.dmgMul, 1.155, 'dmg'); assert.equal(normal.wlvl, 3); close(normal.level, 2.75, 'level');
  assert.equal(Logic.enemyStats(saveOn('impossible'), sv, 'echo_sentinel', { wave: 5 }).hp, 612);
});

test('New Game+ still sharpens foes as the authored curve', () => {
  const s = saveOn('normal', { ng: 1 });
  const recruit = stageFoe(s, 'act1.stretch1');
  assert.equal(recruit.hp, 230); close(recruit.dmgMul, 1.125, 'dmg'); assert.equal(recruit.wlvl, 3); assert.equal(recruit.ng, 1);
});

test('boss minions and shadow clones follow the mode too', () => {
  const cfg = s => Logic.stageConfig(s, 'act1.boss');
  const minion = mode => { const s = saveOn(mode); return Logic.enemyStats(s, cfg(s), Logic.minionId(cfg(s)), { role: 'minion' }); };
  assert.deepEqual([minion('easy').hp, minion('normal').hp, minion('impossible').hp], [49, 70, 112]);
  close(minion('normal').dmgMul, 0.54, 'normal minion dmg');
  close(minion('impossible').dmgMul, 0.81, 'impossible minion dmg');
  const clone = mode => { const s = saveOn(mode); return Logic.enemyStats(s, cfg(s), 'echo_warden', { role: 'clone' }); };
  assert.equal(clone('impossible').hp, 1);
  close(clone('normal').dmgMul, 0.55, 'normal clone dmg');
  close(clone('easy').dmgMul, 0.3575, 'easy clone dmg');
});

/* ---- AI timing ---- */
test('on Normal a regular foe at the start of the story keeps its original AI tuning', () => {
  const p = Logic.aiTuning('regular', { level: 1, ng: 0, difficulty: 'normal' });
  close(p.aggr, 0.44, 'aggr'); close(p.block, 0.285, 'block'); close(p.parry, 0.042, 'parry'); close(p.punish, 0.4675, 'punish');
  close(p.react[0], 0.3, 'react min'); close(p.react[1], 0.5, 'react max');
  assert.deepEqual([p.windup, p.recovery, p.idle, p.branch, p.unique], [1, 1, 1, 0.15, false]);
});

test('Impossible reacts faster, attacks, guards and punishes more, and cuts its idle gaps', () => {
  const p = Logic.aiTuning('regular', { level: 1, ng: 0, difficulty: 'impossible' });
  close(p.aggr, 0.572, 'aggr'); close(p.block, 0.3705, 'block'); close(p.punish, 0.6545, 'punish');
  close(p.react[0], 0.18, 'react min'); close(p.react[1], 0.3, 'react max');
  assert.deepEqual([p.windup, p.recovery, p.idle, p.branch, p.unique], [0.72, 0.65, 0.6, 0.45, true]);
});

test('every AI profile gets sharper from Easy to Impossible', () => {
  for (const prof of Object.keys(AI_PROFILES)) for (let i = 1; i < ORDER.length; i++) {
    const a = Logic.aiTuning(prof, { level: 2, difficulty: ORDER[i - 1] }), b = Logic.aiTuning(prof, { level: 2, difficulty: ORDER[i] });
    assert.ok(b.react[0] < a.react[0] && b.react[1] < a.react[1], `${prof} react ${ORDER[i]}`);
    assert.ok(b.aggr > a.aggr, `${prof} aggr ${ORDER[i]}`);
    assert.ok(b.punish > a.punish, `${prof} punish ${ORDER[i]}`);
    assert.ok(b.windup < a.windup && b.idle < a.idle && b.recovery < a.recovery, `${prof} timing ${ORDER[i]}`);
  }
});

test('clones and minions keep their fixed aggression on Normal and follow the mode elsewhere', () => {
  assert.equal(Logic.aiTuning('boss', { level: 4, difficulty: 'normal', role: 'clone' }).aggr, 0.8);
  assert.equal(Logic.aiTuning('regular', { level: 4, difficulty: 'normal', role: 'minion' }).aggr, 0.6);
  close(Logic.aiTuning('regular', { level: 4, difficulty: 'easy', role: 'minion' }).aggr, 0.45, 'easy minion');
  assert.equal(Logic.aiTuning('boss', { level: 4, difficulty: 'impossible', role: 'clone' }).aggr, 0.99);
});

test('tuning hands out a fresh profile: the shared table is never changed', () => {
  const before = JSON.stringify(AI_PROFILES.regular);
  const p = Logic.aiTuning('regular', { level: 5, difficulty: 'impossible' }); p.react[0] = 99;
  assert.equal(JSON.stringify(AI_PROFILES.regular), before);
});
