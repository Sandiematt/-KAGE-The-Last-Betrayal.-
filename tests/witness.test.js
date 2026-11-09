'use strict';
// The Witness, Architect of Echoes: the final boss (core.witness), redesigned 2026-11-09 as a four-phase fight from the
// user's reference sheets. Driven through Logic's public functions only; the fight itself is stepped through the real
// simulation in witness-fight.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES, ENEMIES, WEAPONS } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId, ng) => ({ mode: 'campaign', stageId, win: true, ng: ng || 0, hpLeft: 0.5, time: 120, maxCombo: 4, parries: 0, flawless: false });

test('the Witness, Architect of Echoes, is the foe of core.witness, fought in the boss format with four phases', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'core.witness');
  assert.equal(cfg.enemyId, 'witness');
  assert.equal(cfg.foeName, 'The Witness');
  assert.equal(ENEMIES.witness.title, 'Architect of Echoes');
  assert.equal(cfg.format.name, 'boss');
  assert.equal(cfg.format.phases, 4);
  assert.equal(cfg.format.timer, 0, 'no round clock');
});

test('the phase state machine opens on the true health thresholds: 100 / 75 / 50 / 25', () => {
  const phases = Logic.bossPhases('witness');
  assert.deepEqual(phases.map(p => p.name), ['The Observer', 'The Manipulator', 'The Reality Editor', 'The True Witness']);
  assert.deepEqual(phases.map(p => p.at), [1, 0.75, 0.5, 0.25]);
  assert.deepEqual(phases.map(p => p.look), [0, 1, 2, 3], 'each phase wears its own look');
  for (const [hp, want] of [[1, 0], [0.76, 0], [0.75, 1], [0.51, 1], [0.5, 2], [0.26, 2], [0.25, 3], [0.01, 3], [0, 3]]) assert.equal(Logic.bossPhaseAt('witness', hp), want, `at ${hp}`);
});

test('each phase fights with the spec\'s attacks', () => {
  const [p1, p2, p3, p4] = Logic.bossPhases('witness');
  for (const id of ['voidSlash', 'echoStep', 'orbitBlades', 'phantomCounter']) assert.ok(p1.abilities.includes(id), `I: ${id}`);
  for (const id of ['echoBind', 'reversal', 'inputDelay', 'mirrorSelf', 'rageSuppression', 'forcedEchoStep']) assert.ok(p2.abilities.includes(id), `II: ${id}`);
  for (const id of ['realityRewrite', 'healthDrain', 'gravityCollapse', 'executionFrames', 'falseDeath']) assert.ok(p3.abilities.includes(id), `III: ${id}`);
  for (const id of ['absoluteControl', 'nullProtocol', 'echoExecution', 'timelineBreak', 'finalJudgment']) assert.ok(p4.abilities.includes(id), `IV: ${id}`);
  assert.equal(p4.adaptive, 1, 'the True Witness adapts');
  for (const p of [p1, p2, p3, p4]) for (const id of p.abilities) assert.ok(Logic.witnessMove(id), `${p.name}: ${id} has its numbers`);
  assert.ok(Logic.witnessMove('echoGenesis'), 'Echo Genesis, the domain');
  assert.equal(Logic.witnessMove('twinFang'), null);
});

test('every attack runs Telegraph -> Startup -> Active -> Recovery, then Cooldown, with a readable telegraph', () => {
  for (const p of Logic.bossPhases('witness')) for (const id of p.abilities) {
    const st = Logic.witnessStages(id, 1);
    assert.deepEqual(st.map(s => s.stage), ['telegraph', 'startup', 'active', 'recovery'], id);
    assert.ok(st[0].dur >= 0.3, `${id} telegraphs for ${st[0].dur}`);
    for (let i = 1; i < 4; i++) assert.ok(Math.abs(st[i].at - (st[i - 1].at + st[i - 1].dur)) < 1e-9, `${id}: stages follow each other`);
    const end = st[3].at + st[3].dur;
    assert.equal(Logic.witnessStageAt(st, 0), 'telegraph');
    assert.equal(Logic.witnessStageAt(st, st[2].at + 1e-6), 'active');
    assert.equal(Logic.witnessStageAt(st, end + 0.01), 'cooldown');
    assert.ok(Logic.witnessMove(id).cd > 0, `${id} has a cool-down`);
  }
  // a faster difficulty or phase IV's jitter can shorten a telegraph, never below the floor
  assert.ok(Logic.witnessStages('echoStep', 0.1)[0].dur >= 0.3);
});

