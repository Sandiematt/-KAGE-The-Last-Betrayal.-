#!/bin/bash
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
timeout 40 "$EDGE" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,720 --timeout=${3:-4000} --screenshot="$2" "http://localhost:5317/.scratch/render/game.html?$1" 2>/dev/null
