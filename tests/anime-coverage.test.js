// Zero stickman (anime redesign, ticket 13): every character the game can draw resolves to the anime art, and no
// primitive / stickman fallback path is left to reach.
//
// What is guarded, and how a new piece of content without an anime look fails here:
// - every fighter def in ENEMIES (regulars, sub-bosses, bosses, the Core's echoes, Rem's versions) has its own anime
//   skin (ANIME_SKINS by id or echoOf), never the shared fallback skin; the player and young Kage have theirs
// - every fighter is drawn, in idle, hurt and death, as cel-shaded parts (celFill's clipped even-odd shade strips, which
//   no primitive shape ever draws), with the black face fill and the white eye fill
// - every helmet and armour look (each HELMETS / ARMORS item's look, and each look a def wears) reaches a drawing in
//   drawHelmet / drawArmor made of cel-shaded parts, or of detail clipped onto the anime torso (both clip; the old
//   primitive overlays never did): a look key with no case draws nothing and fails
// - every weapon a fighter can hold (the equippable ones and each def's) draws coloured steel in the hand on the normal
//   pass; "no weapon" shapes are only bare hands and the gauntlet art of the iron fists
// - the flat passes (impact frame, flash, afterimages, Hollow glitch ghost) are exactly one colour for every fighter,
//   every gear look and every weapon
// - the story cast: every speaker bust and illustration figure that has an in-game design is the live fighter (no
//   code-drawn fallback), and the code-drawn civilians still get a black face and white eyes
// - the deleted primitive drawing code (torso blob tables, ball heads, legacy helmet cases) stays deleted
// Drawing only: these tests draw into a recording context (tests/helpers/record-ctx.js) and never step a fight.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadSim, jsFiles } = require('./helpers/load-sim');
const { recordCtx } = require('./helpers/record-ctx');

const errors = [];
const G = loadSim({
  exports: ['ANIME_SKINS', 'animeSkin', 'ANIME', 'HELMETS', 'ARMORS', 'SHAPE', 'ENEMY_FAMILIES', 'gearLook', 'BODY',
    'makeFighterFromEnemy', 'makePlayerFighter', 'makeYoungKage', 'poseFighter', 'drawHelmet', 'drawArmor', 'drawWeaponShape', 'twinShape',
    'STORY_CAST', 'storyFighter', 'SPEAKERS', 'ILLUSTRATIONS'],
  console: { log() {}, warn() {}, info() {}, error: (...a) => errors.push(a.map(String).join(' ')) }
});
const SRC = path.join(__dirname, '..', 'src', 'js');
const FLAT = '#ff00ff';
const INK_OPT = { rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 } };
const save = G.Logic.defaultSave();
const kage = (o) => G.makePlayerFighter(save, Object.assign({}, o || {}));
const enemy = (id) => G.makeFighterFromEnemy(id, { facing: 1 });

function settle(f, state) {
  G.poseFighter(f, null, 8);
  if (state && state !== 'idle') {
    f.state = state; f.alive = state !== 'dead';
    for (let i = 0; i < 40; i++) { f.updatePose(G.STEP); f.computeSkeleton(); f.updateCloth(G.STEP); f.time += G.STEP; }
  }
  return f;
}
function draw(f, opt) { const c = recordCtx(); f.draw(c, opt || INK_OPT); return c.log; }
const colors = (log) => new Set(log.ops.filter(o => o.op !== 'image').map(o => o.color));
// the fighters the game can build: every def, the player (default kit), young Kage, adult Rem (story), Hollow Kage
// holding the player's own blade (the Witness's copies)
function everyFighter() {
  const list = Object.keys(G.ENEMIES).map(id => [id, () => enemy(id)]);
  list.push(['player (Kage)', () => kage()], ['young Kage', () => G.makeYoungKage({})], ['adult Rem (story)', () => G.STORY_CAST.rem({ facing: 1 })],
    ['hollow_kage with Kage\'s blade', () => G.makeFighterFromEnemy('hollow_kage', { weapon: 'kagetsu' })]);
  return list;
}
// the looks a def or an equippable item resolves to, with a fighter that wears each
function looks(kind) {
  const table = kind === 'helmets' ? G.HELMETS : G.ARMORS, field = kind === 'helmets' ? 'helmet' : 'armor', out = new Map();
  for (const id of Object.keys(table)) { const k = G.gearLook(kind, id); if (!out.has(k)) out.set(k, () => kage({ [field]: id })); }
  for (const id of Object.keys(G.ENEMIES)) { const k = G.gearLook(kind, G.ENEMIES[id][field]); if (!out.has(k)) out.set(k, () => enemy(id)); }
  return out;
}

