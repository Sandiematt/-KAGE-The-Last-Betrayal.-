# akari-rig

Akari, the Memory Blade, built in Godot 4.7 from the user's art (`source/akari.svg`, a copy of their akari.svg).
It is not one static picture: the art is cut into separate skinned `Polygon2D` parts on a `Skeleton2D`. The hair,
scarf, coat, skirt panels and blade ribbons hang on chains of four `Bone2D`s, which a procedural
secondary-motion script swings. The blade's sakura flowers turn on their own centres and shed petals.

## Run it

Open `godot/akari-rig` in Godot 4.7 and press F5, or run `godot --path godot/akari-rig`.

| Key | Action |
|---|---|
| A / D or ← / → | walk |
| Shift | run |
| Space | jump |
| X | dash |
| T | autopilot: stand, walk, stop, run, leap, dash, on a loop |
| M | mesh and bone overlay (every triangle and internal vertex, deformed live) |

Add `-- --auto` and/or `-- --mesh` to the command line to start with either one switched on.

## Rebuild from the art

```
python tools/akari-rig/build.py             # cut -> import -> build scenes/akari.tscn
python tools/akari-rig/build.py --record    # ...and record the autopilot demo to .scratch/akari-rig/akari_demo.mp4/.gif
```

The script finds Godot from `GODOT`, or else from its winget install folder.

1. **`tools/akari-rig/cut.py`** keys the backdrop out of the SVG. Every VTracer path has one flat fill. The red sky,
   pagodas, floor and moon paths are recoloured black in one copy and white in another, Godot rasterises both, and
   the difference gives an exact alpha matte. It then cuts the parts in `rig.json`. Each pixel belongs to the
   front-most part whose outline holds it. Where a part slides under one in front of it (the coat under the staff,
   the hair under the shoulder, the legs under the skirt), the hidden pixels are inpainted from the part's own
   pixels, so nothing tears open when the cloth moves. It lifts the flowers off the blade and inpaints the blade
   under them. Finally it meshes every part (a dense outline plus a grid of internal vertices, Delaunay) and skins
   it: chain parts are weighted along their bones, blended across chains and pinned to the parent bone at the root;
   rigid parts are weighted to one bone. It writes `art/parts/*.png`, `art/flowers/*.png`, `art/petal.png`,
   `art/akari_rig.json`, plus `.scratch/akari-rig/board.png` (each part tinted, with its triangles and bones) and
   `reassembled.png` (all parts put back together, which should look like the original).
2. **`build/build_akari.gd`** (headless) turns the JSON into `scenes/akari.tscn`.

`rig.json` is the source of truth. All coordinates are SVG px.

- **parts** are listed back to front. A part's outline is loose where it borders the backdrop or slides under a
  higher part, and exact where a lower part shows next to it.
- **chains** give each bone chain's five joint points (four bones).
- **bones** are the body skeleton.
- **flowers** give each spinning flower's centre, radius and turning speed.
- **drop** boxes clear backdrop marks the colour key can't tell apart.

## The scene

```
Akari (CharacterBody2D, scripts/Akari.gd: movement + procedural stride, bob, lean, breathing)
  Collision
  Visual (draw scale 0.5; mirrored to face right: the art faces left)
    Rig (puts her feet on the body's origin)
      Skeleton2D
        hips > torso > head > hair_top_0..3, hair_low_0..3
                     > staff > ribbon_l_0..3, ribbon_r_0..3, Flower_* (FlowerSpin), Petals (CPUParticles2D)
                     > scarf_0..3
             > leg_f_up > leg_f_low,  leg_b_up > leg_b_low
             > coat_top_0..3, coat_low_0..3, dress_f_0..3, dress_m_0..3, dress_r_0..3
      Parts  (skinned Polygon2Ds, back to front)
        hair 243 verts (95 internal), 2 chains | leg_back 2 bones | coat 203 (103), 2 chains
        leg_front 2 bones | dress 269 (154), 3 chains | scarf 84 (8), 1 chain | head | body (torso, arms,
        staff, blade) | ribbon 2 chains
  SecondaryMotion  (one SecondaryMotionChain per chain: hair_top, hair_low, scarf, coat_top, coat_low,
                    dress_f, dress_m, dress_r, ribbon_l, ribbon_r)
```

