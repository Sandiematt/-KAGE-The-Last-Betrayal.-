#!/bin/bash
# usage: gs.sh "query" outname [ms]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
OUT=$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/render/$2)
timeout 45 "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,800 --timeout=${3:-6000} --screenshot="$OUT" "http://localhost:5317/.scratch/render/game.html?$1" 2>&1 | grep -c written
