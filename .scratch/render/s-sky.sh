#!/bin/bash
# usage: s.sh harness|game "query" outname W H [budget]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
page=$1; [ "$page" = harness ] && page=harness.html || page=sky.html
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=${4:-1400},${5:-760} --virtual-time-budget=${6:-4000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/render/$3)" "http://localhost:5317/.scratch/render/$page?$2" 2>&1 | grep -c written
echo "rc=$? $3"
