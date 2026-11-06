'use strict';
// The two regular enemy families: Order of Silence soldiers and Hollows, each in five unit types.
// Every enemy id the campaign, stretches, Echo Trials and boss minions name must exist.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic } = require('./helpers/load-logic');

const { Logic, ENEMIES, TRIALS, ENEMY_FAMILIES, UNIT_TYPES, AI_PROFILES } = loadLogic();

// the Prologue's gentle tutorial Shade (`tutorial`) is a copy of a unit, not a unit type of its own
const regulars = () => Object.values(ENEMIES).filter(d => d.type === 'regular' && !d.tutorial);
const stretchFoes = (stageId) => Logic.stretch(stageId).encounters.flatMap(e => e.waves.flat());
const familyOf = (id) => ENEMIES[id].family;

test('there are two families, Order of Silence and Hollows, and five unit types', () => {
  assert.deepEqual(Object.keys(ENEMY_FAMILIES), ['order', 'hollow']);
  assert.deepEqual(UNIT_TYPES, ['regular', 'agile', 'defensive', 'ranged', 'heavy']);
});

test('each family has exactly one unit of every type, ten regular enemies in all', () => {
  assert.equal(regulars().length, 10);
  for (const fam of ['order', 'hollow']) {
    const units = regulars().filter(d => d.family === fam).map(d => d.unit).sort();
    assert.deepEqual(units, ['agile', 'defensive', 'heavy', 'ranged', 'regular'], fam);
  }
});

test('every regular enemy names its family and unit type, and fights on that unit type\'s AI profile', () => {
  for (const d of regulars()) {
    assert.ok(ENEMY_FAMILIES[d.family], `${d.id} family ${d.family}`);
    assert.ok(UNIT_TYPES.includes(d.unit), `${d.id} unit ${d.unit}`);
    assert.ok(AI_PROFILES[d.ai], `${d.id} ai ${d.ai}`);
    assert.equal(d.ai, d.unit, `${d.id} reuses the ${d.unit} AI profile`);
  }
});

test('units are troops, not people: every name is the family name plus a unit name', () => {
  const prefix = { order: 'Order ', hollow: 'Hollow ' };
  for (const d of regulars()) {
    assert.ok(d.name.startsWith(prefix[d.family]), `${d.id} is called ${d.name}`);
    assert.equal(d.title, ENEMY_FAMILIES[d.family].title, `${d.id} title`);
  }
});

test('the placeholder grunts are gone', () => {
  for (const id of ['order_recruit', 'order_warden', 'hollow']) assert.equal(ENEMIES[id], undefined, id);
});

test('every enemy id that campaign, stretch, Echo Trials and minion data name exists', () => {
  const named = [];
  for (const st of Logic.stages()) {
    if (st.enemy) named.push([st.id, st.enemy]);
    if (st.kind === 'stretch') for (const id of stretchFoes(st.id)) named.push([`${st.id} stretch`, id]);
  }
  for (const u of TRIALS.pool) named.push(['trials', u.id]);
  named.push(['trials elite', TRIALS.eliteWave.lead]);
  for (const ch of Logic.chapters()) named.push([`${ch.id} minions`, Logic.minionId({ chapter: ch.id })]);
  named.push(['trials minions', Logic.minionId({ mode: 'trials' })]);
  for (const [where, id] of named) assert.ok(ENEMIES[id], `${where} -> ${id}`);
});

test('stretches only send regular Order soldiers and Hollows; Echo Trials waves are regular Hollows', () => {
  for (const st of Logic.stages().filter(s => s.kind === 'stretch'))
    for (const id of stretchFoes(st.id)) assert.equal(ENEMIES[id].type, 'regular', `${st.id} -> ${id}`);
  assert.equal(TRIALS.pool.length, 5);
  for (const u of TRIALS.pool) { assert.equal(ENEMIES[u.id].type, 'regular', u.id); assert.equal(familyOf(u.id), 'hollow', u.id); }
});

test('Order territory is held by the Order; the Prologue, the City of Echoes and the Core belong to the Hollows', () => {
  const share = (chapter, fam) => {
    const ids = Logic.chapter(chapter).stages.filter(s => s.kind === 'stretch').flatMap(s => stretchFoes(s.id));
    return ids.filter(id => familyOf(id) === fam).length / ids.length;
  };
  assert.equal(share('prologue', 'hollow'), 1);
  assert.ok(share('act1', 'order') > 0.6, `act1 order share ${share('act1', 'order')}`);
  assert.ok(share('act2', 'hollow') > 0.6, `act2 hollow share ${share('act2', 'hollow')}`);
  assert.equal(share('core', 'hollow'), 1);
});

test('every unit type is placed somewhere in the campaign stretches', () => {
  const used = new Set(Logic.stages().filter(s => s.kind === 'stretch').flatMap(s => stretchFoes(s.id)));
  for (const d of regulars()) assert.ok(used.has(d.id), `${d.id} never appears in a stretch`);
});

test('bosses summon Order footmen, except in the City of Echoes and the Core, where Hollows answer', () => {
  assert.equal(Logic.minionId({ chapter: 'act1' }), 'order_footman');
  assert.equal(Logic.minionId({ chapter: 'act3' }), 'order_footman');
  assert.equal(Logic.minionId({ chapter: 'act2' }), 'hollow_shade');
  assert.equal(Logic.minionId({ chapter: 'core' }), 'hollow_shade');
  assert.equal(Logic.minionId({ mode: 'trials' }), 'order_footman');
});
