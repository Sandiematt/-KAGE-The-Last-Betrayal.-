#!/bin/sh
# usage: f.sh bot runs  -> one summary line per foe, all four in parallel
cd /e/PROJECTS/KAGE/KAGE
bot=${1:-fighter}; runs=${2:-24}
for foe in ${FOES:-tsugumi sayo utsushi kasane}; do
  node tools/duel.js --foe $foe --bot $bot --runs $runs "${@:3}" > .scratch/combat-act2/f_${foe}.txt 2>&1 &
done
wait
for foe in ${FOES:-tsugumi sayo utsushi kasane}; do sed -n 2p .scratch/combat-act2/f_${foe}.txt | sed "s/^/$foe $bot: /"; done
