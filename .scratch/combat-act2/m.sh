#!/bin/sh
# usage: m.sh foe [runs] [extra args]; prints summary lines for fighter/masher/turtle
cd /e/PROJECTS/KAGE/KAGE
foe=$1; runs=${2:-12}; shift; shift
for b in ${BOTS:-fighter masher turtle parry}; do
  node tools/duel.js --foe $foe --bot $b --runs $runs "$@" > .scratch/combat-act2/out_${foe}_$b.txt 2>&1 &
done
wait
for b in ${BOTS:-fighter masher turtle parry}; do head -5 .scratch/combat-act2/out_${foe}_$b.txt | grep -v "^$" | sed 's/ · act2.*gear 4//'; done
