#!/bin/bash
# usage: wd.sh "query" out.png
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-wd)"
timeout 120 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=1000,1000 --virtual-time-budget=${3:-6000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/witness/redo/$2)" "http://localhost:5317/.scratch/witness/redo/wd.html?$1&cb=$RANDOM$RANDOM" 2>&1 | grep -ci written
