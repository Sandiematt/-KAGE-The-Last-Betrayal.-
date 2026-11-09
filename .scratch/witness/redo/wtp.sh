#!/bin/bash
# usage: wtp.sh "query" out.png [virtual ms]  (the live fight, own Edge profile per output so runs can go in parallel)
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-wtp-$(basename $2 .png))"
timeout 400 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=1280,720 --virtual-time-budget=${3:-8000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/witness/redo/$2)" "http://localhost:5317/.scratch/render/wt.html?$1&cb=$RANDOM$RANDOM" 2>&1 | grep -ci written
