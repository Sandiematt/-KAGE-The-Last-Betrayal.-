const { openFight } = require('../../tests/helpers/spar-pilot');
for (const [stage, gap] of [['act1.boss', 150], ['act1.boss', 260], ['act2.boss', 150], ['act3.boss', 150], ['act1.sub1', 150], ['act2.sub2', 150]]) {
  const F = openFight(stage).ready(gap);
  let reads = 0, cd = 0, hits = 0, hp = F.p.hp;
  F.run(480, i => { if (i % 20 === 0) F.tap('jump'); const c = F.e.ai.cds.spamRead || 0; if (c > cd + 1) reads++; cd = c; if (F.p.hp < hp) { hits++; hp = F.p.hp; } });
  console.log(stage, gap, 'reads', reads, 'hits on kage', hits);
}
