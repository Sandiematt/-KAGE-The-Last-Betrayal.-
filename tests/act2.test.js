'use strict';
// Act II, the City of Echoes: four authored stretches through a district rebuilt from stored memories (its streets
// repeat and its signs change while nobody is looking), each ending in a sub-boss whose moves are reduced versions of
// Akari's, then Akari. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource } = require('./helpers/load-logic');

const { Logic, ENEMIES, SCENES } = loadLogic();
const SUBS = ['act2.sub1', 'act2.sub2', 'act2.sub3', 'act2.sub4'];
const STRETCHES = ['act2.stretch1', 'act2.stretch2', 'act2.stretch3', 'act2.stretch4'];
const subEnemy = (stageId) => Logic.stageConfig(Logic.defaultSave(), stageId).enemyId;
const win = (stageId, enemyId) => ({ mode: 'campaign', stageId, enemyId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const AI_SRC = moduleSource('40-ai.js');
const CODED = (() => { const s = AI_SRC.indexOf('const BOSS_ABILITIES = {'); const body = AI_SRC.slice(s, AI_SRC.indexOf('\n};', s));
  return [...body.matchAll(/^ {2}([A-Za-z_]+):\s*\{/gm)].map(m => m[1]); })();

/* ---------------- the sub-bosses ---------------- */

test('Act II has four distinct sub-bosses, one at the end of each stretch, each a named fighter with a title and lore', () => {
  const ids = SUBS.map(subEnemy);
  assert.equal(new Set(ids).size, 4);
  for (const [i, sid] of SUBS.entries()) {
    const d = ENEMIES[ids[i]], cfg = Logic.stageConfig(Logic.defaultSave(), sid);
    assert.equal(d.type, 'sub', sid);
    assert.notEqual(ids[i], 'echo_sentinel', `${sid} is no longer the placeholder rig`);
    assert.equal(cfg.foeName, d.name);
    assert.equal(cfg.foeTitle, d.title);
    assert.ok(d.taunt && d.defeatLine, `${sid} has a before and a defeat line`);
    assert.ok(d.lore && d.lore.length > 20, `${sid} has an Act II lore tie`);
  }
  const looks = ids.map(id => `${ENEMIES[id].weapon}|${ENEMIES[id].helmet}|${ENEMIES[id].armor}`);
  assert.equal(new Set(looks).size, 4);
  assert.equal(new Set(ids.map(id => ENEMIES[id].weapon)).size, 4, 'each fights with its own weapon');
  for (const id of ids) for (const k of ['weapon', 'helmet', 'armor']) assert.notEqual(ENEMIES[id][k], ENEMIES.akari[k], `${id} ${k} is not Akari's`);
});

test('every Act II sub-boss fights in the single-bar boss format with one or two phases and leaves by the finisher', () => {
  for (const sid of SUBS) {
    const cfg = Logic.stageConfig(Logic.defaultSave(), sid), id = cfg.enemyId;
    assert.equal(cfg.format.name, 'boss', sid);
    assert.equal(cfg.format.roundsToWin, 1);
    assert.equal(cfg.format.timer, 0);
    const n = Logic.bossPhases(id).length;
    assert.ok(n >= 1 && n <= 2, `${id} has ${n} phases`);
    assert.equal(cfg.format.phases, n);
    assert.equal(cfg.format.defeat, 'finisher');
    for (const p of Logic.bossPhases(id)) assert.ok(!p.chainBlink, `${id} never chains Akari's double blink`);
  }
});

test('each Act II sub-boss uses at least one reduced Akari move, and none has False Opening or Petal Cross', () => {
  for (const sid of SUBS) {
    const id = subEnemy(sid), moves = Logic.bossAbilities(id);
    const akari = moves.map(a => Logic.akariDerived(a)).filter(Boolean);
    assert.ok(akari.some(m => m.reduced), `${id} borrows a reduced Akari move`);
    for (const m of akari) {
      assert.ok(['twinFang', 'smokeStep', 'blink'].includes(m.base), `${m.id} derives from ${m.base}`);
      assert.equal(m.reduced, true, `${id} only ever uses reduced versions, never Akari's own ${m.id}`);
    }
    for (const banned of ['falseOpening', 'petalCross']) {
      assert.ok(!moves.includes(banned), `${id} never uses ${banned}`);
      assert.ok(!akari.some(m => m.base === banned), `${id} has nothing built on ${banned}`);
    }
  }
});

test('a reduced Akari move telegraphs at least as long as hers and never hits harder', () => {
  const ids = [...new Set(SUBS.map(subEnemy).flatMap(id => Logic.bossAbilities(id)))].filter(a => Logic.akariDerived(a));
  assert.ok(ids.length >= 4);
  for (const a of ids) {
    const m = Logic.akariDerived(a), base = Logic.akariMove(m.base);
    assert.ok(m.windup >= base.windup, `${a} winds up ${m.windup} vs ${base.windup}`);
    assert.ok(m.label && m.label !== base.label, `${a} has its own call-out`);
    if (m.base === 'twinFang') { assert.equal(m.dmg.length, 2); assert.ok(m.dmg[0] <= base.dmg[0] && m.dmg[1] <= base.dmg[1], a); }
    else if (m.dmg != null) assert.ok(m.dmg <= base.dmg, a);
    if (m.dist != null) assert.ok(m.dist <= base.dist, `${a} repositions no further than Akari`);
    if (m.smoke) assert.ok(m.smoke.life <= base.smoke.life && m.smoke.radius <= base.smoke.radius, `${a} smoke stays compact`);
  }
});

test('Akari keeps her own moves: Logic.akariDerived names them unreduced and ignores other abilities', () => {
  assert.deepEqual(Logic.akariDerived('twinFang') && [Logic.akariDerived('twinFang').base, Logic.akariDerived('twinFang').reduced], ['twinFang', false]);
  assert.equal(Logic.akariDerived('censure'), null, 'a reduced Raikon move is not an Akari move');
  assert.equal(Logic.akariDerived('lunge'), null);
  assert.ok(Logic.bossAbilities('akari').includes('petalCross'));
});

test('every ability an Act II fighter names exists, and every reduced move is built on Akari ability code that exists', () => {
  for (const id of [...SUBS.map(subEnemy), 'akari']) for (const a of Logic.bossAbilities(id)) {
    const m = Logic.akariDerived(a);
    assert.ok(CODED.includes(a) || (m && m.reduced), `${id} ability ${a}`);
    if (m) assert.ok(CODED.includes(m.base), `${a} base ${m.base} is coded in 40-ai.js`);
  }
});

/* ---------------- trophies ---------------- */

test('each Act II sub-boss drops one trophy helmet or armour, in the trophy tier, with a lore line', () => {
  const seen = new Set();
  for (const sid of SUBS) {
    const r = Logic.stage(sid).reward;
    const items = ['weapons', 'helmets', 'armors'].flatMap(k => ((r || {})[k] || []).map(id => [k, id]));
    assert.equal(items.length, 1, `${sid} rewards exactly one item`);
    const [kind, id] = items[0], it = Logic.gearTable(kind)[id];
    assert.ok(['helmets', 'armors'].includes(kind));
    assert.equal(it.tier, 'trophy');
    assert.equal(it.exclusive, true);
    assert.ok(it.lore && it.lore.length > 20, `${id} lore`);
    assert.ok(!seen.has(id)); seen.add(id);
    const d = ENEMIES[subEnemy(sid)];
    assert.ok(d[kind === 'helmets' ? 'helmet' : 'armor'] === id, `${d.id} wears the trophy it drops`);
  }
});

test('beating an Act II sub-boss grants its trophy once: the first win gives it, a replay gives nothing more', () => {
  for (const sid of SUBS) {
    const { Logic: L } = loadLogic();
    const s = L.defaultSave();
    clearUpTo(L, s, sid);
    const [kind] = ['helmets', 'armors'].filter(k => (L.stage(sid).reward[k] || []).length), trophy = L.stage(sid).reward[kind][0];
    assert.equal(L.isLocked(s, kind, trophy), true);
    const gear = (out) => out.unlocks.filter(u => ['weapons', 'helmets', 'armors'].includes(u.kind)).map(u => ({ ...u }));
    assert.deepEqual(gear(L.applyFightResult(s, win(sid, subEnemy(sid)))), [{ kind, id: trophy }]);
    assert.equal(s.owned[kind][trophy], 1);
    assert.deepEqual(gear(L.applyFightResult(s, win(sid, subEnemy(sid)))), [], `${sid} replay`);
    assert.equal(s.owned[kind][trophy], 1);
  }
});

/* ---------------- unlock order ---------------- */

test('Act II unlocks in order: stretch1, sub1, stretch2 ... sub4, then the Akari arena', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'act2.stretch1');
  const order = ['act2.stretch1', 'act2.sub1', 'act2.stretch2', 'act2.sub2', 'act2.stretch3', 'act2.sub3', 'act2.stretch4', 'act2.sub4', 'act2.boss'];
  for (let i = 0; i < order.length; i++) {
    assert.equal(Logic.isStageUnlocked(s, order[i]), true, `${order[i]} is open`);
    if (order[i + 1]) assert.equal(Logic.isStageUnlocked(s, order[i + 1]), false, `${order[i + 1]} waits for ${order[i]}`);
    Logic.completeStage(s, order[i]);
  }
});

test('clearing the fourth sub-boss opens the Akari arena', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'act2.sub4');
  assert.equal(Logic.isStageUnlocked(s, 'act2.boss'), false);
  const out = Logic.applyFightResult(s, win('act2.sub4', subEnemy('act2.sub4')));
  assert.equal(out.next, 'act2.boss');
  assert.equal(Logic.isStageUnlocked(s, 'act2.boss'), true);
  assert.equal(Logic.stageConfig(s, 'act2.boss').enemyId, 'akari');
});

