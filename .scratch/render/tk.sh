#!/bin/bash
# usage: tk.sh "query" outname [virtual-time ms]   (tk.html: the live Takashi fight, one move run and frozen)
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-tk)"
timeout 280 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=1280,720 --virtual-time-budget=${3:-8000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/render/$2)" "http://localhost:5317/.scratch/render/tk.html?$1&cb=$RANDOM$RANDOM" 2>&1 | grep -ci written