Parts that span two or three chains (hair, coat, dress, ribbon) are weighted across them by distance. A vertex
between two chains blends both, so the cloth fans and twists instead of moving as one stiff flap.

## Secondary motion (`scripts/SecondaryMotionChain.gd`)

Each `_physics_process(delta)` tick, every bone of the chain springs towards a target angle that adds three things:

- **rest**: the angle the art was drawn at, relative to the bone's parent, so the chain follows the body;
- **wind**: `amplitude * lerp(1, tip_gain, t) * gust * sin(TAU * frequency * time - i * phase_step)`, a sine wave
  that travels from the attachment out to the tip;
- **inertia**: the inverse velocity `(-velocity.x, -velocity.y)`, mapped into skeleton space and crossed with the
  bone's direction. It pushes each bone the way air drag would, so the cloth trails behind her while she moves.

The spring is `spin += (k * error - 2 * damping_ratio * sqrt(k) * spin) * delta`. Stiffness falls from the root
to the tip, so the tip lags and whips. Damping below 1 lets the cloth swing past rest once or twice when she stops,
then settle. The springs run on each bone's angle in skeleton space, so a bone also lags behind its parent when the
body turns, leans or bobs. Every number is an export on the node. The per-chain values the build sets are in
`FEEL` in `build/build_akari.gd`.

`scripts/FlowerSpin.gd` turns each flower at its own speed and direction, faster the faster she moves, with a soft
size pulse. The two blade flowers half-hidden behind leaves are drawn as scaled copies of the complete big one, so
nothing missing turns into view.

## Limits

- When the cloth swings far (a full run), a few inpainted pixels from under the staff or scarf can show as a
  slightly smudged edge. The `max_drag_angle` and `velocity_influence` values in `FEEL` keep that small.
- The legs are cut from one standing pose. The stride is a swing at the hip and a bend at the knee, under the skirt.

## In the web game

The game's boss Akari is drawn from the same art. `game_rig.json` cuts it a little differently: the arm and the scythe
are separate parts, so her weapon can swing. The torso is cut without them (the chest under the arm and staff is
inpainted). The near arm is an upper arm, a forearm and a fist that turns with the staff. The scythe is a staff and a
head, so the head can fly off on her chain.

```
python tools/akari-rig/game.py --preview    # src/img/akari_parts.webp + src/js/34e-akari-parts.js (+ .scratch previews)
node build.mjs
```

`src/js/21-characters/bosses/akari/art.js` poses the rig on her fighter skeleton every frame:

- **Body:** the spine turns the hips and chest, and the neck turns the head.
- **Legs:** two-bone IK to her feet.
- **Near arm:** the game's arm pose at the art's arm length. The far arm is the same pieces again, darker, behind her.
- **Scythe:** in the fist, along her weapon. AkariRig's swing clips in `64-akari-rig.js` set the weapon pose.
- **Hair and cloth:** the spring chains from `SecondaryMotionChain.gd`, ported. The skirt panels also follow the leg in
  front of them.

The figure renders once per frame into an offscreen canvas, and every body pass stamps that image, tinted on the
flat passes.

Her attacks get a drawing layer on top of the same moves and timing:

- The wind-up coils the scythe back past her shoulder, held under the tell while her eye flares into a streak.
- Each cut starts `AK_LEAD` (three frames) before its hit, so the blade is through the target when the hit-stop
  freezes the frame. The blade drives on past the target and recoils.
- The chest leans back on the wind-up and is thrown through on the cut.
- The blade leaves pink afterimages along its arc.