test('the input modifier layer: bind, reverse, delay and lock, applied over the raw controls without changing them', () => {
  const raw = Object.freeze({ dir: 1, tapDir: 1, up: false, jumpP: true, dashP: true, punchP: true, weaponP: false, blockHeld: true, blockP: false, grabP: false, specialP: true, kickP: false, kickHeld: false, kickR: false, aim: null });
  const rev = Logic.witnessInput(raw, [{ kind: 'reverse' }]);
  assert.equal(rev.dir, -1); assert.equal(rev.tapDir, -1); assert.equal(raw.dir, 1, 'the raw controls are untouched');
  assert.equal(Logic.witnessInput(raw, [{ kind: 'reverse' }, { kind: 'reverse' }]).dir, 1, 'two reversals cancel');
  const bound = Logic.witnessInput(raw, [{ kind: 'bind', dir: 1 }]);
  assert.equal(bound.dir, 0, 'the bound direction is locked'); assert.equal(bound.tapDir, 0, 'no dash-tap that way either');
  assert.equal(Logic.witnessInput({ ...raw, dir: -1 }, [{ kind: 'bind', dir: 1 }]).dir, -1, 'the other way is free');
  const late = { punchP: false, weaponP: true, kickP: false, kickHeld: false, kickR: false, specialP: false, grabP: false, aim: 'up' };
  const delayed = Logic.witnessInput(raw, [{ kind: 'delay', keys: ['punchP', 'weaponP', 'specialP', 'aim'] }], late);
  assert.equal(delayed.punchP, false, 'this frame\'s press waits');
  assert.equal(delayed.weaponP, true, 'the press from `delay` ago arrives');
  assert.equal(delayed.dir, 1, 'movement is not delayed by an attack delay');
  // the moment a movement delay bites nothing has arrived yet: the keys read as released, never undefined
  const first = Logic.witnessInput(raw, [{ kind: 'delay', keys: ['dir', 'tapDir', 'jumpP', 'dashP', 'up'] }], null);
  assert.deepEqual([first.dir, first.tapDir, first.jumpP, first.dashP, first.up], [0, 0, false, false, false]);
  const empty = Logic.witnessInput(raw, [{ kind: 'delay', keys: ['dir'] }], {});
  assert.equal(empty.dir, 0, 'a snapshot without the key reads as released');
  for (const [lock, keys] of [['dash', ['dashP', 'tapDir']], ['jump', ['jumpP']], ['block', ['blockHeld', 'blockP']], ['special', ['specialP']]]) {
    const out = Logic.witnessInput(raw, [{ kind: 'lock', lock }]);
    for (const k of keys) assert.ok(!out[k], `${lock} locks ${k}`);
  }
  assert.equal(Logic.witnessInput(raw, [{ kind: 'reverse' }, { kind: 'lock', lock: 'dash' }]).tapDir, 0, 'a lock wins over a reversal');
});

test('every control modifier is warned first and lasts 0.5 to 1.2 seconds', () => {
  for (const id of ['echoBind', 'reversal', 'inputDelay']) {
    const m = Logic.witnessMove(id);
    assert.ok(m.warn >= 0.4, `${id} warns`);
    assert.ok(m.dur >= 0.5 && m.dur <= 1.2, `${id} lasts ${m.dur}`);
  }
  assert.ok(Logic.witnessMove('inputDelay').delay > 0 && Logic.witnessMove('inputDelay').delay <= 0.2, 'a brief, consistent delay');
  assert.ok(Logic.witnessMove('nullProtocol').each <= 1.3, 'each lockout is brief');
});

