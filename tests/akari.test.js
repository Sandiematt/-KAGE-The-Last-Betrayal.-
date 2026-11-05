'use strict';
// Akari, the Memory Blade: the Act II boss (act2.boss). Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES, WEAPONS } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId) => ({ mode: 'campaign', stageId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });
const FIVE = ['twinFang', 'smokeStep', 'blink', 'falseOpening', 'petalCross'];

test('Akari, the Memory Blade, is the foe of the Act II boss stage', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'act2.boss');
  assert.equal(cfg.enemyId, 'akari');
  assert.equal(cfg.foeName, 'Akari');
  assert.equal(cfg.foeTitle, 'the Memory Blade');
  assert.equal(cfg.format.name, 'boss');
});

test('Akari fights in three phases with all five of her moves, escalating to Petal Cross in phase 3', () => {
  const phases = Logic.bossPhases('akari');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.at), [1, 0.66, 0.33]);
  assert.deepEqual(Logic.bossAbilities('akari').slice().sort(), FIVE.slice().sort());
  const [p1, p2, p3] = phases;
  assert.ok(p1.abilities.includes('twinFang') && p1.abilities.includes('smokeStep'));
  assert.ok(!p1.abilities.includes('falseOpening') && !p2.abilities.includes('petalCross') && !p1.abilities.includes('petalCross'));
  assert.ok(p2.abilities.includes('falseOpening') && p2.abilities.includes('blink'));
  for (const a of FIVE) assert.ok(p3.abilities.includes(a), `phase 3 ${a}`);
  assert.ok(p1.abilities.length < p2.abilities.length && p2.abilities.length < p3.abilities.length, 'each phase adds moves');
});

test('every Akari move has a readable tell and a call-out', () => {
  for (const id of FIVE) {
    const m = Logic.akariMove(id);
    assert.ok(m, id);
    assert.ok(m.windup >= 0.3, `${id} winds up for a readable moment`);
    assert.ok(m.label && m.label.length > 0, `${id} label`);
  }
  assert.equal(Logic.akariMove('thunderSwing'), null);
});

test('her smoke is compact and never hides the player for more than a brief moment', () => {
  const s = Logic.akariMove('smokeStep').smoke;
  assert.ok(s.life <= 0.6, `smoke puff lasts ${s.life}s`);
  assert.ok(s.radius <= 60, `smoke puff radius ${s.radius}`);
  const f = Logic.akariMove('falseOpening');
  assert.ok(f.afterimages >= 1 && f.afterimages <= 2, 'one or two afterimage silhouettes');
  assert.ok(f.opacity > 0 && f.opacity < 1, 'afterimages are drawn at reduced opacity');
});

test('Akari is defeated with the finisher and recorded as killed', () => {
  assert.equal(Logic.bossDefeat('akari'), 'finisher');
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act2.boss');
  Logic.applyFightResult(s, win('act2.boss'));
  assert.equal(Logic.bossFate(s, 'act2.boss'), 'killed');
});

test('clearing Akari\'s stage grants the Mei-En Garb and Kagehira & Yūrei exactly once', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act2.boss');
  assert.equal(Logic.isLocked(s, 'weapons', 'kagehira_yurei'), true);
  assert.equal(Logic.isLocked(s, 'armors', 'mei_en_garb'), true);
  const out = Logic.applyFightResult(s, win('act2.boss'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter').map(u => ({ ...u })),
    [{ kind: 'weapons', id: 'kagehira_yurei' }, { kind: 'armors', id: 'mei_en_garb' }]);
  assert.equal(s.owned.weapons.kagehira_yurei, 1);
  assert.equal(s.owned.armors.mei_en_garb, 1);
  assert.equal(Logic.equipItem(s, 'weapons', 'kagehira_yurei'), true);
  const again = Logic.applyFightResult(s, win('act2.boss'));
  assert.deepEqual(again.unlocks, [], 'a replay grants nothing');
  assert.equal(s.owned.weapons.kagehira_yurei, 1);
});

test('Kagehira & Yūrei\'s rage art is Smoke Step', () => {
  assert.equal(WEAPONS.kagehira_yurei.special, 'smokeStep');
});

test('Akari intercepts Kage before the fight; her dying reveal hands over Shinsen', () => {
  const before = Logic.stageScene('act2.boss', 'before'), defeat = Logic.stageScene('act2.boss', 'defeat');
  assert.ok(before && defeat);
  assert.ok(SCENES[before].steps.some(s => s.say === 'akari'));
  const steps = SCENES[defeat].steps;
  assert.ok(steps.some(s => s.flag === 'act2.shinsen_received'), 'the defeat scene sets the Shinsen flag');
  const said = steps.filter(s => s.say === 'akari').map(s => s.text).join(' ');
  for (const w of [/Rem/, /Takashi/, /Echo System/, /Shinsen/]) assert.match(said, w);
  const s = Logic.defaultSave();
  for (const st of steps) if (st.flag) Logic.setStoryFlag(s, st.flag);
  assert.equal(Logic.storyFlag(s, 'act2.shinsen_received'), true);
});
