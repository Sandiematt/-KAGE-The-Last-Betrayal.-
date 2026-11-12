const { openFight } = require('../../tests/helpers/spar-pilot');
const F = openFight('act1.boss').ready(150);
const s = F.s; let reads = 0;
const o = F.e.ai.spamPunish.bind(F.e.ai);
F.e.ai.spamPunish = (p, r) => { const ok = o(p, r); console.log('spamPunish try', r.key, r.streak, '->', ok, 'state', F.e.state, 'cd', F.e.ai.cds.spamRead); return ok; };
const log = [];
F.run(480, i => {
  if (i % 20 === 0) F.tap('jump');
  if (i % 30 === 0) log.push(`${i}: kage ${F.p.state} hp ${Math.round(F.p.hp)} | raikon ${F.e.state}${F.e.abil ? ':abil' : ''} dist ${Math.round(Math.abs(F.e.x - F.p.x))} phase ${s.phase}`);
});
console.log(log.join('\n'));