test('the adaptive tracker reads overused attacks and a defensive habit', () => {
  const a = Logic.witnessAdapt(['weapon', 'weapon', 'dash', 'weapon', 'punch', 'weapon', 'block']);
  assert.equal(a.top, 'weapon'); assert.equal(a.share, 0.8); assert.equal(a.overused, true);
  assert.ok(a.defensive > 0.25 && a.defensive < 0.3);
  const varied = Logic.witnessAdapt(['weapon', 'punch', 'kick', 'dir:up', 'air', 'dir:down']);
  assert.equal(varied.overused, false, 'a varied kit is never overused');
  assert.equal(Logic.witnessAdapt(['weapon', 'weapon']).overused, false, 'too little to read yet');
  const hiding = Logic.witnessAdapt(['block', 'block', 'dash', 'block', 'weapon', 'dash']);
  assert.ok(hiding.defensive >= 0.45, 'mostly blocks and dashes');
  assert.equal(Logic.witnessAdapt([]).top, null);
});

test('Void Slash is three waves low enough to jump; Final Judgment has a precise counter window', () => {
  const v = Logic.witnessMove('voidSlash');
  assert.equal(v.waves, 3);
  assert.ok(v.h <= 130, 'a wave is low enough to jump (Kage\'s jump clears about 166 px)');
  assert.ok(v.gap >= 0.35, 'a gap between the waves');
  const j = Logic.witnessMove('finalJudgment');
  assert.ok(j.windup >= 1.2, 'a long gather');
  assert.ok(j.perfect > 0 && j.perfect <= 0.25, 'a precise guard window');
});

/* ---- Echo Replication (Mugen no Ha's rage art copies Kage's own strings with these rules) ----
   The log is the player's moves, oldest first: { id, t (seconds), hit (it landed) }. Moves less than `gap` apart form
   one string; the LATEST string that landed is the one copied. */
const L = (...rows) => rows.map(([id, t, hit]) => ({ id, t, hit: !!hit }));

test('Echo Replication copies the last string that hit, not a later whiff', () => {
  const log = L(['p1', 0], ['k1', 0.3, 1], ['k2', 0.6, 1], ['rk', 3, 0], ['k3', 3.3, 0]);
  assert.deepEqual(Logic.echoReplication(log).moves, ['p1', 'k1', 'k2']);
  assert.equal(Logic.echoReplication([]), null);
  assert.equal(Logic.echoReplication(L(['k1', 0], ['k2', 0.3])), null);
});

test('throws, grabs and rage arts are never copied, and a long string keeps only its last five moves', () => {
  const log = L(['kunai', 0], ['k1', 0.2, 1], ['grab', 0.4], ['p1', 0.6], ['p2', 0.8], ['p3', 1.0], ['rk', 1.2], ['k2', 1.4, 1]);
  assert.deepEqual(Logic.echoReplication(log).moves, ['p1', 'p2', 'p3', 'rk', 'k2']);
});

test('the same landed string three times running is marked as spam', () => {
  const once = L(['k1', 0, 1], ['k2', 0.3, 1]);
  const thrice = once.concat(L(['k1', 2, 1], ['k2', 2.3, 1]), L(['k1', 4, 1], ['k2', 4.3, 1]));
  assert.equal(Logic.echoReplication(once).repeats, 1);
  assert.equal(Logic.echoReplication(thrice).punish, true);
  const varied = once.concat(L(['k1', 2, 1], ['k2', 2.3, 1]), L(['p1', 4, 1], ['rk', 4.3, 1]));
  assert.equal(Logic.echoReplication(varied).punish, false, 'a different pattern resets it');
});

test('the latest string with its own timing (the mirror)', () => {
  const log = L(['k1', 0, 1], ['p1', 5, 0], ['p2', 5.25, 0], ['k1', 5.6, 0]);
  const m = Logic.mirrorSequence(log);
  assert.deepEqual(m.map(s => s.id), ['p1', 'p2', 'k1']);
  assert.deepEqual(m.map(s => Math.round(s.wait * 100) / 100), [0, 0.25, 0.35]);
  assert.deepEqual(Logic.mirrorSequence([]), []);
});

