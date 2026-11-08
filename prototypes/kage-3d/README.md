# Kage in 3D: Godot-designed character, Three.js renderer, 2D backdrop

A standalone test of the look for the KAGE game: Kage as a toon-shaded **3D** character, designed, rigged and
animated in **Godot 4.7** (`godot/kage/`), exported to glTF and rendered with **Three.js r170** in front of the game's
flat **2D** painted backdrop. It does not touch the shipped game (`build.mjs` only reads `src/`).

## Run it

ES modules need an HTTP server; opening the file directly will not load them. From the repository root:

```bash
python -m http.server 5317
```

Then open http://localhost:5317/prototypes/kage-3d/. Three.js loads from the jsDelivr CDN.

| Control | Action |
|---|---|
| `1`, Idle | the battle stance (breathing) |
| `2`, Walk | walk in place while the 2D backdrop scrolls past (true parallax per layer) |
| `3` / `Space`, Slash | wind-up over the right shoulder, the cut, follow-through, back to stance |
| `E`, Neutral / Focused / Awakened | the eye expressions of the sheet (white, narrowed, red) |
| `T`, Turntable | spin him, to see him in the round |
| `O`, Outlines | toggle the ink outlines |
| drag / wheel | orbit and zoom (limited so the flat backdrop keeps facing the camera) |

URL parameters, for screenshots: `?anim=idle|walk|slash&t=0.38` freezes that moment, `&yaw=-60` turns him,
`&orbit=30` swings the camera, `&zoom=2&ty=1.5` frames closer and higher, `&eyes=awakened`, `&outline=0`.

## The pipeline

1. **Godot** (`godot/kage/`, see its README): the character is built in GDScript, one file per body part, skinned to
   a rig with cloth chains, painted textures, and idle / walk / slash baked from pose data with arm IK. One command
   exports `assets/kage.glb`.
2. **Three.js** (`src/`):
   - `kage/kage.js` loads the `.glb` (`GLTFLoader`), swaps each material by name for a `MeshToonMaterial` with a
     3-step gradient and a crimson rim (`core/toon.js`), adds the outer cloak's red lining, plays the clips on an
     `AnimationMixer` with crossfades, and sets the eye expression.
   - `kage/spring-bones.js` swings the cloth chains (coat, scarf tails, apron, tassels): inertia, a pull back to rest,
     gravity and wind, with collision spheres on the hips and legs, after the mixer has posed the body.
   - `main.js` renders through `OutlineEffect` (ink outlines that follow skinning and blend shapes); the backdrop,
     petals, shadow and trail are excluded from outlines.
   - `background/layers.js` paints the 2D stage (sky and red moon, clouds, mountains, pagoda ridge, town, torii,
     floor) on planes at true depths; `background/petals.js`; `fx/slash-trail.js` the sword's smear.

## Why Three.js (and Godot)

Godot is the design tool: a real engine scene with a skeleton, skinning, blend shapes and an animation player, that
can be opened, previewed and re-exported. Three.js is the runtime for the web game: it loads Godot's glTF directly and
mixes 3D characters with flat 2D art in one WebGL scene. PixiJS is 2D only and Anime.js is a tweening library.
