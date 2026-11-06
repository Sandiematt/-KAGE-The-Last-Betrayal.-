'use strict';
// The Epilogue, The Last Choice (SAN-44): the story's last scene, no combat, and the post-story unlocks it grants.
// Driven through Logic's public functions and the pure data tables only.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource } = require('./helpers/load-logic');

const { Logic, WEAPONS, MOVES } = loadLogic();
const clearUpTo = (L, save, id) => { for (const st of L.stages()) { if (st.id === id) break; L.completeStage(save, st.id); } };
const POST_STORY = [['weapons', 'mugen_no_ha'], ['armors', 'kysmei_robe'], ['armors', 'kurokumo_yoroi']];
const steps = () => Logic.scene(Logic.stageScene('epilogue', 'before')).steps;
const lines = () => steps().filter(s => 'say' in s);
const ART = new Function(`'use strict';\n${moduleSource('52-story-art.js')}\nreturn { SPEAKERS, ILLUSTRATIONS };`)();

/* ---------------- no combat ---------------- */

test('the Epilogue is the last stage, a story scene with no combat stage and no fight', () => {
  const ep = Logic.chapter('epilogue').stages;
  assert.deepEqual(ep.map(s => s.kind), ['scene']);
  assert.equal(Logic.isCombatStage('epilogue'), false);
  assert.equal(Logic.stage('epilogue').enemy, undefined, 'no foe');
  assert.equal(Logic.stages()[Logic.stages().length - 1].id, 'epilogue');
  assert.notEqual(Logic.stageScene('epilogue', 'before'), 'epilogue.stub', 'the stub is gone');
  assert.ok(!steps().some(s => 'video' in s));
});

/* ---------------- the scene ---------------- */

test('Rem appears in the opened Core, older, and confirms why he erased Kage\'s memories', () => {
  const s = steps();
  const core = s.findIndex(x => x.illus === 'epilogue_core');
  assert.ok(core >= 0, 'the opened Core illustration');
  const rem = lines().filter(l => l.say === 'rem_adult');
  assert.ok(rem.length >= 4, 'adult Rem speaks');
  assert.ok(rem.some(l => /erased your memories/i.test(l.text)), 'he erased Kage\'s memories');
  assert.ok(rem.some(l => /permanent controller/i.test(l.text)), '...to stop Takashi making Kage the permanent controller');
  assert.ok(rem.some(l => /sealed/i.test(l.text)), 'he stayed to keep the Core sealed');
});

test('the beats come in story order: handoff, choice, collapse, transmission, who won, the swords, the walk, the end card', () => {
  const s = steps(), at = pred => s.findIndex(pred);
  const order = [
    at(x => x.illus === 'epilogue_core'),
    at(x => x.illus === 'epilogue_handoff'),
    at(x => x.flag === 'epilogue.shinsen_returned'),
    at(x => x.say === 'kage' && /identity/i.test(x.text)),
    at(x => x.illus === 'epilogue_collapse'),
    at(x => x.text === 'Memories may fade... but the choices you make will always remain.'),
    at(x => x.text === 'So... who won?'),
    at(x => x.illus === 'epilogue_swords'),
    at(x => x.illus === 'epilogue_dawn'),
    at(x => x.card === 'Brothers until the end.')
  ];
  for (const i of order) assert.ok(i >= 0, `missing beat (${order.join(', ')})`);
  for (let i = 1; i < order.length; i++) assert.ok(order[i] > order[i - 1], `beat ${i} out of order (${order.join(', ')})`);
});

test('Kage hands Shinsen to Rem', () => {
  const s = steps(), h = s.findIndex(x => x.illus === 'epilogue_handoff');
  assert.ok(s.slice(h).some(x => x.say === 'kage' && /Shinsen/.test(x.text)), 'Kage gives Shinsen');
  assert.ok(s.some(x => x.flag === 'epilogue.shinsen_returned'));
});