/* ---------------- stretches ---------------- */

test('the four Act II stretches are authored levels in the City of Echoes: escalating encounters of mostly Hollows', () => {
  let prev = 0, hollow = 0, other = 0;
  for (const sid of STRETCHES) {
    const s = Logic.stretch(sid), cfg = Logic.stageConfig(Logic.defaultSave(), sid);
    assert.ok(s.encounters.length >= 2, sid);
    const foes = s.encounters.flatMap(e => e.waves.flat());
    assert.ok(foes.length > prev, `${sid} sends more foes than the stretch before (${foes.length})`);
    prev = foes.length;
    for (const id of foes) { assert.ok(ENEMIES[id], id); if (ENEMIES[id].family === 'hollow') hollow++; else other++; }
    for (const e of s.encounters) assert.ok(e.x > 0 && e.gate > e.x && e.gate < s.length, sid);
    assert.equal(cfg.env, 'echoes', `${sid} is drawn in the memory-tinted city`);
    assert.notEqual(cfg.foeName.slice(0, 7), 'Stretch', `${sid} has its own name`);
  }
  assert.ok(hollow > other * 4, `mostly Hollows (${hollow}) over the Order (${other})`);
  for (const sid of SUBS) assert.equal(Logic.stageConfig(Logic.defaultSave(), sid).env, 'echoes', sid);
});

