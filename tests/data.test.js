'use strict';
// Referential integrity of the data tables: every id one table uses must exist in the table it points at,
// so removing or renaming an enemy, weapon or arena can never leave a stage, survival wave or shop item
// pointing at nothing (which crashes the fight or the Armory in the browser).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource } = require('./helpers/load-logic');

const { Logic, ENEMIES, WEAPONS, HELMETS, ARMORS, SURVIVAL } = loadLogic();
// Names declared as `  key: {` at the top level of an object literal in a non-pure module.
const keysOf = (file, objName) => {
  const src = moduleSource(file), start = src.indexOf(`const ${objName} = {`);
  const body = src.slice(start, src.indexOf('\n};', start));
  return [...body.matchAll(/^ {2}([A-Za-z_]+):\s*\{/gm)].map(m => m[1]);
};
const AI_PROFILES = keysOf('40-ai.js', 'AI_PROFILES');
const BOSS_ABILITIES = keysOf('40-ai.js', 'BOSS_ABILITIES');
const ARENAS = keysOf('50-world.js', 'ENVS');

test('every combat stage fights an enemy that exists, of the right weight class; scenes fight nobody', () => {
  const type = { stretch: 'regular', subboss: 'sub', spar: 'sub', echo: 'sub', boss: 'boss' };
  for (const st of Logic.stages()) {
    if (st.kind === 'scene') { assert.equal(st.enemy, undefined, st.id); continue; }
    assert.ok(ENEMIES[st.enemy], `${st.id} -> ${st.enemy}`);
    assert.equal(ENEMIES[st.enemy].type, type[st.kind], `${st.id} uses a ${ENEMIES[st.enemy].type} rig`);
  }
});

test('every chapter and stage arena exists', () => {
  assert.ok(ARENAS.length >= 3);
  for (const ch of Logic.chapters()) {
    assert.ok(ARENAS.includes(ch.env), `${ch.id} -> ${ch.env}`);
    for (const st of ch.stages) assert.ok(ARENAS.includes(Logic.stageConfig(Logic.defaultSave(), st.id).env), st.id);
  }
});

test('survival only sends enemies and arenas that exist', () => {
  for (const id of [...SURVIVAL.pool, ...SURVIVAL.bosses]) assert.ok(ENEMIES[id], id);
  for (const env of SURVIVAL.envs) assert.ok(ARENAS.includes(env), env);
  assert.ok(SURVIVAL.bosses.every(id => ENEMIES[id].type !== 'regular'), 'every 5th wave is a sub-boss');
});

test('every enemy uses a weapon, AI profile and boss abilities that exist', () => {
  for (const [id, d] of Object.entries(ENEMIES)) {
    assert.ok(WEAPONS[d.weapon], `${id} weapon ${d.weapon}`);
    assert.ok(AI_PROFILES.includes(d.ai), `${id} ai ${d.ai}`);
    const abilities = [...(d.abilities || []), ...(d.phases || []).flatMap(p => p.abilities)];
    for (const a of abilities) assert.ok(BOSS_ABILITIES.includes(a), `${id} ability ${a}`);
    if (d.type === 'boss') assert.equal((d.phases || []).length, 3, `${id} has three phases`);
  }
});

test('gear marked exclusive is either locked outright or names an enemy that exists', () => {
  for (const table of [WEAPONS, HELMETS, ARMORS]) for (const [id, it] of Object.entries(table)) {
    if (it.exclusive == null || it.exclusive === true) continue;
    assert.ok(ENEMIES[it.exclusive], `${id} is a trophy of missing enemy ${it.exclusive}`);
  }
});

test('trophies from removed bosses cannot be bought', () => {
  const s = Logic.defaultSave(); s.coins = 1e9; s.gems = 1e9;
  for (const [kind, id] of [['weapons', 'dragon_spear'], ['helmets', 'hollow_crest'], ['armors', 'colossus_plate']]) {
    assert.equal(Logic.buyItem(s, kind, id), false, id);
    assert.equal(s.owned[kind][id], undefined);
  }
});