test('the choice: shutting down frees the memories and ends the reconstructions; they choose together', () => {
  const t = lines().map(l => l.text).join(' ');
  assert.match(t, /free/i); assert.match(t, /reconstruct/i);
  assert.ok(lines().some(l => l.say === 'kage' && /identity/i.test(l.text)), 'Kage uses his restored identity signature');
  assert.ok(lines().some(l => l.say === 'rem_adult' && /let go/i.test(l.text)), 'Rem lets go of the Core');
});

test('Takashi\'s final transmission, word for word, from the real Takashi', () => {
  const tx = lines().find(l => l.text === 'Memories may fade... but the choices you make will always remain.');
  assert.ok(tx, 'the transmission line');
  assert.equal(tx.say, 'takashi');
  assert.ok(lines().some(l => /alive/i.test(l.text)), 'the signal says he is alive');
});

test('the "who won?" exchange, word for word, in order', () => {
  const l = lines(), i = l.findIndex(x => x.text === 'So... who won?');
  assert.ok(i >= 0);
  assert.deepEqual(l.slice(i, i + 3).map(x => [x.say, x.text]),
    [['rem_adult', 'So... who won?'], ['kage', 'I did.'], ['rem_adult', 'Keep dreaming.']]);
});

test('it ends on two silhouettes walking into dawn and the end card "Brothers until the end."', () => {
  const s = steps(), last = s.filter(x => 'illus' in x && x.illus);
  assert.equal(last[last.length - 1].illus, 'end_card');
  assert.equal(last[last.length - 1].card, 'Brothers until the end.');
  assert.equal(last[last.length - 2].illus, 'epilogue_dawn');
});

test('the epilogue art and adult Rem exist and draw', () => {
  for (const id of ['epilogue_core', 'epilogue_handoff', 'epilogue_collapse', 'epilogue_swords', 'epilogue_dawn', 'end_card']) {
    assert.ok(ART.ILLUSTRATIONS[id], id);
    const calls = [];
    const g = new Proxy({}, { get(t, k) { if (k in t) return t[k]; return () => { calls.push(k); return { addColorStop() {}, width: 100 }; }; }, set(t, k, v) { t[k] = v; return true; } });
    ART.ILLUSTRATIONS[id].paint(g, { card: 'Brothers until the end.' });
    assert.ok(calls.length > 10, `${id} draws nothing`);
  }
  assert.equal(ART.SPEAKERS.rem_adult.name, 'Rem');
});

/* ---------------- the post-story unlocks ---------------- */

test('Mugen no Ha, the Kysmei Robe and the Kurokumo Yoroi are locked until the Epilogue is played', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'epilogue');
  assert.equal(Logic.nextStage(s), 'epilogue', 'everything else is cleared');
  for (const [kind, id] of POST_STORY) assert.equal(Logic.isLocked(s, kind, id), true, id);
});

test('finishing the Epilogue grants them exactly once', () => {
  const s = Logic.defaultSave(); clearUpTo(Logic, s, 'epilogue');
  const out = Logic.completeStage(s, 'epilogue');
  const gear = out.gear.map(g => `${g.kind}:${g.id}`).sort();
  assert.deepEqual(gear, POST_STORY.map(([k, id]) => `${k}:${id}`).sort());
  for (const [kind, id] of POST_STORY) assert.equal(s.owned[kind][id], 1, id);
  assert.equal(s.owned.armors.shinsei_yoroi, undefined, 'never in the first cycle');
  const again = Logic.completeStage(s, 'epilogue');
  assert.deepEqual(again.gear, [], 'a replay grants nothing');
  assert.ok(out.unlocks.some(u => u.kind === 'ng'), 'New Game+ opens');
});

test('Kurokumo Yoroi is given by Rem', () => {
  const a = Logic.gearTable('armors').kurokumo_yoroi;
  assert.match(a.lore, /Rem/);
  assert.match(Logic.lockHint('armors', 'kurokumo_yoroi'), /Epilogue|Last Choice/);
  assert.match(Logic.lockHint('weapons', 'mugen_no_ha'), /Epilogue|Last Choice/);
  assert.match(Logic.lockHint('armors', 'kysmei_robe'), /Epilogue|Last Choice/);
});

