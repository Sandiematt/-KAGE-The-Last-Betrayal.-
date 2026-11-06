'use strict';
// Act I, The Missing Brother: four authored stretches through Yomi's outer districts, each ending in a sub-boss
// whose moves are reduced versions of Raikon's, then Raikon. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource } = require('./helpers/load-logic');

const { Logic, ENEMIES, SCENES } = loadLogic();
const SUBS = ['act1.sub1', 'act1.sub2', 'act1.sub3', 'act1.sub4'];
const STRETCHES = ['act1.stretch1', 'act1.stretch2', 'act1.stretch3', 'act1.stretch4'];
const subEnemy = (stageId) => Logic.stageConfig(Logic.defaultSave(), stageId).enemyId;
const win = (stageId, enemyId) => ({ mode: 'campaign', stageId, enemyId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
// BOSS_ABILITIES keys written in 40-ai.js (the ability code); reduced variants are registered from data on top of them
const AI_SRC = moduleSource('40-ai.js');
const CODED = (() => { const s = AI_SRC.indexOf('const BOSS_ABILITIES = {'); const body = AI_SRC.slice(s, AI_SRC.indexOf('\n};', s));
  return [...body.matchAll(/^ {2}([A-Za-z_]+):\s*\{/gm)].map(m => m[1]); })();

/* ---------------- the sub-bosses ---------------- */

test('Act I has four distinct sub-bosses, one at the end of each stretch, each a named fighter with a title', () => {
  const ids = SUBS.map(subEnemy);
  assert.equal(new Set(ids).size, 4);
  for (const [i, sid] of SUBS.entries()) {
    const d = ENEMIES[ids[i]], cfg = Logic.stageConfig(Logic.defaultSave(), sid);
    assert.equal(d.type, 'sub', sid);
    assert.notEqual(ids[i], 'echo_sentinel', `${sid} is no longer the placeholder rig`);
    assert.equal(cfg.foeName, d.name, `${sid} shows its sub-boss's own name`);
    assert.equal(cfg.foeTitle, d.title);
    assert.ok(d.taunt && d.defeatLine, `${sid} has a before and a defeat line`);
    assert.ok(d.lore && d.lore.length > 20, `${sid} has an Act I lore tie`);
  }
  // distinct looks: no two share the same weapon, helmet and armour, and none dresses like Raikon
  const looks = ids.map(id => `${ENEMIES[id].weapon}|${ENEMIES[id].helmet}|${ENEMIES[id].armor}`);
  assert.equal(new Set(looks).size, 4);
  for (const id of ids) for (const k of ['weapon', 'helmet', 'armor']) assert.notEqual(ENEMIES[id][k], ENEMIES.raikon[k], `${id} ${k}`);
  assert.equal(new Set(ids.map(id => ENEMIES[id].weapon)).size, 4, 'each fights with its own weapon kit');
});

test('every Act I sub-boss fights in the single-bar boss format with one or two phases and leaves by the finisher', () => {
  for (const sid of SUBS) {
    const cfg = Logic.stageConfig(Logic.defaultSave(), sid), id = cfg.enemyId;
    assert.equal(cfg.format.name, 'boss', sid);
    assert.equal(cfg.format.roundsToWin, 1);
    assert.equal(cfg.format.timer, 0);
    const n = Logic.bossPhases(id).length;
    assert.ok(n >= 1 && n <= 2, `${id} has ${n} phases`);
    assert.equal(cfg.format.phases, n, 'the bar shows as many phases as the sub-boss has');
    assert.equal(cfg.format.defeat, 'finisher');
  }
});

test('each Act I sub-boss uses at least one reduced Raikon move, and none has the full Thunder Swing wave', () => {
  for (const sid of SUBS) {
    const id = subEnemy(sid), moves = Logic.bossAbilities(id);
    assert.ok(moves.length >= 1, id);
    const raikon = moves.map(a => Logic.raikonMove(a)).filter(Boolean);
    assert.ok(raikon.some(m => m.reduced), `${id} borrows a reduced Raikon move`);
    assert.ok(!moves.includes('thunderSwing'), `${id} never swings the full Thunder Swing`);
    for (const m of raikon) {
      assert.ok(['thunderSwing', 'stormBreak', 'redlineCounter'].includes(m.base), `${m.id} derives from ${m.base}`);
      assert.equal(m.wave, false, `${m.id} sends no Thunder Swing wave`);
    }
  }
});

test('Raikon keeps his own full moves: the Thunder Swing wave is his alone in Act I', () => {
  const ts = Logic.raikonMove('thunderSwing');
  assert.equal(ts.base, 'thunderSwing'); assert.equal(ts.reduced, false); assert.equal(ts.wave, true);
  assert.equal(Logic.raikonMove('lunge'), null, 'abilities outside Raikon\'s kit are not Raikon moves');
  assert.ok(Logic.bossAbilities('raikon').includes('thunderSwing'));
});

test('every ability an Act I fighter names exists, and every reduced move is built on ability code that exists', () => {
  for (const id of [...SUBS.map(subEnemy), 'raikon']) for (const a of Logic.bossAbilities(id)) {
    const m = Logic.raikonMove(a);
    assert.ok(CODED.includes(a) || (m && m.reduced), `${id} ability ${a}`);
    if (m) assert.ok(CODED.includes(m.base), `${a} base ${m.base} is coded in 40-ai.js`);
  }
});

/* ---------------- trophies ---------------- */

test('each Act I sub-boss drops one trophy helmet or armour, in the trophy tier, with a lore line', () => {
  const seen = new Set();
  for (const sid of SUBS) {
    const r = Logic.stage(sid).reward;
    const items = ['weapons', 'helmets', 'armors'].flatMap(k => ((r || {})[k] || []).map(id => [k, id]));
    assert.equal(items.length, 1, `${sid} rewards exactly one item`);
    const [kind, id] = items[0], it = Logic.gearTable(kind)[id];
    assert.ok(['helmets', 'armors'].includes(kind), `${sid} drops a helmet or armour`);
    assert.equal(it.tier, 'trophy');
    assert.equal(it.exclusive, true);
    assert.ok(it.lore && it.lore.length > 20, `${id} lore`);
    assert.ok(!seen.has(id)); seen.add(id);
  }
});

test('beating an Act I sub-boss grants its trophy once: the first win gives it, a replay gives nothing more', () => {
  const { Logic: L } = loadLogic();
  const s = L.defaultSave();
  clearUpTo(L, s, 'act1.sub1');
  const id = subEnemy('act1.sub1'), [kind] = ['helmets', 'armors'].filter(k => (L.stage('act1.sub1').reward[k] || []).length);
  const trophy = L.stage('act1.sub1').reward[kind][0];
  assert.equal(L.isLocked(s, kind, trophy), true);
  const first = L.applyFightResult(s, win('act1.sub1', id));
  const gear = (out) => out.unlocks.filter(u => ['weapons', 'helmets', 'armors'].includes(u.kind)).map(u => ({ ...u }));
  assert.deepEqual(gear(first), [{ kind, id: trophy }]);
  assert.equal(s.owned[kind][trophy], 1);
  assert.equal(L.isLocked(s, kind, trophy), false);
  const again = L.applyFightResult(s, win('act1.sub1', id));
  assert.deepEqual(gear(again), []);
  assert.equal(s.owned[kind][trophy], 1, 'still one copy, still level 1');
});

/* ---------------- unlock order ---------------- */

test('Act I unlocks in order: stretch1, sub1, stretch2 ... sub4, then the Raikon arena', () => {
  const s = Logic.defaultSave();
  Logic.completeStage(s, 'prologue.1');
  const order = ['act1.stretch1', 'act1.sub1', 'act1.stretch2', 'act1.sub2', 'act1.stretch3', 'act1.sub3', 'act1.stretch4', 'act1.sub4', 'act1.boss'];
  for (let i = 0; i < order.length; i++) {
    assert.equal(Logic.isStageUnlocked(s, order[i]), true, `${order[i]} is open`);
    if (order[i + 1]) assert.equal(Logic.isStageUnlocked(s, order[i + 1]), false, `${order[i + 1]} waits for ${order[i]}`);
    Logic.completeStage(s, order[i]);
  }
});

test('clearing the fourth sub-boss opens the Raikon arena', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'act1.sub4');
  assert.equal(Logic.isStageUnlocked(s, 'act1.boss'), false);
  const out = Logic.applyFightResult(s, win('act1.sub4', subEnemy('act1.sub4')));
  assert.equal(out.next, 'act1.boss');
  assert.equal(Logic.isStageUnlocked(s, 'act1.boss'), true);
});

/* ---------------- stretches, story beats and clues ---------------- */

test('the four Act I stretches are authored levels: escalating encounters of mostly Order soldiers with some Hollows', () => {
  let prevFoes = 0, order = 0, hollow = 0;
  for (const sid of STRETCHES) {
    const s = Logic.stretch(sid);
    assert.ok(s.encounters.length >= 2, sid);
    const foes = s.encounters.flatMap(e => e.waves.flat());
    assert.ok(foes.length > prevFoes, `${sid} sends more foes than the stretch before`);
    prevFoes = foes.length;
    for (const id of foes) { assert.ok(ENEMIES[id], id); if (ENEMIES[id].family === 'order') order++; else hollow++; }
    for (const e of s.encounters) assert.ok(e.x > 0 && e.gate > e.x && e.gate < s.length, sid);
    assert.ok(Logic.stageConfig(Logic.defaultSave(), sid).env, sid);
  }
  assert.ok(order > hollow * 2, `mostly Order (${order}) over Hollows (${hollow})`);
  assert.ok(hollow > 0, 'with some Hollows');
});

test('Act I holds the three clues, each with a scene: the torn report, the two sword marks and Takashi\'s recording', () => {
  const clues = STRETCHES.flatMap(sid => Logic.stretch(sid).clues.map(c => ({ sid, ...c })));
  assert.equal(clues.length, 3);
  const scenes = clues.map(c => Logic.clueScene(c.sid, c.id));
  for (const sc of scenes) assert.ok(Logic.scene(sc), `clue scene ${sc}`);
  const text = (id) => SCENES[id].steps.map(s => s.text || s.caption || '').join(' ').toLowerCase();
  assert.match(text(scenes[0]), /report/);
  assert.match(text(scenes[1]), /two/);
  assert.match(text(scenes[1]), /mark/);
  assert.match(text(scenes[2]), /evacuat/);
  const speakers = SCENES[scenes[2]].steps.map(s => s.say);
  assert.ok(speakers.includes('recording') || speakers.includes('takashi'), 'Takashi is heard on the recording');
});

test('survivors\' story beats: Rem was declared dead ten years ago, and the official story says he betrayed Kage', () => {
  const ids = STRETCHES.flatMap(sid => ['before', 'after'].map(h => Logic.stageScene(sid, h))).filter(Boolean);
  const all = ids.map(id => SCENES[id].steps.map(s => s.text || s.caption || '').join(' ')).join(' ').toLowerCase();
  assert.match(all, /dead/);
  assert.match(all, /ten years/);
  assert.match(all, /betray/);
  assert.match(all, /memor/);
});
