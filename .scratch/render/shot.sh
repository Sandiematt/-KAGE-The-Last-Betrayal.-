#!/bin/bash
# usage: shot.sh "query" out.png [w h]
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
W=${3:-1920}; H=${4:-1200}
"$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=$W,$H --virtual-time-budget=4000 --screenshot="$2" "http://localhost:5317/.scratch/render/harness.html?$1" 2>/dev/null
