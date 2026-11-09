#!/bin/bash
# usage: sh.sh "query" outname [W H]   (harness page)
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-h)"
timeout 60 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=${3:-1900},${4:-1200} --virtual-time-budget=4000 --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/render/$2)" "http://localhost:5317/.scratch/render/harness.html?$1" >/dev/null 2>&1
echo "rc=$? $2"
