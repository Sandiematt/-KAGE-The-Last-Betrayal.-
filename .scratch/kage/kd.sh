#!/bin/bash
# usage: kd.sh "query" out.png [WxH]
cd /e/PROJECTS/KAGE/KAGE && node build.mjs >/dev/null && node .scratch/kage/kdgen.mjs >/dev/null
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-kd)"
timeout 120 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=${3:-1680,1320} --virtual-time-budget=8000 --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/kage/$2)" "file:///E:/PROJECTS/KAGE/KAGE/.scratch/kage/kd.html?$1&cb=$RANDOM" 2>&1 | grep -ci written
