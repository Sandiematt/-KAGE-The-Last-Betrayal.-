'use strict';
// The Witness, Mirror of the Self: the final boss (core.witness). Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, SCENES, ENEMIES, WEAPONS } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const win = (stageId, ng) => ({ mode: 'campaign', stageId, win: true, ng: ng || 0, hpLeft: 0.5, time: 120, maxCombo: 4, parries: 0, flawless: false });

test('the Witness is the foe of core.witness, fought in the boss format', () => {
  const cfg = Logic.stageConfig(Logic.defaultSave(), 'core.witness');
  assert.equal(cfg.enemyId, 'witness');
  assert.equal(cfg.foeName, 'The Witness');
  assert.equal(cfg.format.name, 'boss');
  assert.equal(cfg.format.phases, 3);
  assert.equal(cfg.format.timer, 0, 'no round clock');
});

test('three phases: Mirror, Memory Break, Identity Collapse, with their abilities', () => {
  const phases = Logic.bossPhases('witness');
  assert.equal(phases.length, 3);
  assert.deepEqual(phases.map(p => p.at), [1, 0.66, 0.33]);
  const [p1, p2, p3] = phases;
  assert.equal(p1.mirror, 1, 'phase 1 mirrors Kage');
  // throughout: Echo Replication and Void Slash
  for (const p of phases) {
    assert.ok(p.abilities.includes('echoReplication'), `${p.name}: Echo Replication`);
    assert.ok(p.abilities.includes('voidSlash'), `${p.name}: Void Slash`);
  }
  assert.ok(p2.abilities.includes('memoryBreak') && p2.abilities.includes('hollowCopies'), 'phase 2 Memory Break and Hollow copies');
  assert.ok(!p1.abilities.includes('memoryBreak') && !p1.abilities.includes('hollowCopies'));
  const corrupt = p3.abilities.filter(id => Logic.witnessMove(id) && Logic.witnessMove(id).corrupt);
  assert.ok(corrupt.length >= 3, 'phase 3 fights with corrupted Takashi moves');
  assert.equal(p3.mirror, 1, 'phase 3 still mixes in copied Kage moves');
  for (const id of corrupt) assert.ok(!p1.abilities.includes(id) && !p2.abilities.includes(id), `${id} only in Identity Collapse`);
});

