#!/bin/bash
# usage: s2.sh "query" outname   (ak2.html: the live Akari fight, one move run and frozen after `steps`)
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-t2)"
timeout 280 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=1400,760 --virtual-time-budget=${3:-6000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/render/$2)" "http://localhost:5317/.scratch/render/ak2.html?$1&cb=$RANDOM$RANDOM" 2>&1 | grep -ci written
