# hair-design

Yūrei's long silver-white hair tied in a bun and Mugen's long flowing spectral hair, designed in Godot 4.7 before they
went into the game. `Design.gd` builds Kage's head and shoulders with the game's own head outline, hair outlines, cloth
chain (KsChain), strand fan (`_kaFan`) and lock widths (`_ksRibbon`), and maps the lock shaders in `shaders/` along every
lock. The game draws the same locks with the same textures (`src/js/21-characters/kage/armory/hair.js`).

- `shaders/silver_lock.gdshader`: silver-white strands, a sheen rippling down the lock, a frayed blue-tinted tip
- `shaders/spectral_lock.gdshader`: violet burning edges, energy threads flowing root to tip, the tip breaking into light

Run from the repo root (a window opens for a few seconds; headless can't render):

```
G="$(ls -d "$LOCALAPPDATA"/Microsoft/WinGet/Packages/GodotEngine.GodotEngine_*/)Godot_v4.7.2-stable_win64_console.exe"
"$G" --path godot/hair-design --resolution 320x240 -- --mode=design    # .scratch/hair-design/<style>_design.png, _hero.png
"$G" --path godot/hair-design --resolution 320x240 -- --mode=bake      # .scratch/hair-design/raw/*.png
python -I tools/hair-design/pack.py --preview                         # src/img/hair_*.webp + src/js/34c-hair-sheets.js
```

`-- --only=yurei` designs one style. Strip sizes, frame counts and fps are in `Design.gd` (`_bake_all`) and `pack.py`
(`SHEETS`); keep them in sync.