/* ---------------- fighter defs ---------------- */
test('every fighter def has its own anime design (no def falls back to the shared base skin)', () => {
  assert.ok(Object.keys(G.ENEMIES).length >= 35);
  for (const id of Object.keys(G.ENEMIES)) {
    const d = G.ENEMIES[id], skin = G.animeSkin(enemy(id));
    assert.notEqual(skin, G.ANIME_SKINS.base, `${id} has no ANIME_SKINS entry (by id or echoOf): it would draw as the generic body`);
    assert.ok(G.ANIME_SKINS[id] || (d.echoOf && G.ANIME_SKINS[d.echoOf]), id);
  }
  assert.equal(G.animeSkin(kage()), G.ANIME_SKINS.kage);
  assert.equal(G.animeSkin(G.makeYoungKage({})), G.ANIME_SKINS.youngKage);
});

test('every fighter is drawn as cel-shaded anime parts with a black face and white eyes, idle, hurt and dead', () => {
  for (const [label, make] of everyFighter()) {
    for (const state of ['idle', 'hit', 'dead']) {
      const log = draw(settle(make(), state)), cs = colors(log);
      assert.ok(log.evenodd >= 25, `${label} (${state}): only ${log.evenodd} cel-shaded parts`);
      assert.ok(cs.has(G.ANIME.face), `${label} (${state}): no black face fill`);
      assert.ok(cs.has(G.ANIME.eye) || cs.has('#ffffff'), `${label} (${state}): no white eyes`);
    }
  }
});

test('the flat passes are a single clean colour for every fighter', () => {
  for (const [label, make] of everyFighter()) {
    for (const state of ['idle', 'hit']) {
      const bad = [...colors(draw(settle(make(), state), { color: FLAT }))].filter(c => c !== FLAT);
      assert.deepEqual(bad, [], `${label} (${state}): the flat pass leaks ${bad.join(', ')}`);
    }
  }
});

/* ---------------- gear looks ---------------- */
// Looks that draw no cel-shaded part of their own, and why. Anything else must.
const NO_PARTS = {
  armor: {
    training: 'the Interlude\'s plain training clothes: the anime gi and obi are the whole look',
    tachibana: 'Kage\'s default shoulder guard: three dark-metal lames in ANIME tokens (checked below)'
  }
};
test('every helmet look reaches cel-shaded anime art (equippable items and every look a def wears)', () => {
  const L = looks('helmets');
  assert.ok(L.size >= 25);
  for (const [key, make] of L) {
    const f = settle(make()); draw(f);   // sets up the draw state the parts share
    const c = recordCtx(), hr = G.BODY.head * f.scale * f.build.head;
    G.drawHelmet(c, key, hr, '#141518', {}, f);
    assert.ok(c.log.clips >= 1, `helmet look '${key}' draws no cel-shaded part (missing or primitive drawHelmet case)`);
    draw(f, { color: FLAT });   // the parts read the pass (flat or not) from the shared draw state
    const fc = recordCtx(); G.drawHelmet(fc, key, hr, FLAT, { color: FLAT }, f);
    assert.ok(fc.log.ops.length > 0, `helmet look '${key}' draws nothing on the flat pass`);
    assert.deepEqual([...colors(fc.log)].filter(x => x !== FLAT), [], `helmet look '${key}' leaks colour into the flat pass`);
  }
});

