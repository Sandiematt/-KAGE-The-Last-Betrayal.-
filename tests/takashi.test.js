'use strict';
// Takashi, the Master's Flow: the Act III boss (act3.boss). Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES, ENEMIES, WEAPONS, MOVES } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId, ng) => ({ mode: 'campaign', stageId, win: true, ng: ng || 0, hpLeft: 0.5, time: 90, maxCombo: 4, parries: 0, flawless: false });
const FOUR = ['earthCleave', 'groundSmash', 'guardReturn', 'finalFlow'];

test('Takashi is the foe of the Act III boss stage, fought in the boss format', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'act3.boss');
  assert.equal(cfg.enemyId, 'takashi');
  assert.equal(cfg.foeName, 'Takashi');
  assert.equal(cfg.format.name, 'boss');
  assert.equal(cfg.format.phases, 3);
});

test('Takashi fights in three phases with all four moves, Final Flow only in phase 3', () => {
  const phases = Logic.bossPhases('takashi');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.at), [1, 0.66, 0.33]);
  assert.deepEqual(Logic.bossAbilities('takashi').slice().sort(), FOUR.slice().sort());
  const [p1, p2, p3] = phases;
  assert.ok(p1.abilities.includes('earthCleave') && p1.abilities.includes('guardReturn'), 'he reads spam from the first phase');
  assert.ok(p2.abilities.includes('groundSmash'));
  assert.ok(!p1.abilities.includes('finalFlow') && !p2.abilities.includes('finalFlow'));
  for (const a of FOUR) assert.ok(p3.abilities.includes(a), `phase 3 ${a}`);
});

test('every Takashi move has a call-out and a readable tell', () => {
  for (const id of ['earthCleave', 'groundSmash', 'guardReturn']) {
    const m = Logic.takashiMove(id);
    assert.ok(m, id);
    assert.ok(m.label && m.label.length > 0, `${id} label`);
    assert.ok(m.windup >= 0.1, `${id} has a tell`);
  }
  assert.ok(Logic.takashiMove('earthCleave').windup >= 0.5, 'the heavy cleave winds up for a readable moment');
  assert.equal(Logic.takashiMove('twinFang'), null);
});

test('his Final Flow, tuned for a boss, lands far harder than the old 0.8 placeholder', () => {
  const tune = Logic.takashiMove('finalFlow');
  const ff = Logic.finalFlow({ dmg: tune.dmg });
  const total = ff.cuts.reduce((n, c) => n + c.dmg, 0) * ff.dmg;
  assert.ok(total >= 35, `whole sequence ${total} base damage (was 20)`);
  assert.equal(tune.unbFinisher, 1, 'only the finisher is unblockable');
  assert.equal(tune.unb, 0);
});

test('Guard Return reads a repeated attack, never a varied one', () => {
  assert.equal(Logic.readsPattern(['k1', 'k1', 'k1'], 'k1'), true, 'the same cut three times running');
  assert.equal(Logic.readsPattern(['k1', 'p1', 'k1', 'rk', 'k1', 'p1', 'k1', 'k2'], 'k1'), true, 'half of the last eight');
  assert.equal(Logic.readsPattern(['k1', 'p1', 'rk', 'k2', 'k3', 'p2'], 'k1'), false, 'a varied string is not read');
  assert.equal(Logic.readsPattern(['k1', 'k1'], 'k1'), false, 'two in a row is not yet a pattern');
  assert.equal(Logic.readsPattern([], 'k1'), false);
  assert.equal(Logic.predictability(['k1', 'k1', 'p1', 'k1'], 'k1'), 0.75);
  assert.equal(Logic.predictability(['k1', 'k1'], 'k1'), 0, 'too short to judge');
});

test('Takashi wields a plain gold-trailed blade, never Shinsen, in the Shinsen style', () => {
  const w = ENEMIES.takashi.weapon;
  assert.notEqual(w, 'shinsen');
  assert.equal(WEAPONS[w].enemy, 1, 'an enemy-only blade, never granted');
  assert.equal(WEAPONS[w].el, 'gold');
  assert.deepEqual(WEAPONS[w].moves, WEAPONS.shinsen.moves, 'he fights with the father-style forms');
  assert.notEqual(WEAPONS[w].special, 'finalFlow', 'his Final Flow is the boss ability, not a rage art');
  assert.equal(ENEMIES.takashi.helmet, 'kasa');
  assert.equal(ENEMIES.takashi.armor, 'shinsei_yoroi');
});

