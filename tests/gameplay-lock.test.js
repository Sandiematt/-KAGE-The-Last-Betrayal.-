'use strict';
// The gameplay lock for the anime redesign (ticket 01). Seven scripted, seeded fights (Kage against an Order cutter, a
// Hollow, Garan and each main boss) are stepped through the real simulation and compared, frame by frame, with
// tests/snapshots/gameplay-lock.json: fighter states, moves, skeleton joints, hitboxes and hurtboxes, hp, rage, guard,
// i-frames, hit and stun timers, the camera and the screen shake / hit-stop / slow motion, plus every damage, parry,
// clash, grab, dodge, KO, boss-phase, move and ability event. Nothing is drawn, so the redesign's art changes cannot
// touch it; any change to combat, timing, damage, hitboxes, AI, camera or feel makes it fail.
//
// Regenerate ONLY for an intended gameplay change:  UPDATE_SNAPSHOT=1 node --test tests/gameplay-lock.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { FIGHTS, runFight, toSnapshot, fromSnapshot, SAMPLE_EVERY } = require('./helpers/gameplay-lock');

const SNAP = path.join(__dirname, 'snapshots', 'gameplay-lock.json');
const UPDATE = process.env.UPDATE_SNAPSHOT === '1';

const results = {};
const recording = id => results[id] || (results[id] = runFight(FIGHTS.find(f => f.id === id)));

// the first field paths where two recorded frames differ
function diffPaths(a, b, at, out) {
  if (out.length >= 12) return out;
  if (a === b) return out;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) { out.push(`${at}: expected ${JSON.stringify(a)}, got ${JSON.stringify(b)}`); return out; }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diffPaths(a[k], b[k], `${at}.${k}`, out);
  return out;
}

if (UPDATE) {
  test('gameplay lock: snapshot regenerated', () => {
    const all = {};
    for (const f of FIGHTS) all[f.id] = recording(f.id);
    fs.mkdirSync(path.dirname(SNAP), { recursive: true });
    fs.writeFileSync(SNAP, JSON.stringify(toSnapshot(all), null, 1) + '\n');
  });
} else {
  const snap = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, 'utf8')) : null;
  for (const spec of FIGHTS) {
    test(`gameplay lock: Kage vs ${spec.id} plays out exactly as recorded`, () => {
      assert.ok(snap && snap.fights[spec.id], `no snapshot for ${spec.id}: run UPDATE_SNAPSHOT=1 node --test tests/gameplay-lock.test.js`);
      const want = fromSnapshot(snap.fights[spec.id]), got = recording(spec.id);
      const events = got.events.map(e => JSON.stringify(e));
      const ev = want.events.findIndex((e, i) => e !== events[i]);
      const fr = want.frames.findIndex((h, i) => h !== got.frames[i]);
      if (fr < 0 && ev < 0 && want.frames.length === got.frames.length && want.events.length === events.length) return;
      const msg = [`Gameplay changed in the ${spec.id} fight. If this was intended, regenerate the snapshot (see the test header).`];
      if (fr >= 0) {
        msg.push(`First differing frame: ${fr} (${(fr / 60).toFixed(2)} s).`);
        const sf = Math.ceil(fr / SAMPLE_EVERY) * SAMPLE_EVERY;
        if (want.samples[sf] && got.samples[sf]) msg.push(`At sample frame ${sf}:`, ...diffPaths(want.samples[sf], got.samples[sf], 'frame', []));
      }
      if (ev >= 0 || want.events.length !== events.length) {
        const i = ev >= 0 ? ev : Math.min(want.events.length, events.length);
        msg.push(`First differing event #${i}:`, `  expected ${want.events[i] || '(none)'}`, `  got      ${events[i] || '(none)'}`);
      }
      assert.fail(msg.join('\n'));
    });
  }
}

// The lock only guards what the script exercises: hold the script to the full move set, so a later tweak to the pilot
// cannot quietly shrink what is locked.
test('gameplay lock: the script exercises Kage\'s whole kit and every foe\'s answers', () => {
  const seen = new Set(), perFight = {};
  for (const spec of FIGHTS) {
    const r = recording(spec.id), mine = perFight[spec.id] = new Set();
    for (const e of r.events) {
      const k = e.type === 'move' && e.who === 'kage' ? `kage:${e.move}` : e.type === 'dmg' ? (e.att === 'kage' ? 'kage hits' : e.def === 'kage' ? 'kage is hit' : 'other dmg') : e.type === 'parry' ? `parry by ${e.def === 'kage' ? 'kage' : 'foe'}` : e.type;
      seen.add(k); mine.add(k);
    }
  }
  // punch string, the katana chain (k1-k3) and its air slash (ka), tap and charged kicks, dash punch and slide,
  // air punch and kick, grab, kunai, the rage special, and guard into a perfect parry (blade clashes have their own
  // deterministic test in combat-dir.test.js: two cuts meeting depends on frame-exact timing against a live AI)
  for (const k of ['kage:p1', 'kage:p2', 'kage:p3', 'kage:k1', 'kage:k2', 'kage:k3', 'kage:ka', 'kage:rk', 'kage:hk', 'kage:dp', 'kage:slide',
    'kage:ap', 'kage:ak', 'kage:grab', 'kage:kunai', 'special', 'parry by kage', 'grab', 'dodge', 'ko', 'phase', 'ability',
    // the directional sword arcs (11-sword-arcs.js) and a foe's spam punish (SPAM_READ)
    'kage:k2_up', 'kage:k1_down', 'kage:k3_fwd', 'kage:k1_diagDown', 'kage:k2_diagUp', 'kage:kc_dash', 'kage:ka_airDown', 'punish'])
    assert.ok(seen.has(k), `the scripted fights never produce "${k}"`);
  for (const spec of FIGHTS) {
    assert.ok(perFight[spec.id].has('kage hits'), `Kage never lands a blow on ${spec.id}`);
    assert.ok(perFight[spec.id].has('kage is hit'), `${spec.id} never lands a blow on Kage`);
    if (spec.stage && /boss|sub/.test(spec.stage)) assert.ok(perFight[spec.id].has('ability') && perFight[spec.id].has('phase'), `${spec.id} never uses an ability or changes phase`);
  }
});

test('gameplay lock: a recording is deterministic and blind to the cloth simulation', () => {
  const spec = FIGHTS.find(f => f.id === 'raikon');
  const again = runFight(spec, { frames: 900 });
  assert.deepEqual(again.frames, recording('raikon').frames.slice(0, 900));
  // cloth (scarves, cloaks, sashes, hair) is art; the redesign may restyle it freely
  const noCloth = runFight(spec, { frames: 900, patch(S) { S.Fighter.prototype.updateCloth = function () {}; } });
  assert.deepEqual(noCloth.frames, again.frames);
});