test('every armour look reaches cel-shaded anime art (equippable items and every look a def wears)', () => {
  const L = looks('armors');
  assert.ok(L.size >= 25);
  for (const [key, make] of L) {
    const f = settle(make()); draw(f);
    const c = recordCtx();
    G.drawArmor(c, f, '#141518', {}, 10);
    if (NO_PARTS.armor[key]) {
      if (key === 'tachibana') for (const t of [G.ANIME.metal0, G.ANIME.metal1, G.ANIME.crimson]) assert.ok(colors(c.log).has(t), `tachibana lacks ${t}`);
      continue;
    }
    assert.ok(c.log.clips >= 1, `armour look '${key}' draws no cel-shaded part (missing or primitive drawArmor case)`);
    draw(f, { color: FLAT });
    const fc = recordCtx(); G.drawArmor(fc, f, FLAT, { color: FLAT }, 10);
    assert.deepEqual([...colors(fc.log)].filter(x => x !== FLAT), [], `armour look '${key}' leaks colour into the flat pass`);
  }
  for (const k of Object.keys(NO_PARTS.armor)) assert.ok(L.has(k), `NO_PARTS lists '${k}', which nothing wears any more`);
});

test('Kage wearing each helmet and each armour is still the anime body: face, eyes, parts, clean flat pass', () => {
  for (const [field, table] of [['helmet', G.HELMETS], ['armor', G.ARMORS]]) {
    for (const id of Object.keys(table)) {
      const f = settle(kage({ [field]: id })), log = draw(f), cs = colors(log);
      assert.ok(log.evenodd >= 25 && cs.has(G.ANIME.face) && (cs.has(G.ANIME.eye) || cs.has('#ffffff')), `${field} ${id}`);
      const bad = [...colors(draw(f, { color: FLAT }))].filter(c => c !== FLAT);
      assert.deepEqual(bad, [], `${field} ${id}: the flat pass leaks ${bad.join(', ')}`);
    }
  }
});

/* ---------------- weapons ---------------- */
function heldWeapons() {
  const ids = new Set(Object.keys(G.WEAPONS).filter(id => !G.WEAPONS[id].enemy));
  for (const d of Object.values(G.ENEMIES)) ids.add(d.weapon);
  return [...ids];
}
test('every weapon a fighter can hold is drawn in the hand: coloured steel on the normal pass, one colour on the flat pass', () => {
  const wielder = (id) => { const d = Object.keys(G.ENEMIES).find(k => G.ENEMIES[k].weapon === id); return d ? enemy(d) : kage({ weapon: id, wlvl: 1 }); };
  for (const id of heldWeapons()) {
    const f = settle(wielder(id)), sh = f.shape();
    if (sh === 'none') {
      assert.ok(id === 'fists' || id === 'iron_fists', `weapon '${id}' has no drawn shape (only bare hands and the iron fists may)`);
      if (id === 'iron_fists') { draw(f); const c = recordCtx(); f.drawFistGear(c); assert.ok(c.log.evenodd >= 1, 'the iron fists draw no gauntlet art'); }
      continue;
    }
    draw(f);
    const ink = recordCtx(); G.drawWeaponShape(ink, G.twinShape(f.weapon(), sh, 0), f.weaponLen(), 'ink', f.scale, '#030303', f);
    const steel = [...colors(ink.log)].filter(c => c !== '#030303');
    assert.ok(steel.length >= 1, `weapon '${id}' (${sh}) draws no coloured steel`);
    const flat = recordCtx(); G.drawWeaponShape(flat, G.twinShape(f.weapon(), sh, 0), f.weaponLen(), 'flat', f.scale, FLAT, f);
    assert.ok(flat.log.ops.length > 0, `weapon '${id}' draws nothing on the flat pass`);
    assert.deepEqual([...colors(flat.log)].filter(c => c !== FLAT), [], `weapon '${id}' leaks colour into the flat pass`);
    // and in the hand on the whole-fighter draw, flat pass included
    const bad = [...colors(draw(f, { color: FLAT }))].filter(c => c !== FLAT);
    assert.deepEqual(bad, [], `weapon '${id}' in the hand: the flat pass leaks ${bad.join(', ')}`);
  }
});