test('his family form is the shared pattern, grounded, heavier and slower than Kage\'s, cut with Shinsen\'s moves', () => {
  assert.equal(ENEMIES.takashi.form, 'takashi');
  const t = Logic.familyForm('takashi'), k = Logic.familyForm('kage');
  assert.equal(t.style, 'takashi');
  assert.deepEqual(t.steps.map(s => s.step), k.steps.map(s => s.step), 'the same steps in the same order as Kage\'s');
  for (const s of t.steps) if (s.move) assert.ok(MOVES[s.move], `${s.move} exists`);
  assert.ok(t.tempo > k.tempo, 'slower cuts');
  const stance = st => st.steps.find(s => s.step === 'stance').wait;
  assert.ok(stance(t) > stance(k), 'a longer grounded opening stance');
  const fam = WEAPONS.shinsen.family;
  assert.equal(t.steps.find(s => s.step === 'rise').move, fam.rise);
  assert.equal(t.steps.find(s => s.step === 'aerial').move, fam.aerial);
  assert.equal(t.steps.filter(s => s.step === 'flow').pop().move, fam.flow);
});

test('Takashi kneels and escapes: no finisher, recorded as escaped, not killed', () => {
  assert.equal(Logic.bossDefeat('takashi'), 'escape');
  assert.equal(Logic.stageConfig(Logic.defaultSave(), 'act3.boss').format.defeat, 'escape');
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act3.boss');
  const out = Logic.applyFightResult(s, win('act3.boss'));
  assert.equal(Logic.bossFate(s, 'act3.boss'), 'escaped');
  assert.notEqual(out.fate, 'killed');
});

test('clearing Takashi\'s stage grants the Kasa exactly once, and never the Shinsei Yoroi', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act3.boss');
  assert.equal(Logic.isLocked(s, 'helmets', 'kasa'), true);
  const out = Logic.applyFightResult(s, win('act3.boss'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter').map(u => ({ ...u })), [{ kind: 'helmets', id: 'kasa' }]);
  assert.equal(s.owned.helmets.kasa, 1);
  assert.equal(s.owned.armors.shinsei_yoroi, undefined);
  const again = Logic.applyFightResult(s, win('act3.boss'));
  assert.deepEqual(again.unlocks, [], 'a replay grants nothing');
  assert.equal(s.owned.helmets.kasa, 1);
});

test('act3.boss never lists the Shinsei Yoroi: it stays New Game+ only (the Epilogue ticket wires it)', () => {
  const r = Logic.stage('act3.boss').reward;
  assert.deepEqual(r, { helmets: ['kasa'] });
});

test('the Kasa\'s lore speaks of the road, his exile and who he was before', () => {
  const { HELMETS } = loadLogic();
  const lore = HELMETS.kasa.lore;
  assert.match(lore, /road/i);
  assert.match(lore, /exile/i);
  assert.match(lore, /before/i);
});

test('the pre-fight scene has Takashi see Shinsen in Kage\'s hands and confess the Echo System', () => {
  const before = Logic.stageScene('act3.boss', 'before');
  assert.ok(before);
  const said = SCENES[before].steps.filter(s => s.say === 'takashi').map(s => s.text).join(' ');
  assert.match(said, /Shinsen/);
  assert.match(said, /Echo System/);
  assert.match(said, /war/i);
  assert.match(said, /kinder/i);
});

test('the defeat scene reveals Rem in the Core, gives the route, and he leaves the Kasa behind', () => {
  const defeat = Logic.stageScene('act3.boss', 'defeat');
  assert.ok(defeat);
  const steps = SCENES[defeat].steps, text = steps.map(s => s.text || s.caption || '').join(' ');
  assert.match(text, /Rem/);
  assert.match(text, /Memory Core|the Core/);
  assert.match(text, /ten years/i);
  assert.match(text, /kasa|hat/i);
  assert.ok(steps.some(s => s.flag === 'act3.core_route'), 'the route to the Core is a story flag');
  const s = Logic.defaultSave();
  for (const st of steps) if (st.flag) Logic.setStoryFlag(s, st.flag);
  assert.equal(Logic.storyFlag(s, 'act3.core_route'), true);
});
