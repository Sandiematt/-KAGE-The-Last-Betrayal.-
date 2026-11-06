'use strict';
// The Interlude (SAN-33): young Kage spars with young Rem in a memory of Takashi's yard. The match never ends in a KO:
// Takashi calls the boys in at a health threshold or when the clock runs out, so nobody wins, and the stage can't be
// lost. Both brothers fight with the family form, Rem faster. Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, MOVES, WEAPONS } = loadLogic();
const clearUpTo = (save, id) => { for (const st of Logic.stages()) { if (st.id === id) break; Logic.completeStage(save, st.id); } };
const sparSave = () => { const s = Logic.defaultSave(); clearUpTo(s, 'interlude.spar'); return s; };
const sparFormat = () => Logic.stageConfig(Logic.defaultSave(), 'interlude.spar').format;
const result = (o) => Object.assign({ mode: 'campaign', stageId: 'interlude.spar', ng: 0, hpLeft: 0.5, time: 30, maxCombo: 3, parries: 0, flawless: false }, o);

/* ---------------- the spar format ---------------- */

test('the Interlude is fought in the spar format: one round on a clock, with an interruption threshold', () => {
  const f = sparFormat();
  assert.equal(f.name, 'spar');
  assert.equal(f.roundsToWin, 1);
  assert.ok(f.timer > 0, 'the spar has a clock');
  assert.ok(f.interruptAt > 0 && f.interruptAt < 1, 'Takashi steps in before anyone is beaten');
  assert.equal(f.preventKO, true);
});

test('only the Interlude uses the spar format', () => {
  const s = Logic.defaultSave();
  for (const id of ['act1.sub1', 'act1.boss', 'core.echo4']) assert.notEqual(Logic.stageConfig(s, id).format.name, 'spar', id);
});

test('Takashi interrupts when either brother drops to the threshold, or when the clock runs out', () => {
  const f = sparFormat();
  const at = f.interruptAt;
  assert.equal(Logic.sparOutcome(f, { playerHp: 1, foeHp: 1, time: 0 }), null);
  assert.equal(Logic.sparOutcome(f, { playerHp: at + 0.05, foeHp: at + 0.05, time: f.timer - 1 }), null);
  assert.equal(Logic.sparOutcome(f, { playerHp: at, foeHp: 0.9, time: 5 }), 'interrupted');
  assert.equal(Logic.sparOutcome(f, { playerHp: 0.9, foeHp: at - 0.1, time: 5 }), 'interrupted');
  assert.equal(Logic.sparOutcome(f, { playerHp: 0.9, foeHp: 0.9, time: f.timer }), 'interrupted');
});

test('a spar blow never knocks a brother out: health stays above zero, so the interruption always comes first', () => {
  const f = sparFormat();
  assert.equal(Logic.sparHealth(f, -40), 1);
  assert.equal(Logic.sparHealth(f, 0), 1);
  assert.equal(Logic.sparHealth(f, 57), 57);
  // outside a spar the blow lands as it is
  assert.equal(Logic.sparHealth(Logic.stageConfig(Logic.defaultSave(), 'act1.sub1').format, -40), -40);
});

/* ---------------- completing the Interlude ---------------- */

test('the interrupted spar completes the Interlude without a winner and opens Act II', () => {
  const s = sparSave(), wins = s.stats.wins, losses = s.stats.losses;
  const out = Logic.applyFightResult(s, result({ win: true, outcome: 'interrupted' }));
  assert.equal(out.outcome, 'interrupted');
  assert.equal(out.winner, null);
  assert.equal(Logic.isStageComplete(s, 'interlude.spar'), true);
  assert.equal(s.stats.wins, wins, 'no win recorded');
  assert.equal(s.stats.losses, losses, 'no loss recorded');
  assert.equal(Logic.defeatedCount(s, 'interlude.spar'), 0, 'Rem is never recorded as beaten');
  assert.equal(Logic.isChapterUnlocked(s, 'act2'), true);
  assert.equal(Logic.nextStage(s), 'act2.stretch1');
  assert.ok(out.unlocks.some(u => u.kind === 'chapter' && u.id === 'act2'));
});

test('the Interlude cannot be lost: even a result that says the player lost completes it, without a loss', () => {
  const s = sparSave(), losses = s.stats.losses;
  const out = Logic.applyFightResult(s, result({ win: false, hpLeft: 0.1 }));
  assert.equal(out.outcome, 'interrupted');
  assert.equal(out.winner, null);
  assert.equal(Logic.isStageComplete(s, 'interlude.spar'), true);
  assert.equal(s.stats.losses, losses);
  assert.ok(out.coins > 0, 'the memory still pays like a sub-boss stage');
});

test('replaying the spar still records no winner', () => {
  const s = sparSave();
  Logic.applyFightResult(s, result({ win: true }));
  const out = Logic.applyFightResult(s, result({ win: true }));
  assert.equal(out.firstClear, false);
  assert.equal(out.winner, null);
  assert.equal(Logic.defeatedCount(s, 'interlude.spar'), 0);
});