test('Memory Break (Reality Rewrite\'s arena) turns through the remembered places', () => {
  const seen = [0, 1, 2, 3].map(i => Logic.memoryBreakEnv(i));
  assert.deepEqual(seen.slice().sort(), ['echoes', 'fortress', 'hoshimura', 'yard']);
  assert.equal(Logic.memoryBreakEnv(4), seen[0], 'and round again');
});

test('the Witness wields its own greatsword, Mugen no Ha: enemy-only, on the heavy cleaver forms, never copying Kage', () => {
  const w = WEAPONS[ENEMIES.witness.weapon];
  assert.equal(ENEMIES.witness.weapon, 'witness_greatsword');
  assert.notEqual(ENEMIES.witness.weapon, 'mugen_no_ha');
  assert.equal(w.enemy, 1);
  assert.equal(w.cls, 'Greatsword');
  assert.deepEqual(w.moves, WEAPONS.onikiri.moves, 'the cleaver\'s heavy forms');
  assert.ok(w.len >= 140 && w.heft >= 1.5, 'long and heavy');
  assert.equal(ENEMIES.witness.mirrorWeapon, undefined, 'it no longer copies Kage\'s weapon');
  assert.equal(ENEMIES.witness.armor, 'kysmei_robe');
});

test('the greatsword\'s moves: a heavy Echo Combo ending in a floor-splitting cleave, and Echo Breaker in every phase', () => {
  const c = Logic.witnessMove('echoCombo'), b = Logic.witnessMove('echoBreaker');
  assert.ok(c.gb >= 2 && c.finisher > c.dmg && c.waves.every(n => n >= 1), 'guard-crushing cuts; the cleave sends floor waves');
  assert.ok(Math.max(...c.cuts) * c.every <= c.active, 'every cut fits the active window');
  assert.ok(b.reach > 0 && b.dmg > 0 && b.wave.dmg > 0);
  for (const ph of ENEMIES.witness.phases) assert.ok(ph.abilities.includes('echoBreaker'), ph.name);
});

test('defeat is reabsorb: winning records the Witness as reabsorbed, never killed; its last line is the spec\'s', () => {
  assert.equal(Logic.bossDefeat('witness'), 'reabsorb');
  assert.equal(Logic.stageConfig(Logic.defaultSave(), 'core.witness').format.defeat, 'reabsorb');
  assert.equal(ENEMIES.witness.defeatLine, 'Impossible... You were never supposed to have a choice.');
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'core.witness');
  assert.equal(Logic.bossFate(s, 'core.witness'), null, 'nothing recorded before the fight is won');
  Logic.applyFightResult(s, win('core.witness'));
  assert.equal(Logic.bossFate(s, 'core.witness'), 'reabsorbed');
  assert.ok(Logic.isStageComplete(s, 'core.witness'));
});

test('core.witness grants no gear: Mugen no Ha and the Kysmei Robe wait for the Epilogue', () => {
  assert.equal(Logic.stage('core.witness').reward, undefined);
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'core.witness');
  const out = Logic.applyFightResult(s, win('core.witness'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter'), []);
  assert.equal(Logic.isLocked(s, 'weapons', 'mugen_no_ha'), true);
  assert.equal(Logic.isLocked(s, 'armors', 'kysmei_robe'), true);
});

test('the before scene reveals the reconstruction; the defeat scene is the final story cutscene', () => {
  const said = SCENES[Logic.stageScene('core.witness', 'before')].steps.filter(s => s.say === 'witness').map(s => s.text).join(' ');
  assert.match(said, /reconstruct/i);
  const steps = SCENES[Logic.stageScene('core.witness', 'defeat')].steps;
  assert.ok(steps.some(s => s.flag === 'core.identity_restored'));
  assert.equal(steps[0].text, ENEMIES.witness.defeatLine, 'it opens with its last words');
  // every phase change and the domain stop the fight for a dialogue in which Kage answers it
  for (const id of ['core.witness.shift1', 'core.witness.shift2', 'core.witness.shift3', 'core.witness.genesis']) {
    assert.ok(SCENES[id], id);
    assert.ok(SCENES[id].steps.some(st => st.say === 'kage') && SCENES[id].steps.some(st => st.say === 'witness'), `${id}: both speak`);
  }
});
