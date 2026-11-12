#!/bin/bash
# usage: sweep.sh <extra args> ; prints one line per foe/bot
cd /e/PROJECTS/KAGE/KAGE
FOES=${FOES:-"kuroe garan hisame shiden"}
BOTS=${BOTS:-"fighter masher turtle"}
RUNS=${RUNS:-12}
for f in $FOES; do for b in $BOTS; do
  ( node tools/duel.js --foe $f --bot $b --runs $RUNS "$@" | head -4 | sed "s/^/[$f $b] /" > .scratch/combat-act1/out-$f-$b.txt 2>&1 ) &
done; done; wait
for f in $FOES; do for b in $BOTS; do cat .scratch/combat-act1/out-$f-$b.txt; done; done