test('every corrupted move is one of Takashi\'s, violet instead of gold, with a readable tell', () => {
  const ids = Logic.bossAbilities('witness').filter(id => Logic.witnessMove(id) && Logic.witnessMove(id).corrupt);
  const bases = ids.map(id => Logic.witnessMove(id).base).sort();
  assert.deepEqual(bases, ['earthCleave', 'groundSmash', 'guardReturn']);
  for (const id of ids) {
    const m = Logic.witnessMove(id), t = Logic.takashiMove(m.base);
    assert.notEqual(m.tint, t.tint || '#e8c25c');
    assert.match(m.tint, /^#/);
    assert.ok(m.windup >= 0.1, `${id} still has a tell`);
    assert.ok(m.label && m.label !== t.label, `${id} has its own call-out`);
    assert.equal(m.glitch, 1, `${id} glitches`);
  }
});

test('Void Slash is a delayed long-range cut with a readable delay; Echo Replication has a tell', () => {
  const v = Logic.witnessMove('voidSlash');
  assert.ok(v.range[1] >= 700, 'long range');
  assert.ok(v.delay >= 0.45, 'the afterimage line hangs long enough to read');
  assert.ok(v.windup >= 0.3);
  const e = Logic.witnessMove('echoReplication');
  assert.ok(e.windup >= 0.25, 'Echo Replication tells before it plays back');
  assert.equal(Logic.witnessMove('twinFang'), null);
});

test('Memory Break swaps the arena through the remembered places, a few seconds each', () => {
  const m = Logic.witnessMove('memoryBreak');
  assert.ok(m.dur >= 2 && m.dur <= 6, 'a few seconds');
  const seen = [0, 1, 2, 3].map(i => Logic.memoryBreakEnv(i));
  assert.deepEqual(seen.slice().sort(), ['echoes', 'fortress', 'hoshimura', 'yard']);
  assert.equal(Logic.memoryBreakEnv(4), seen[0], 'and round again');
  const h = Logic.witnessMove('hollowCopies');
  assert.ok(h.count >= 1 && h.count <= 2, 'one or two copies at a time');
  assert.equal(ENEMIES[h.enemy].family, 'hollow', 'Hollow-styled copies of Kage');
  assert.ok(ENEMIES[h.enemy].hp <= 120, 'cheap');
});

/* ---- Echo Replication: which pattern the Witness copies ----
   The log is the player's moves, oldest first: { id, t (seconds), hit (it landed on the Witness) }. Moves less than
   `gap` apart form one string; the Witness copies the LATEST string that landed. */
const L = (...rows) => rows.map(([id, t, hit]) => ({ id, t, hit: !!hit }));

test('Echo Replication copies the last string that hit, not a later whiff', () => {
  const log = L(['p1', 0], ['k1', 0.3, 1], ['k2', 0.6, 1], ['rk', 3, 0], ['k3', 3.3, 0]);
  const e = Logic.echoReplication(log);
  assert.deepEqual(e.moves, ['p1', 'k1', 'k2']);
});

test('Echo Replication copies nothing until a blow lands', () => {
  assert.equal(Logic.echoReplication([]), null);
  assert.equal(Logic.echoReplication(L(['k1', 0], ['k2', 0.3])), null);
});

test('throws, grabs and rage arts are never copied, and a long string keeps only its last five moves', () => {
  const log = L(['kunai', 0], ['k1', 0.2, 1], ['grab', 0.4], ['p1', 0.6], ['p2', 0.8], ['p3', 1.0], ['rk', 1.2], ['k2', 1.4, 1]);
  assert.deepEqual(Logic.echoReplication(log).moves, ['p1', 'p2', 'p3', 'rk', 'k2']);
});

test('spamming one pattern is punished: the same landed string three times running', () => {
  const once = L(['k1', 0, 1], ['k2', 0.3, 1]);
  const twice = once.concat(L(['k1', 2, 1], ['k2', 2.3, 1]));
  const thrice = twice.concat(L(['k1', 4, 1], ['k2', 4.3, 1]));
  assert.equal(Logic.echoReplication(once).repeats, 1);
  assert.equal(Logic.echoReplication(twice).punish, false);
  assert.equal(Logic.echoReplication(thrice).repeats, 3);
  assert.equal(Logic.echoReplication(thrice).punish, true);
  const varied = twice.concat(L(['p1', 4, 1], ['rk', 4.3, 1]));
  assert.equal(Logic.echoReplication(varied).punish, false, 'a different pattern resets it');
  assert.deepEqual(Logic.echoReplication(varied).moves, ['p1', 'rk']);
});

test('phase 1 mirrors the player\'s latest string with its own timing', () => {
  const log = L(['k1', 0, 1], ['p1', 5, 0], ['p2', 5.25, 0], ['k1', 5.6, 0]);
  const m = Logic.mirrorSequence(log);
  assert.deepEqual(m.map(s => s.id), ['p1', 'p2', 'k1']);
  assert.deepEqual(m.map(s => Math.round(s.wait * 100) / 100), [0, 0.25, 0.35]);
  assert.deepEqual(Logic.mirrorSequence([]), []);
});

test('the Witness copies Kage\'s weapon with Mugen no Ha: an enemy-only shard blade, never the real one', () => {
  const w = WEAPONS[ENEMIES.witness.weapon];
  assert.notEqual(ENEMIES.witness.weapon, 'mugen_no_ha');
  assert.equal(w.enemy, 1);
  assert.equal(ENEMIES.witness.mirrorWeapon, 1);
  assert.equal(ENEMIES.witness.armor, 'kysmei_robe', 'it wears the Kysmei Robe');
});

test('defeat is reabsorb: winning records the Witness as reabsorbed, never killed', () => {
  assert.equal(Logic.bossDefeat('witness'), 'reabsorb');
  assert.equal(Logic.stageConfig(Logic.defaultSave(), 'core.witness').format.defeat, 'reabsorb');
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'core.witness');
  assert.equal(Logic.bossFate(s, 'core.witness'), null, 'nothing recorded before the fight is won');
  Logic.applyFightResult(s, win('core.witness'));
  assert.equal(Logic.bossFate(s, 'core.witness'), 'reabsorbed');
  assert.ok(Logic.isStageComplete(s, 'core.witness'));
  const s2 = Logic.defaultSave(); clearUpTo(Logic, s2, 'core.witness');
  assert.equal(Logic.completeStage(s2, 'core.witness').fate, 'reabsorbed');
});

test('core.witness grants no gear: Mugen no Ha and the Kysmei Robe wait for the Epilogue', () => {
  assert.equal(Logic.stage('core.witness').reward, undefined);
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'core.witness');
  const out = Logic.applyFightResult(s, win('core.witness'));
  assert.deepEqual(out.unlocks.filter(u => u.kind !== 'chapter'), []);
  assert.equal(Logic.isLocked(s, 'weapons', 'mugen_no_ha'), true);
  assert.equal(Logic.isLocked(s, 'armors', 'kysmei_robe'), true);
});

test('the before scene reveals the reconstruction, slippery about why', () => {
  const id = Logic.stageScene('core.witness', 'before');
  assert.ok(id);
  const said = SCENES[id].steps.filter(s => s.say === 'witness').map(s => s.text).join(' ');
  assert.match(said, /reconstruct/i);
  assert.match(said, /real/i);
  assert.match(said, /order/i);
  assert.match(said, /test/i);
});

test('the defeat scene: the core shatters, the light flows back, the identity is restored', () => {
  const id = Logic.stageScene('core.witness', 'defeat');
  assert.ok(id);
  const steps = SCENES[id].steps, text = steps.map(s => s.text || s.caption || '').join(' ');
  assert.match(text, /core/i);
  assert.match(text, /light/i);
  assert.ok(steps.some(s => s.flag === 'core.identity_restored'));
  assert.ok(steps.length <= 12, 'short');
  const s = Logic.defaultSave();
  for (const st of steps) if (st.flag) Logic.setStoryFlag(s, st.flag);
  assert.equal(Logic.storyFlag(s, 'core.identity_restored'), true);
});
