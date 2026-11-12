# armor-glow

Looping glow sprite sheets for the Kage armors, baked in Godot 4.7 (halo, flame_violet, flame_crimson, lightning_gold,
wisp_pale). Each effect is a `canvas_item` shader in `shaders/` driven by `phase` (0..1 over the loop, so loops are
seamless; lightning is per-frame random). `Bake.gd` renders 2x supersampled frames offscreen and tiles them into raw PNG
sheets; `tools/armor-glow/pack.py` box-filters to 1x, writes `src/img/armor_glow_*.webp` and
`src/js/34b-armor-glow-sheets.js`.

Re-bake (from the repo root; Godot's `--headless` can't render, so a window pops up for a few seconds):

```
G="$(ls -d "$LOCALAPPDATA"/Microsoft/WinGet/Packages/GodotEngine.GodotEngine_*/)Godot_v4.7.2-stable_win64_console.exe"
"$G" --path godot/armor-glow --resolution 256x256 --fixed-fps 30
python -I tools/armor-glow/pack.py --preview
```

- `-- --only=halo,wisp_pale` bakes a subset; `-- --out=ABSOLUTE_DIR` changes the raw PNG dir
  (default `.scratch/armor-glow/raw`, which pack.py reads).
- `pack.py --preview` also writes contact sheets (1x sheet, 3-frame zoom, loop seam) over `#1a0d14` into
  `.scratch/armor-glow/`; `--no-write` makes previews only; `--quality N` sets the WebP quality (default 85).
- Cell sizes, frame counts, fps and origins live in `Bake.gd` (EFFECTS) and `pack.py` (SHEETS); keep them in sync.
