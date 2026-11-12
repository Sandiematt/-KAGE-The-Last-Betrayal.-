#!/bin/sh
# usage: all.sh [extra args]   prints fighter/masher/turtle for the four act2 subs
cd /e/PROJECTS/KAGE/KAGE
for foe in ${FOES:-tsugumi sayo utsushi kasane}; do
  for bot in ${BOTS:-fighter masher turtle}; do
    node tools/duel.js --foe $foe --bot $bot --runs ${RUNS:-8} "$@" | head -4 &
  done
  wait
done
