# mugen-armor

The Mugen Armor, made from the user's card art (`source/mugen.svg`, a copy of their image.svg). Godot 4.7 loads the
SVG, keys the card's backdrop out (`shaders/key.gdshader`: only backdrop-coloured pixels next to real backdrop are
cleared, so the armour's dark violets stay solid), cuts every part with its outline from `parts.json`, unwraps the long
lock into a straight strip, and draws a design board with every part's outline, anchors and name.

`parts.json` is the source of truth: each part's outline (SVG px) and the anchor points the game pins to Kage's skeleton
(`src/js/21-characters/kage/armory/mugen.js`): the head by its eye, the pauldron and bracer by the arm's joints, the shin
guards by knee and foot, the obi and collar by the spine, the tassets by hip and knee, the coat by the cloth tail's four
corners (warped in two triangles), the halo by its centre, the charm and the lock tassel hanging down.

Run from the repo root (a window opens for a few seconds; headless can't render):

```
G="$(ls -d "$LOCALAPPDATA"/Microsoft/WinGet/Packages/GodotEngine.GodotEngine_*/)Godot_v4.7.2-stable_win64_console.exe"
"$G" --path godot/mugen-armor --resolution 320x240         # .scratch/mugen-armor/raw/* and board.png
python -I tools/mugen-armor/pack.py --preview              # src/img/mugen_parts.webp + src/js/34d-mugen-parts.js
node build.mjs
```

`pack.py --preview` also writes `.scratch/mugen-armor/parts_preview.png` (the atlas) and `reassembled.png` (every part
put back in place: it should read as the original figure). Render the result on the rig with
`node tools/render/sheet.mjs --ids kage@mugen_yoroi --poses idle,attack,guard,hit --out <png>`.
