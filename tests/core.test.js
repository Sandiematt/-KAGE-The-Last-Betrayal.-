'use strict';
// The Core: one stretch inside the Memory Core, then four echo fights the Core pulls out of Kage's journey (Hollow
// Raikon, Hollow Akari, Hollow Takashi, Hollow Rem last), then the Witness. The echoes are corrupted, Hollow-styled
// copies fighting with reduced or warped versions of the originals' moves, and they drop gems, never gear.
// Driven through Logic's public functions only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, ENEMIES, SCENES } = loadLogic();
const ECHOES = ['core.echo1', 'core.echo2', 'core.echo3', 'core.echo4'];
const echoEnemy = (stageId) => Logic.stageConfig(Logic.defaultSave(), stageId).enemyId;
const win = (stageId, o) => Object.assign({ mode: 'campaign', stageId, enemyId: echoEnemy(stageId), win: true, ng: 0, hpLeft: 0.2, time: 90, maxCombo: 1, parries: 0, flawless: false }, o);
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };

/* ---------------- order and flow ---------------- */

test('the Core runs its stretch, then the four echoes in order, then the Witness', () => {
  assert.deepEqual(Logic.chapter('core').stages.map(s => `${s.id}:${s.kind}`),
    ['core.stretch1:stretch', 'core.echo1:echo', 'core.echo2:echo', 'core.echo3:echo', 'core.echo4:echo', 'core.witness:boss']);
  assert.deepEqual(ECHOES.map(id => Logic.stageConfig(Logic.defaultSave(), id).foeName), ['Hollow Raikon', 'Hollow Akari', 'Hollow Takashi', 'Hollow Rem']);
});

test('each echo opens only after the one before it, and the Witness only after Hollow Rem', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'core.stretch1');
  assert.equal(Logic.isStageUnlocked(s, 'core.stretch1'), true);
  assert.equal(Logic.isStageUnlocked(s, 'core.echo1'), false, 'the stretch comes first');
  Logic.completeStage(s, 'core.stretch1');
  for (const [i, id] of ECHOES.entries()) {
    assert.equal(Logic.isStageUnlocked(s, id), true, id);
    if (ECHOES[i + 1]) assert.equal(Logic.isStageUnlocked(s, ECHOES[i + 1]), false, `${ECHOES[i + 1]} waits for ${id}`);
    assert.equal(Logic.isStageUnlocked(s, 'core.witness'), false, `the Witness waits (at ${id})`);
    assert.equal(Logic.applyFightResult(s, win(id)).firstClear, true);
  }
  assert.equal(Logic.isStageUnlocked(s, 'core.witness'), true, 'beating Hollow Rem opens the Witness');
  assert.equal(Logic.nextStage(s), 'core.witness');
});

/* ---------------- rewards: gems, never gear ---------------- */

test('every echo grants gems on its first clear and no gear, ever', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'core.echo1');
  for (const id of ECHOES) {
    const owned = JSON.stringify(s.owned), gems = s.gems;
    const out = Logic.applyFightResult(s, win(id));
    assert.equal(out.gems, 5, `${id}: 2 first-clear gems plus the echo's 3`);
    assert.equal(s.gems, gems + 5, `${id} pays them into the save once`);
    assert.deepEqual(out.unlocks.filter(u => ['weapons', 'helmets', 'armors'].includes(u.kind)), [], `${id} unlocks no gear`);
    assert.equal(JSON.stringify(s.owned), owned, `${id} grants no gear`);
  }
});

test('the echo gems are a first-clear reward; the stage card shows them', () => {
  const s = Logic.defaultSave();
  clearUpTo(Logic, s, 'core.echo2');
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'core.echo2') }, { coins: 430, gems: 5 });
  Logic.applyFightResult(s, win('core.echo2'));
  assert.deepEqual({ ...Logic.stageRewardPreview(s, 'core.echo2') }, { coins: 215, gems: 0 });
  const again = Logic.applyFightResult(s, win('core.echo2'));
  assert.equal(again.gems, 0, 'a replay pays no echo gems');
});

test('no echo stage lists any gear in its reward', () => {
  for (const id of ECHOES) {
    const r = Logic.stage(id).reward || {};
    assert.ok(r.gems > 0, `${id} rewards gems`);
    for (const kind of ['weapons', 'helmets', 'armors']) assert.equal((r[kind] || []).length, 0, `${id} ${kind}`);
  }
});

/* ---------------- the echoes ---------------- */

