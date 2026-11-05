'use strict';
// Shinsen ("True Flash"), Takashi's abandoned odachi, granted when Akari falls (act2.boss), and its rage art Final Flow.
// Driven through Logic's public functions and the pure data tables.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, WEAPONS, MOVES } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId) => ({ mode: 'campaign', stageId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });

test('clearing Akari\'s stage grants Shinsen exactly once', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act2.boss');
  assert.equal(Logic.isLocked(s, 'weapons', 'shinsen'), true, 'locked before Akari falls');
  const out = Logic.applyFightResult(s, win('act2.boss'));
  assert.ok(out.unlocks.some(u => u.kind === 'weapons' && u.id === 'shinsen'), 'the win unlocks Shinsen');
  assert.equal(s.owned.weapons.shinsen, 1);
  assert.equal(Logic.isLocked(s, 'weapons', 'shinsen'), false);
  assert.equal(Logic.equipItem(s, 'weapons', 'shinsen'), true, 'it can be equipped');
  const again = Logic.applyFightResult(s, win('act2.boss'));
  assert.ok(!again.unlocks.some(u => u.id === 'shinsen'), 'a replay grants nothing');
  assert.equal(s.owned.weapons.shinsen, 1);
  assert.equal(Logic.lockHint('weapons', 'shinsen'), 'Defeat Akari');
});

test('no other stage grants Shinsen: Akari\'s stage is its one source', () => {
  const sources = Logic.stages().filter(st => st.reward && (st.reward.weapons || []).includes('shinsen')).map(st => st.id);
  assert.deepEqual(sources, ['act2.boss']);
});

test('Shinsen is boss tier: at least 1.5x the best fully upgraded shop weapon', () => {
  const shop = Object.keys(WEAPONS).filter(id => ['common', 'rare', 'epic'].includes(WEAPONS[id].tier));
  const best = Math.max(...shop.map(id => Logic.weaponTotal(id, Logic.maxLevel('weapons', id))));
  assert.equal(WEAPONS.shinsen.tier, 'boss');
  assert.equal(Logic.maxLevel('weapons', 'shinsen'), 1);
  assert.ok(Logic.weaponTotal('shinsen', 1) >= 1.5 * best, `Shinsen ${Logic.weaponTotal('shinsen', 1)} vs best shop ${best}`);
});

test('Shinsen\'s rage art is Final Flow', () => {
  assert.equal(WEAPONS.shinsen.special, 'finalFlow');
  assert.equal(Logic.finalFlow().name, 'Final Flow');
});

test('Final Flow is several cuts in different directions, ending in one decisive horizontal cut', () => {
  const ff = Logic.finalFlow(), cuts = ff.cuts;
  assert.ok(cuts.length >= 4, `${cuts.length} cuts`);
  const dirs = cuts.slice(0, -1).map(c => c.dir);
  for (const d of ['rising', 'overhead', 'diagonal']) assert.ok(dirs.includes(d), `has a ${d} cut before the finisher`);
  const last = cuts[cuts.length - 1];
  assert.equal(last.dir, 'horizontal');
  assert.equal(last.finisher, true);
  assert.equal(cuts.filter(c => c.finisher).length, 1, 'exactly one finisher');
  assert.ok(!dirs.includes('horizontal'), 'the only horizontal cut is the finisher');
  for (let i = 1; i < cuts.length; i++) assert.ok(cuts[i].at > cuts[i - 1].at, 'cuts land in order');
  assert.ok(last.dmg > Math.max(...cuts.slice(0, -1).map(c => c.dmg)), 'the finisher hits hardest');
  assert.ok(last.freeze > 0, 'the finisher holds a short freeze');
  assert.equal(ff.el, 'gold', 'gold trails');
});

test('a boss can run Final Flow with its own tuning without changing the player\'s', () => {
  const boss = Logic.finalFlow({ windup: 0.7, dmg: 0.6 });
  assert.equal(boss.windup, 0.7);
  assert.equal(boss.dmg, 0.6);
  assert.deepEqual(boss.cuts.map(c => c.dir), Logic.finalFlow().cuts.map(c => c.dir), 'the same sequence');
  boss.cuts[0].dmg = 999;
  assert.notEqual(Logic.finalFlow().cuts[0].dmg, 999, 'a copy, never the shared table');
});

test('every Final Flow cut swings a real move pose', () => {
  for (const c of Logic.finalFlow().cuts) assert.ok(MOVES[c.pose], c.pose);
});

test('Shinsen has its own move set: slower, heavier and harder-hitting than Kagetsu', () => {
  const sh = Logic.weaponMoves('shinsen', 1), kg = Logic.weaponMoves('kagetsu', Logic.maxLevel('weapons', 'kagetsu'));
  assert.equal(sh.length, kg.length, 'a three-cut string');
  assert.ok(sh.every(m => !WEAPONS.kagetsu.moves.includes(m.id)), 'none of the Kagetsu moves');
  sh.forEach((m, i) => {
    const k = kg[i];
    assert.ok(m.startup > k.startup, `${m.id} starts slower than ${k.id} (${m.startup.toFixed(3)} vs ${k.startup.toFixed(3)})`);
    assert.ok(m.recovery > k.recovery, `${m.id} recovers slower than ${k.id}`);
    assert.ok(m.dmg > k.dmg, `${m.id} hits harder than a fully upgraded ${k.id}`);
    assert.ok(m.reach > k.reach, `${m.id} cuts a broader arc than ${k.id}`);
  });
  assert.ok(WEAPONS.shinsen.heft > WEAPONS.kagetsu.heft);
});

test('Shinsen runs the father-style family form variations: a heavy rising cut and a broad horizontal flow', () => {
  const fam = WEAPONS.shinsen.family;
  assert.ok(fam && MOVES[fam.rise] && MOVES[fam.flow] && MOVES[fam.aerial]);
  assert.ok(MOVES[fam.rise].up < 0, 'the rising cut lifts');
  const flow = MOVES[fam.flow];
  assert.ok(flow.box[2] > flow.box[3] * 2, 'the flow is a wide flat (horizontal) arc');
  assert.ok(flow.kd, 'the flow knocks down');
});
