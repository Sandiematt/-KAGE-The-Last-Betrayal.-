#!/bin/sh
# usage: sweep.sh [extra args] ; prints a compact table
cd /e/PROJECTS/KAGE/KAGE
FOES=${FOES:-"gonryu shizune moro soma young_rem hollow_rem"}
BOTS=${BOTS:-"fighter masher turtle"}
for f in $FOES; do for b in $BOTS; do
  node tools/duel.js --foe $f --bot $b --runs ${RUNS:-12} --json 1 "$@" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s.split('\n')[0]);const p=j.perRun;console.log([j.foe.padEnd(10),j.bot.padEnd(7),'W'+j.kageWins+'/L'+j.kageLosses+'/T'+j.timeouts,'t'+j.avgSeconds,'kHp'+j.kageHpLeft,'fHp'+j.foeHpLeft,'kPar'+p.kageParries,'fPar'+p.foeParries,'kCr'+p.kageCrits,'fCr'+p.foeCrits,'fBrk'+p.foeBroken,'kBrk'+p.kageBroken,'spam'+p.spamPunish,'thr'+p.throws,'str'+p.styleStrings,'dF'+p.dmgToFoe,'dK'+p.dmgToKage,JSON.stringify(j.abilitiesUsed),'err'+j.errors].join(' '))})"
done; done