const ORIGINAL = { 'core.echo1': 'raikon', 'core.echo2': 'akari', 'core.echo3': 'takashi' };

test('each echo is a Hollow: violet, glitching, dissolving into ash, and not the placeholder rig', () => {
  for (const id of ECHOES) {
    const e = echoEnemy(id), d = ENEMIES[e];
    assert.ok(d, `${id} -> ${e}`);
    assert.notEqual(e, 'echo_sentinel', `${id} is no longer the placeholder rig`);
    assert.equal(d.family, 'hollow', `${e} is drawn in the Hollow style`);
    assert.equal(d.type, 'sub');
    assert.equal(d.defeat, 'finisher', `${e} comes apart into memory ash`);
    assert.ok(d.taunt && d.defeatLine && d.tip, `${e} has its lines`);
  }
});

test('each echo keeps its original\'s silhouette: the same helmet and armour drawing, a corrupted copy of the blade', () => {
  for (const [stage, orig] of Object.entries(ORIGINAL)) {
    const d = ENEMIES[echoEnemy(stage)], o = ENEMIES[orig];
    assert.equal(d.helmet, o.helmet, `${d.id} helmet`);
    assert.equal(d.armor, o.armor, `${d.id} armour`);
    assert.notEqual(d.weapon, o.weapon, `${d.id} carries a corrupted copy, not the original blade`);
    assert.equal(d.echoOf, orig, `${d.id} names its original`);
  }
});

test('every echo fights in the single-bar boss format with one or two phases', () => {
  for (const id of ECHOES) {
    const cfg = Logic.stageConfig(Logic.defaultSave(), id);
    assert.equal(cfg.format.name, 'boss', id);
    assert.equal(cfg.format.roundsToWin, 1);
    assert.equal(cfg.format.timer, 0);
    const n = Logic.bossPhases(cfg.enemyId).length;
    assert.ok(n >= 1 && n <= 2, `${cfg.enemyId} has ${n} phases`);
    assert.equal(cfg.format.phases, n);
  }
});

