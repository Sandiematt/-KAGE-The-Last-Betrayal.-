#!/bin/bash
# usage: one.sh foe runs bot...
cd /e/PROJECTS/KAGE/KAGE
foe=$1; runs=$2; shift 2
for b in "$@"; do ( node tools/duel.js --foe $foe --bot $b --runs $runs | sed -n 1,3p | sed "s/^/[$foe $b] /" > .scratch/combat-act1/one-$foe-$b.txt ) & done; wait
for b in "$@"; do grep -E "Kage wins" .scratch/combat-act1/one-$foe-$b.txt | sed "s/^/[$foe $b]/"; done