test('the City of Echoes repeats itself: every stretch\'s street block recurs, with a visible seam where it loops', () => {
  for (const sid of STRETCHES) {
    const s = Logic.stretch(sid), props = Logic.streetProps(s);
    assert.ok(s.loop && s.loop.count >= 2, `${sid} has a repeating street`);
    const { from, period, count, block } = s.loop;
    for (const item of block) {
      const xs = props.filter(p => p.type === item.type && p.copy != null && (p.x - from - item.dx) % period === 0).map(p => p.x);
      assert.deepEqual(xs, Array.from({ length: count }, (_, i) => from + i * period + item.dx), `${sid} ${item.type} recurs`);
    }
    const seams = props.filter(p => p.type === 'seam').map(p => p.x);
    assert.deepEqual(seams, Array.from({ length: count - 1 }, (_, i) => from + (i + 1) * period), `${sid} seams`);
    assert.ok(props.every(p => p.x > 0 && p.x < s.length), `${sid} street stays inside the level`);
    assert.ok(block.some(b => b.type === 'sign' && b.texts.length >= 3), `${sid} has a changing sign`);
    assert.ok(period >= 1600, `${sid}: one copy of a sign is on screen at a time`);
  }
});

test('streetProps expands a loop into copies and seams, keeps the hand-placed props, and sorts by x', () => {
  const L = { length: 4000, props: [{ type: 'shrine', x: 2000 }], loop: { from: 100, period: 1000, count: 3, block: [{ type: 'echo_house', dx: 0 }, { type: 'sign', dx: 400, id: 'tea', texts: ['A', 'B', 'C'] }] } };
  assert.deepEqual(Logic.streetProps(L).map(p => `${p.type}@${p.x}`),
    ['echo_house@100', 'sign@500', 'seam@1100', 'echo_house@1100', 'sign@1500', 'shrine@2000', 'seam@2100', 'echo_house@2100', 'sign@2500']);
  assert.deepEqual(Logic.streetProps({ length: 900, props: [{ type: 'house', x: 300 }] }).map(p => p.x), [300]);
  assert.deepEqual(Logic.streetProps(L).filter(p => p.type === 'sign').map(p => p.id), ['tea', 'tea', 'tea'], 'every copy is the same sign');
});