test('each echo fights with corrupted versions of its original\'s own moves, violet and glitching', () => {
  const expect = { 'core.echo1': ['stormBreak', 'thunderSwing'], 'core.echo2': ['falseOpening', 'smokeStep', 'twinFang'], 'core.echo3': ['earthCleave', 'guardReturn'] };
  for (const [stage, bases] of Object.entries(expect)) {
    const e = echoEnemy(stage), moves = Logic.bossAbilities(e).map(a => Logic.echoMove(a)).filter(Boolean);
    const got = [...new Set(moves.map(m => m.base))].filter(b => b !== 'finalFlow').sort();
    assert.deepEqual(got, bases, `${e} borrows ${bases.join(', ')}`);
    for (const m of moves) {
      assert.equal(m.of, ORIGINAL[stage], `${m.id} comes from ${ORIGINAL[stage]}'s kit`);
      assert.equal(m.corrupt, true);
      assert.equal(m.glitch, 1, `${m.id} glitches`);
      assert.match(m.tint, /^#/, `${m.id} is tinted violet`);
      assert.ok(m.label, `${m.id} has a call-out`);
    }
  }
  assert.equal(Logic.echoMove('thunderSwing'), null, 'the originals\' own moves are not echoes');
});

test('Hollow Raikon\'s Thunder Swing still sends a wave, but slower and lighter than Raikon\'s, never a second wave', () => {
  const moves = Logic.bossAbilities('hollow_raikon').map(a => Logic.echoMove(a));
  const ts = moves.find(m => m.base === 'thunderSwing');
  assert.notEqual(ts.wave, false, 'a corrupted wave runs along the floor');
  assert.ok(ts.windup > 0.66, 'Raikon winds Thunder Swing up for 0.66; the echo for longer');
  assert.ok(ts.dmg < 1);
  for (const p of Logic.bossPhases('hollow_raikon')) assert.ok(!p.secondWave, 'no second wave');
  const sb = moves.find(m => m.base === 'stormBreak');
  assert.ok(sb.windup > 0.58 && sb.dmg < 1);
  assert.ok(!moves.some(m => m.base === 'redlineCounter'), 'no Redline Counter');
});

test('Hollow Akari has Smoke Step, Twin Fang and a single False Opening, and no Blink or Petal Cross', () => {
  const moves = Logic.bossAbilities('hollow_akari').map(a => Logic.echoMove(a));
  const hit = x => Array.isArray(x) ? x[0] + x[1] : x || 0;
  for (const m of moves) {
    const a = Logic.akariMove(m.base);
    assert.ok(m.windup >= a.windup, `${m.id} winds up at least as long as hers`);
    assert.ok(hit(m.dmg) <= hit(a.dmg), `${m.id} hits no harder`);
  }
  const fo = moves.filter(m => m.base === 'falseOpening');
  assert.equal(fo.length, 1);
  assert.equal(fo[0].afterimages, 1, 'one afterimage');
  assert.ok(fo[0].cd >= 300, 'and only once a fight');
  assert.ok(!moves.some(m => ['blink', 'petalCross'].includes(m.base)));
});

test('Hollow Takashi has Earth Cleave, Guard Return and at most a short, broken Final Flow fragment', () => {
  const moves = Logic.bossAbilities('hollow_takashi').map(a => Logic.echoMove(a));
  for (const m of moves) {
    const t = Logic.takashiMove(m.base);
    assert.ok(m.windup >= t.windup, `${m.id} winds up at least as long as his`);
    assert.ok(m.dmg <= t.dmg, `${m.id} hits no harder`);
  }
  assert.equal(moves.find(m => m.base === 'guardReturn').unb, 0, 'its Guard Return cut can be blocked');
  const flow = moves.filter(m => m.base === 'finalFlow');
  assert.ok(flow.length <= 1);
  if (flow.length) {
    assert.ok(flow[0].cuts.length < Logic.finalFlow().cuts.length, 'only a fragment of the sequence');
    assert.equal(flow[0].cuts[flow[0].cuts.length - 1].finisher, true, 'still ending on one horizontal cut');
    assert.equal(flow[0].el, 'void', 'violet, not gold');
    assert.ok(!Logic.bossPhases('hollow_takashi')[0].abilities.includes(flow[0].id), 'not in the opening phase');
  }
});

test('Hollow Rem runs Rem\'s fast, flowing family form from the Interlude, grown up and corrupted', () => {
  const d = ENEMIES[echoEnemy('core.echo4')];
  assert.equal(d.id, 'hollow_rem');
  assert.equal(d.form, 'rem', 'the rem style of the family form');
  assert.equal(ENEMIES.young_rem.form, d.form, 'the same style young Rem sparred with');
  assert.ok(Logic.familyForm(d.form).tempo < Logic.familyForm('kage').tempo, 'faster than Kage');
  assert.ok(d.build.scale > ENEMIES.young_rem.build.scale, 'an adult build, not the boy from the yard');
  assert.equal(d.armor, 'travel_coat', 'a worn travel coat');
  assert.match(d.sash, /^#/, 'with his purple accent');
  assert.notEqual(d.weapon, 'bokken');
});

test('the Core\'s scenes exist: the stretch opening, and Hollow Rem\'s defeat hinting that the real Rem is near', () => {
  assert.ok(SCENES[Logic.stageScene('core.stretch1', 'before')], 'the Core opening scene');
  const voices = SCENES['core.stretch1.before'].steps.filter(s => s.say && s.say !== 'kage' && s.say !== 'narrator');
  assert.ok(voices.length >= 2, 'familiar voices bleed through');
  const def = SCENES[Logic.stageScene('core.echo4', 'defeat')];
  assert.ok(def, 'Hollow Rem has a defeat scene');
  assert.ok(def.steps.some(s => /\bRem\b|brother/.test(s.text || '')), 'it points at the real Rem');
  for (const id of ECHOES) for (const hook of ['before', 'after', 'defeat']) {
    const sid = Logic.stageScene(id, hook);
    if (sid) assert.ok(SCENES[sid], `${id} ${hook} -> ${sid}`);
  }
});

test('the Core stretch is Hollows only, the hardest Hollow mix in the game, in the Core environment', () => {
  const st = Logic.stretch('core.stretch1');
  assert.equal(st.env, 'core');
  const foes = st.encounters.flatMap(e => e.waves.flat());
  for (const id of foes) assert.equal(ENEMIES[id].family, 'hollow', id);
  assert.ok(foes.filter(id => id === 'hollow_husk').length >= 5, 'heavy on Husks');
  assert.ok(Math.max(...st.encounters.flatMap(e => e.waves.map(w => w.length))) >= 5, 'a wave of five');
  for (const stage of Logic.stages().filter(s => s.kind === 'stretch' && s.id !== 'core.stretch1')) {
    const h = Logic.stretch(stage.id).encounters.flatMap(e => e.waves.flat()).filter(id => ENEMIES[id].family === 'hollow').length;
    assert.ok(h < foes.length, `more Hollows than ${stage.id}`);
  }
});