/* ---------------- story figures ---------------- */
test('every story bust and illustration figure with an in-game design is the live anime fighter', () => {
  const src = fs.readFileSync(path.join(SRC, '52-story-art.js'), 'utf8');
  const used = new Set([...src.matchAll(/story(?:Figure|FighterBust)\(g, '([a-z_]+)'/g)].map(m => m[1]));
  assert.ok(used.size >= 6, 'story figure calls found');
  for (const id of used) assert.ok(G.STORY_CAST[id], `story art draws '${id}', which has no live fighter in STORY_CAST (it would fall back to a code-drawn stand-in)`);
  for (const id of Object.keys(G.STORY_CAST)) {
    const f = G.storyFighter(id, { pose: 'rest' });
    assert.ok(f, `STORY_CAST.${id} builds no fighter`);
    const log = draw(f), cs = colors(log);
    assert.ok(log.evenodd >= 25 && cs.has(G.ANIME.face), `story ${id} is not drawn as the anime fighter`);
  }
});

test('every speaker portrait and illustration paints without falling back; code-drawn civilians keep black faces and white eyes', () => {
  errors.length = 0;
  const CIVILIANS = ['survivor', 'resident'], NO_FIGURE = ['narrator', 'recording'];
  for (const [id, sp] of Object.entries(G.SPEAKERS)) {
    const c = recordCtx(); sp.portrait(c);
    if (NO_FIGURE.includes(id)) continue;
    const cs = colors(c.log);
    if (CIVILIANS.includes(id)) {
      assert.ok(cs.has(G.ANIME.face), `${id}: no black face`);
      assert.ok([...cs].some(x => x === G.ANIME.eye || x === '#e6dcff'), `${id}: no white eyes`);
    } else assert.ok(c.log.evenodd >= 10, `speaker ${id} fell back to the code-drawn bust`);
  }
  assert.deepEqual(Object.keys(G.SPEAKERS).filter(id => !CIVILIANS.includes(id) && !NO_FIGURE.includes(id)).filter(id => !['kage', 'rem', 'rem_adult', 'takashi', 'raikon', 'akari', 'witness', 'order'].includes(id)), [],
    'a new speaker: give it a live fighter bust (or list it as a civilian with a code-drawn anime bust)');
  for (const [id, il] of Object.entries(G.ILLUSTRATIONS)) { const c = recordCtx(); il.paint(c); assert.ok(c.log.ops.length > 0, id); }
  assert.deepEqual(errors, [], 'story art logged a figure error (a figure fell back)');
});

/* ---------------- the old primitive art stays deleted ---------------- */
test('the deleted primitive drawing code does not come back', () => {
  const all = jsFiles().map(f => [f, fs.readFileSync(path.join(SRC, f), 'utf8')]);
  const banned = [/\btorsoShape\b/, /\bTORSO_(FRONT|BACK)\b/, /'reaper_cowl'/, /'ashen_crown'/, /case 'colossus':/, /\bdrawDetails\b/];
  for (const [f, s] of all) for (const re of banned) assert.ok(!re.test(s), `${f} brings back ${re}`);
  const fighter = all.find(([f]) => f === '20-fighter.js')[1];
  for (const fn of ['drawHelmet', 'drawArmor']) {
    const body = fighter.slice(fighter.indexOf(`function ${fn}(`), fighter.indexOf('\n}\n', fighter.indexOf(`function ${fn}(`)));
    assert.ok(body.length > 100 && !/\bdefault:/.test(body), `${fn} must not grow a default (fallback) case`);
  }
});