test('the Interlude unlocks only after Raikon and comes right before Act II', () => {
  const s = Logic.defaultSave();
  clearUpTo(s, 'act1.boss');
  assert.equal(Logic.isStageUnlocked(s, 'interlude.spar'), false);
  Logic.completeStage(s, 'act1.boss');
  assert.equal(Logic.isStageUnlocked(s, 'interlude.spar'), true);
  assert.equal(Logic.isStageUnlocked(s, 'act2.stretch1'), false);
});

/* ---------------- the young brothers ---------------- */

test('young Kage fights with a bokken and fixed health: the player\'s real gear does not apply', () => {
  const plain = Logic.defaultSave(), geared = Logic.defaultSave();
  geared.level = 30; geared.owned.weapons.onikiri = 8; geared.equipped.weapon = 'onikiri';
  const a = Logic.youngKage(plain), b = Logic.youngKage(geared);
  assert.deepEqual(a, b);
  assert.equal(a.weapon, 'bokken');
  assert.equal(a.defense, 0);
  assert.ok(a.hp > 0);
});

test('young Rem is the Interlude\'s foe, fighting with a bokken in the family form, faster than Kage', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'interlude.spar');
  assert.equal(cfg.enemyId, 'young_rem');
  assert.equal(cfg.foeName, 'Rem');
  const { ENEMIES } = loadLogic();
  assert.equal(ENEMIES.young_rem.weapon, 'bokken');
  assert.equal(ENEMIES.young_rem.form, 'rem');
});

test('the bokken is a wooden practice sword on the katana forms that does reduced damage', () => {
  const b = WEAPONS.bokken;
  assert.equal(b.base, 'kagetsu');
  assert.ok(b.enemy, 'never sold or owned');
  assert.ok(Logic.weaponMul('bokken', 1).dmg < 0.7, 'a wooden blade hits softer than steel');
});

/* ---------------- the family form ---------------- */

test('the family form runs stance, dash, rising cut, aerial follow-up, landing, then a finishing horizontal flow', () => {
  for (const style of ['kage', 'rem']) {
    const form = Logic.familyForm(style);
    const order = form.steps.map(s => s.step).filter((s, i, a) => a.indexOf(s) === i);
    assert.deepEqual(order, ['stance', 'dash', 'rise', 'aerial', 'landing', 'flow'], style);
  }
});

test('every move the family form names exists, and aerial steps use the air cut', () => {
  for (const style of ['kage', 'rem']) for (const s of Logic.familyForm(style).steps) {
    if (s.move) assert.ok(MOVES[s.move], `${style} ${s.step} ${s.move}`);
    if (s.step === 'aerial') assert.equal(MOVES[s.move].kind, 'air');
    if (s.step === 'rise' || s.step === 'flow') assert.equal(MOVES[s.move].kind, 'weapon');
  }
});

test('Rem runs the family form faster and more fluidly: shorter gaps, longer chains, more aerial follow-ups', () => {
  const k = Logic.familyForm('kage'), r = Logic.familyForm('rem');
  const total = f => f.steps.reduce((t, s) => t + s.wait, 0);
  const count = (f, step) => f.steps.filter(s => s.step === step).length;
  assert.ok(total(r) < total(k) / 2, 'Rem leaves far shorter gaps');
  assert.ok(r.tempo < k.tempo, 'Rem\'s cuts start and recover faster');
  assert.ok(count(r, 'aerial') > count(k, 'aerial'));
  assert.ok(count(r, 'flow') > count(k, 'flow'));
  assert.ok(r.steps.length > k.steps.length);
});

test('young Kage\'s own bokken string is the form\'s rising cut into the horizontal flow, and its air cut is the aerial', () => {
  const k = Logic.familyForm('kage'), b = WEAPONS.bokken;
  const move = step => k.steps.find(s => s.step === step).move;
  assert.equal(b.moves[0], move('rise'));
  assert.equal(MOVES[b.moves[0]].next, move('flow'));
  assert.equal(b.air, move('aerial'));
});

test('an unknown style falls back to Kage\'s form', () => {
  assert.deepEqual(Logic.familyForm('nobody'), Logic.familyForm('kage'));
});

/* ---------------- the scenes ---------------- */

test('the Interlude opens and closes with memory scenes, and leaves "who won?" for the Epilogue', () => {
  const { SCENES } = loadLogic();
  for (const hook of ['before', 'after']) {
    const id = Logic.stageScene('interlude.spar', hook);
    assert.ok(id && SCENES[id], hook);
    assert.equal(SCENES[id].memory, true, `${hook} plays as a flashback`);
    const speakers = new Set(SCENES[id].steps.filter(s => s.say).map(s => s.say));
    for (const who of ['kage', 'rem', 'takashi']) assert.ok(speakers.has(who), `${hook}: ${who} speaks`);
  }
  const after = SCENES[Logic.stageScene('interlude.spar', 'after')].steps.map(s => s.text || '').join(' ');
  assert.ok(!/who won/i.test(after) && !/keep dreaming/i.test(after), 'the Epilogue joke is not spent here');
});
