'use strict';
// Act III, the Fortress of Silence: four authored stretches through the Order's seat (the hardest regular encounters
// in the game: the Order's elite, with Hollows rising wherever the Echo System's conduits run), each ending in a
// sub-boss whose moves are reduced versions of Takashi's, then Takashi. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource } = require('./helpers/load-logic');

const { Logic, ENEMIES, SCENES } = loadLogic();
const SUBS = ['act3.sub1', 'act3.sub2', 'act3.sub3', 'act3.sub4'];
const STRETCHES = ['act3.stretch1', 'act3.stretch2', 'act3.stretch3', 'act3.stretch4'];
const TAKASHI = ['earthCleave', 'groundSmash', 'guardReturn'];
const subEnemy = (stageId) => Logic.stageConfig(Logic.defaultSave(), stageId).enemyId;
const win = (stageId, enemyId) => ({ mode: 'campaign', stageId, enemyId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const AI_SRC = moduleSource('40-ai.js');
const CODED = (() => { const s = AI_SRC.indexOf('const BOSS_ABILITIES = {'); const body = AI_SRC.slice(s, AI_SRC.indexOf('\n};', s));
  // Takashi's redesigned fight registers his own moves into the same table (66-takashi.js)
  const tk = moduleSource('66-takashi.js'), t0 = tk.indexOf('Object.assign(BOSS_ABILITIES, {'), more = tk.slice(t0, tk.indexOf('\n});', t0));
  return [...body.matchAll(/^ {2}([A-Za-z_]+):\s*\{/gm), ...more.matchAll(/^ {2}([A-Za-z_]+):\s*\{/gm)].map(m => m[1]); })();

/* ---------------- the sub-bosses ---------------- */

test('Act III has four distinct sub-bosses, one at the end of each stretch, each a named fighter with a title and lore', () => {
  const ids = SUBS.map(subEnemy);
  assert.equal(new Set(ids).size, 4);
  for (const [i, sid] of SUBS.entries()) {
    const d = ENEMIES[ids[i]], cfg = Logic.stageConfig(Logic.defaultSave(), sid);
    assert.equal(d.type, 'sub', sid);
    assert.notEqual(ids[i], 'echo_sentinel', `${sid} is no longer the placeholder rig`);
    assert.equal(cfg.foeName, d.name);
    assert.equal(cfg.foeTitle, d.title);
    assert.ok(d.taunt && d.defeatLine, `${sid} has a before and a defeat line`);
    assert.ok(d.lore && d.lore.length > 20, `${sid} has an Act III lore tie`);
  }
  const looks = ids.map(id => `${ENEMIES[id].weapon}|${ENEMIES[id].helmet}|${ENEMIES[id].armor}`);
  assert.equal(new Set(looks).size, 4);
  assert.equal(new Set(ids.map(id => ENEMIES[id].weapon)).size, 4, 'each fights with its own weapon');
  for (const id of ids) for (const k of ['weapon', 'helmet', 'armor']) assert.notEqual(ENEMIES[id][k], ENEMIES.takashi[k], `${id} ${k} is not Takashi's`);
});

test('every Act III sub-boss fights in the single-bar boss format with one or two phases and leaves by the finisher', () => {
  for (const sid of SUBS) {
    const cfg = Logic.stageConfig(Logic.defaultSave(), sid), id = cfg.enemyId;
    assert.equal(cfg.format.name, 'boss', sid);
    assert.equal(cfg.format.roundsToWin, 1);
    assert.equal(cfg.format.timer, 0);
    const n = Logic.bossPhases(id).length;
    assert.ok(n >= 1 && n <= 2, `${id} has ${n} phases`);
    assert.equal(cfg.format.phases, n);
    assert.equal(cfg.format.defeat, 'finisher');
  }
});

test('each Act III sub-boss uses at least one reduced Takashi move, and none has Final Flow', () => {
  const bases = new Set();
  for (const sid of SUBS) {
    const id = subEnemy(sid), moves = Logic.bossAbilities(id);
    const derived = moves.map(a => Logic.takashiDerived(a)).filter(Boolean);
    assert.ok(derived.some(m => m.reduced), `${id} borrows a reduced Takashi move`);
    for (const m of derived) {
      assert.ok(TAKASHI.includes(m.base), `${m.id} derives from ${m.base}`);
      assert.equal(m.reduced, true, `${id} only ever uses reduced versions, never Takashi's own ${m.id}`);
      bases.add(m.base);
    }
    assert.ok(!moves.includes('finalFlow'), `${id} never uses Final Flow`);
    assert.ok(!derived.some(m => m.base === 'finalFlow'), `${id} has nothing built on Final Flow`);
  }
  assert.deepEqual([...bases].sort(), TAKASHI.slice().sort(), 'between them they teach Earth Cleave, Ground Smash and Guard Return');
});

test('a reduced Takashi move telegraphs longer than his, never hits harder, and its counter never breaks a guard', () => {
  const ids = [...new Set(SUBS.map(subEnemy).flatMap(id => Logic.bossAbilities(id)))].filter(a => Logic.takashiDerived(a));
  assert.ok(ids.length >= 4);
  for (const a of ids) {
    const m = Logic.takashiDerived(a), base = Logic.takashiMove(m.base);
    assert.ok(m.windup > base.windup, `${a} winds up ${m.windup} vs ${base.windup}`);
    assert.ok(m.dmg < base.dmg, `${a} hits for ${m.dmg} vs ${base.dmg}`);
    assert.ok(m.label && m.label !== base.label, `${a} has its own call-out`);
    if (m.base === 'earthCleave') assert.ok(m.dash <= base.dash && m.reach <= base.reach, `${a} steps in no further`);
    if (m.base === 'groundSmash') assert.ok(m.shock < base.shock && m.shockLife <= base.shockLife, `${a} has a smaller shockwave`);
    if (m.base === 'guardReturn') { assert.equal(m.unb, 0, `${a}'s rising cut can be blocked`); assert.ok(m.stance <= base.stance); }
  }
});

test('Takashi keeps his own moves: Logic.takashiDerived names them unreduced and ignores other abilities', () => {
  const own = Logic.takashiDerived('earthCleave');
  assert.deepEqual([own.base, own.reduced], ['earthCleave', false]);
  assert.equal(own.dmg, 18);
  assert.equal(Logic.takashiDerived('halfFang'), null, 'a reduced Akari move is not a Takashi move');
  assert.equal(Logic.takashiDerived('lunge'), null);
  assert.ok(Logic.bossAbilities('takashi').includes('finalFlow'));
});

test('every ability an Act III fighter names exists, and every reduced move is built on Takashi ability code that exists', () => {
  for (const id of [...SUBS.map(subEnemy), 'takashi']) for (const a of Logic.bossAbilities(id)) {
    const m = Logic.takashiDerived(a);
    assert.ok(CODED.includes(a) || (m && m.reduced), `${id} ability ${a}`);
    if (m) assert.ok(CODED.includes(m.base), `${a} base ${m.base} is coded in 40-ai.js`);
  }
});

/* ---------------- trophies ---------------- */

test('each Act III sub-boss drops one trophy helmet or armour, in the trophy tier, with a lore line', () => {
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

test('beating an Act III sub-boss grants its trophy once: the first win gives it, a replay gives nothing more', () => {
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

test('Act III unlocks in order: stretch1, sub1, stretch2 ... sub4, then the Takashi arena', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'act3.stretch1');
  const order = ['act3.stretch1', 'act3.sub1', 'act3.stretch2', 'act3.sub2', 'act3.stretch3', 'act3.sub3', 'act3.stretch4', 'act3.sub4', 'act3.boss'];
  for (let i = 0; i < order.length; i++) {
    assert.equal(Logic.isStageUnlocked(s, order[i]), true, `${order[i]} is open`);
    if (order[i + 1]) assert.equal(Logic.isStageUnlocked(s, order[i + 1]), false, `${order[i + 1]} waits for ${order[i]}`);
    Logic.completeStage(s, order[i]);
  }
});

test('clearing the fourth sub-boss opens the Takashi arena', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'act3.sub4');
  assert.equal(Logic.isStageUnlocked(s, 'act3.boss'), false);
  const out = Logic.applyFightResult(s, win('act3.sub4', subEnemy('act3.sub4')));
  assert.equal(out.next, 'act3.boss');
  assert.equal(Logic.isStageUnlocked(s, 'act3.boss'), true);
  assert.equal(Logic.stageConfig(s, 'act3.boss').enemyId, 'takashi');
});

/* ---------------- stretches ---------------- */

test('the four Act III stretches are authored Fortress levels: mostly the Order\'s elite, with Hollows rising stretch by stretch', () => {
  let prev = 0, prevHollow = -1, hollow = 0, order = 0;
  const units = new Set();
  for (const sid of STRETCHES) {
    const s = Logic.stretch(sid), cfg = Logic.stageConfig(Logic.defaultSave(), sid);
    assert.ok(s.encounters.length >= 3, sid);
    const foes = s.encounters.flatMap(e => e.waves.flat());
    assert.ok(foes.length > prev, `${sid} sends more foes than the stretch before (${foes.length})`);
    prev = foes.length;
    const h = foes.filter(id => ENEMIES[id].family === 'hollow').length;
    assert.ok(h > prevHollow, `${sid}: more Hollows where the conduits run (${h})`);
    prevHollow = h; hollow += h; order += foes.length - h;
    for (const id of foes) { assert.ok(ENEMIES[id], id); if (ENEMIES[id].family === 'order') units.add(id); }
    for (const e of s.encounters) assert.ok(e.x > 0 && e.gate > e.x && e.gate < s.length, sid);
    assert.equal(cfg.env, 'fortress', `${sid} is drawn in the Fortress of Silence`);
    assert.notEqual(cfg.foeName.slice(0, 7), 'Stretch', `${sid} has its own name`);
  }
  assert.ok(order > hollow, `mostly Order soldiers (${order}) over Hollows (${hollow})`);
  for (const u of ['order_shieldbearer', 'order_ironclad', 'order_chainthrower']) assert.ok(units.has(u), `the Fortress fields ${u}`);
  for (const sid of SUBS) assert.equal(Logic.stageConfig(Logic.defaultSave(), sid).env, 'fortress', sid);
});

test('Act III holds the hardest regular encounters in the game: its last stretch outnumbers every other stretch', () => {
  const count = (sid) => Logic.stretch(sid).encounters.flatMap(e => e.waves.flat()).length;
  const last = count('act3.stretch4');
  for (const st of Logic.stages()) if (st.kind === 'stretch' && st.chapter !== 'act3') assert.ok(count(st.id) < last, `${st.id} (${count(st.id)}) vs ${last}`);
});

test('the Fortress is dressed with Order banners and violet memory conduits', () => {
  for (const sid of STRETCHES) {
    const types = Logic.streetProps(Logic.stretch(sid)).map(p => p.type);
    assert.ok(types.includes('banner'), `${sid} has Order banners`);
    assert.ok(types.includes('conduit'), `${sid} has memory conduits`);
  }
});

test('dialogue beats build toward Takashi being alive, without giving away who waits in the Core', () => {
  const ids = STRETCHES.map(sid => Logic.stageScene(sid, 'before'));
  for (const id of ids) assert.ok(SCENES[id], id);
  const text = (id) => SCENES[id].steps.map(s => s.text || s.caption || '').join(' ');
  const all = ids.map(text).join(' ');
  assert.match(all, /Takashi/, 'the Order\'s records name him');
  assert.ok(ids.some(id => SCENES[id].steps.some(s => s.say === 'order')), 'a guard speaks');
  assert.ok(ids.some(id => SCENES[id].steps.some(s => s.say === 'recording' && /conduit/i.test(s.name || ''))), 'a conduit speaks in his voice');
  assert.match(text(ids[3]), /alive/i, 'the last stretch says it');
  assert.doesNotMatch(all.toLowerCase(), /\brem\b.*\bcore\b|\bcore\b.*\brem\b|sealed|ten years bound/, 'Rem in the Core stays Takashi\'s reveal');
});

test('the Fortress holds one clue, with its scene', () => {
  const clues = STRETCHES.flatMap(sid => Logic.stretch(sid).clues.map(c => ({ sid, ...c })));
  assert.equal(clues.length, 1);
  assert.ok(Logic.scene(Logic.clueScene(clues[0].sid, clues[0].id)));
});