/* ---------------- Shinsei Yoroi: New Game+ only ---------------- */

test('the Shinsei Yoroi only drops from the Epilogue during New Game+', () => {
  const s = Logic.defaultSave();
  for (const st of Logic.stages()) Logic.completeStage(s, st.id);
  assert.equal(s.owned.armors.shinsei_yoroi, undefined, 'not in the first cycle, anywhere');
  assert.equal(Logic.isLocked(s, 'armors', 'shinsei_yoroi'), true);
  assert.match(Logic.lockHint('armors', 'shinsei_yoroi'), /New Game\+/);
  assert.equal(Logic.startNewGamePlus(s), true, 'New Game+ starts after the Epilogue');
  assert.equal(s.ng, 1);
  clearUpTo(Logic, s, 'epilogue');
  assert.equal(s.owned.armors.shinsei_yoroi, undefined, 'still not before the NG+ Epilogue');
  const out = Logic.completeStage(s, 'epilogue');
  assert.deepEqual(out.gear.map(g => ({ ...g })), [{ kind: 'armors', id: 'shinsei_yoroi' }], 'only the Shinsei Yoroi is new');
  assert.equal(s.owned.armors.shinsei_yoroi, 1);
  assert.deepEqual(Logic.completeStage(s, 'epilogue').gear, [], 'once');
});

test('no stage grants the Shinsei Yoroi outside an ngOnly reward', () => {
  const r = Logic.stages().filter(st => st.reward && (st.reward.armors || []).includes('shinsei_yoroi')).map(st => st.id);
  assert.deepEqual(r, ['epilogue']);
  assert.equal(Logic.gearTable('armors').shinsei_yoroi.ngOnly, true);
});

/* ---------------- Mugen no Ha: Echo Replication ---------------- */

test('Mugen no Ha\'s rage art is Echo Replication, not the Crescent Moon placeholder', () => {
  assert.equal(WEAPONS.mugen_no_ha.special, 'echoReplication');
  assert.equal(WEAPONS.mugen_no_ha.tier, 'boss');
  assert.match(WEAPONS.mugen_no_ha.desc, /Echo Replication/);
});

test('Echo Replication replays Kage\'s most recent landed string', () => {
  const log = [
    { id: 'k1', t: 0, hit: true }, { id: 'k2', t: 0.3, hit: true },             // an older landed string
    { id: 'p1', t: 3, hit: true }, { id: 'rk', t: 3.4, hit: true }, { id: 'k1', t: 3.8, hit: false },
    { id: 'k3', t: 7, hit: false }                                                // the newest string missed
  ];
  const art = Logic.echoArt(log, 'mugen_no_ha');
  assert.equal(art.echoed, true);
  assert.deepEqual(art.moves.map(m => m.id), ['p1', 'rk', 'k1']);
  assert.ok(art.moves[art.moves.length - 1].finisher, 'the last copied blow is the finisher');
  assert.ok(art.moves.every(m => m.dmgMul >= 1), 'the phantom strikes at least as hard as Kage');
  assert.ok(art.moves[art.moves.length - 1].dmgMul > art.moves[0].dmgMul);
});

test('Echo Replication copies grounded strikes only; with nothing landed it replays the blade\'s own string', () => {
  const air = Logic.echoArt([{ id: 'ka', t: 0, hit: true }, { id: 'k1', t: 0.3, hit: true }], 'mugen_no_ha');
  assert.deepEqual(air.moves.map(m => m.id), ['k1'], 'the air cut is dropped');
  for (const log of [[], null, [{ id: 'k1', t: 0, hit: false }], [{ id: 'ka', t: 0, hit: true }]]) {
    const art = Logic.echoArt(log, 'mugen_no_ha');
    assert.equal(art.echoed, false);
    assert.deepEqual(art.moves.map(m => m.id), WEAPONS.mugen_no_ha.moves);
  }
  for (const m of Logic.echoArt([], 'mugen_no_ha').moves) assert.ok(MOVES[m.id]);
});
