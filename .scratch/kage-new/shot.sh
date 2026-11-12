#!/bin/bash
# usage: shot.sh <file-relative-to-kage-new>[?query] out.png [W,H]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
UD="$(cygpath -w /c/Users/sande/AppData/Local/Temp/claude/edge-kn)"
timeout 120 "$EDGE" --headless=new --user-data-dir="$UD" --no-first-run --enable-unsafe-swiftshader --use-angle=swiftshader --hide-scrollbars --window-size=${3:-1536,1024} --virtual-time-budget=${4:-6000} --screenshot="$(cygpath -w /e/PROJECTS/KAGE/KAGE/.scratch/kage-new/$2)" "file:///E:/PROJECTS/KAGE/KAGE/.scratch/kage-new/$1" 2>&1 | grep -ci written
