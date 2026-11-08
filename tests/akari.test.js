'use strict';
// Akari, the Memory Blade: the Act II boss (act2.boss). Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES, WEAPONS } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId) => ({ mode: 'campaign', stageId, win: true, ng: 0, hpLeft: 0.5, time: 70, maxCombo: 4, parries: 0, flawless: false });
const FIVE = ['twinFang', 'smokeStep', 'blink', 'falseOpening', 'petalCross'];
// her three-phase redesign: the moves each phase introduces
const NEW = { 1: ['poisonKunai', 'shadowFlip', 'reapingArc', 'chainReap'], 2: ['petalStorm', 'kunaiFan', 'aerialDive', 'poisonTrap', 'petalBurst'],
  3: ['phantomDash', 'thousandCuts', 'petalTornado', 'mirrorClones', 'demonRequiem', 'chainBind'] };
const ALL = FIVE.concat(NEW[1], NEW[2], NEW[3]);

test('Akari, the Memory Blade, is the foe of the Act II boss stage', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'act2.boss');
  assert.equal(cfg.enemyId, 'akari');
  assert.equal(cfg.foeName, 'Akari');
  assert.equal(cfg.foeTitle, 'the Memory Blade');
  assert.equal(cfg.format.name, 'boss');
});

test('Akari fights in three phases, each introducing new moves, escalating to Petal Cross and her ultimate in phase 3', () => {
  const phases = Logic.bossPhases('akari');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.at), [1, 0.66, 0.33]);
  assert.deepEqual(Logic.bossAbilities('akari').slice().sort(), ALL.slice().sort());
  const [p1, p2, p3] = phases;
  assert.ok(p1.abilities.includes('twinFang') && p1.abilities.includes('smokeStep'));
  assert.ok(!p1.abilities.includes('falseOpening') && !p2.abilities.includes('petalCross') && !p1.abilities.includes('petalCross'));
  assert.ok(p2.abilities.includes('falseOpening') && p2.abilities.includes('blink'));
  for (const a of ALL) assert.ok(p3.abilities.includes(a), `phase 3 ${a}`);
  // every phase brings moves the one before did not have, and keeps the ones it had
  [p1, p2, p3].forEach((p, i) => {
    for (const a of NEW[i + 1]) assert.ok(p.abilities.includes(a), `phase ${i + 1} introduces ${a}`);
    if (i) for (const a of [p1, p2][i - 1].abilities) assert.ok(p.abilities.includes(a), `phase ${i + 1} keeps ${a}`);
    if (i) for (const a of NEW[i + 1]) assert.ok(![p1, p2][i - 1].abilities.includes(a), `${a} is new in phase ${i + 1}`);
  });
  assert.ok(p1.abilities.length < p2.abilities.length && p2.abilities.length < p3.abilities.length, 'each phase adds moves');
  // and her tempo rises: faster, shorter cooldowns, harder hits
  const t = phases.map(p => p.tempo);
  assert.ok(t[0].speed < t[1].speed && t[1].speed < t[2].speed, 'faster each phase');
  assert.ok(t[0].cd > t[1].cd && t[1].cd > t[2].cd, 'shorter cooldowns each phase');
  assert.ok(t[0].dmg < t[1].dmg && t[1].dmg < t[2].dmg, 'harder hits each phase');
});

test('every Akari move has a readable tell and a call-out', () => {
  for (const id of ALL) {
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

test('clearing Akari\'s stage grants the Mei-En Garb, Kagehira & Yūrei and Shinsen exactly once', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'act2.boss');
  assert.equal(Logic.isLocked(s, 'weapons', 'kagehira_yurei'), true);
  assert.equal(Logic.isLocked(s, 'armors', 'mei_en_garb'), true);
  const out = Logic.applyFightResult(s, win('act2.boss'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter').map(u => ({ ...u })),
    [{ kind: 'weapons', id: 'kagehira_yurei' }, { kind: 'weapons', id: 'shinsen' }, { kind: 'armors', id: 'mei_en_garb' }]);
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