test('a sign only changes while it is off screen: it reads differently each time it comes back into view', () => {
  const sign = { id: 'tea', texts: ['TEA HOUSE', 'TEA HOUSE · CLOSED', 'NO TEA HOUSE'] };
  let st = Logic.signStep(null, false);
  assert.equal(Logic.signText(sign, st), 'TEA HOUSE', 'unseen, it reads its first text');
  st = Logic.signStep(st, true); assert.equal(Logic.signText(sign, st), 'TEA HOUSE');
  st = Logic.signStep(st, true); assert.equal(Logic.signText(sign, st), 'TEA HOUSE', 'never changes while watched');
  st = Logic.signStep(st, false); assert.equal(Logic.signText(sign, st), 'TEA HOUSE', 'leaving view changes nothing yet');
  st = Logic.signStep(st, true); assert.equal(Logic.signText(sign, st), 'TEA HOUSE · CLOSED', 'back in view: it changed while away');
  st = Logic.signStep(st, false); st = Logic.signStep(st, true); assert.equal(Logic.signText(sign, st), 'NO TEA HOUSE');
  st = Logic.signStep(st, false); st = Logic.signStep(st, true); assert.equal(Logic.signText(sign, st), 'TEA HOUSE', 'and around again');
});

test('dialogue beats: residents remember different versions of the same night, without giving Akari\'s secret away', () => {
  const ids = STRETCHES.map(sid => Logic.stageScene(sid, 'before'));
  for (const id of ids) assert.ok(SCENES[id], id);
  for (const id of ids) {
    const speakers = SCENES[id].steps.filter(s => s.say === 'resident').map(s => s.name);
    assert.ok(new Set(speakers).size >= 2, `${id}: two residents tell it`);
  }
  const all = STRETCHES.flatMap(sid => ['before', 'after'].map(h => Logic.stageScene(sid, h))).filter(Boolean)
    .map(id => SCENES[id].steps.map(s => s.text || s.caption || '').join(' ')).join(' ').toLowerCase();
  assert.match(all, /no[,.]? /, 'someone contradicts someone');
  assert.match(all, /remember/);
  assert.doesNotMatch(all, /erasure|requested|controller/, 'Akari\'s reveal stays hers');
});

test('the City of Echoes holds one clue, with its scene', () => {
  const clues = STRETCHES.flatMap(sid => Logic.stretch(sid).clues.map(c => ({ sid, ...c })));
  assert.equal(clues.length, 1);
  assert.ok(Logic.scene(Logic.clueScene(clues[0].sid, clues[0].id)));
});
